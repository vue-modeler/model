import { ActionError } from './error/action-error'
import { ActionInternalError } from './error/action-internal-error'
import { ActionStatusConflictError } from './error/action-status-conflict-error'
import { ActionUnexpectedAbortError } from './error/action-unexpected-abort-error'
import { ProtoModel } from './proto-model'
import { Action, ActionStateName, Model, OriginalMethodWrapper } from './types'

const isAbortError = (originalError: unknown): boolean => (originalError instanceof DOMException
  && originalError.name === 'AbortError')
  || (typeof originalError === 'object' && originalError !== null && 'message' in originalError && originalError.message === 'canceled')

interface ActionPendingValue {
  promise: Promise<void>
  abortController: AbortController
}

type ActionValue = ActionPendingValue | ActionError | null

/**
 * We should to use here `<T extends ProtoModel>` because 
 * we need some methods from `ProtoModel` class which are protected in context of `Model<T>`.
 * For example, `setActionState` method.
 * @see `ProtoModel.setActionState`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class ActionInner<T extends ProtoModel, Args extends any[] = unknown[]> {
  static readonly actionFlag = Symbol('__action_original_method__')
  static readonly possibleState = {
    pending: 'pending',
    error: 'error',
    lock: 'lock',
    ready: 'ready',
    abort: 'abort',
  } as const

  static abortedByLock = Symbol('lock')

  readonly name: string
  protected _state: ActionStateName = ActionInner.possibleState.ready
  protected _value: ActionValue = null
  protected _args: Args | null = null

  constructor (
    protected _model: T, // TODO: thing about this arg, it may be potential problem
    protected actionFunction: OriginalMethodWrapper<Args>,
  ) {
    const name = actionFunction.name

    const isModelMethod = name in this._model 
      && typeof this._model[name as keyof T] === 'function'
    
      if (!isModelMethod) {
      throw new ActionInternalError(`Model does not contain method ${name}`)
    }

    if (typeof actionFunction[ActionInner.actionFlag] !== 'function') {
      throw new ActionInternalError(`Method ${name} is not action`)
    }

    this.name = name
  }

  toString (): string {
    return this.name
  }

  get owner (): Model<T> {
    return this._model as Model<T>
  }

  get possibleStates (): ActionStateName[] {
    return Object.values(ActionInner.possibleState)
  }

  get state (): ActionStateName {
    return this._state
  }

  protected set state (newState: ActionStateName) {
    this._state = newState

    // Args of action are not important for setActionState method
    this._model.setActionState(this as unknown as Action<T>)
  }

  get abortController (): null | AbortController {
    if (this.isPending) {
      return (this._value as ActionPendingValue).abortController
    }

    return null
  }

  // TODO: add tests
  get args (): Args | never[] {
    return this._args || []
  }

  get promise (): null | Promise<void> {
    if (this.isPending) {
      return (this._value as ActionPendingValue).promise
    }

    return null
  }

  get error (): null | ActionError {
    if (this.isError) {
      return this._value as ActionError
    }

    return null
  }

  get abortReason (): unknown {
    if (this.isAbort) {
      return (this._value as ActionPendingValue).abortController.signal.reason as unknown
    }

    return null
  }

  get isPending (): boolean {
    return this.state === ActionInner.possibleState.pending
  }

  get isError (): boolean {
    return this.state === ActionInner.possibleState.error
  }

  get isReady (): boolean {
    return this.state === ActionInner.possibleState.ready
  }

  get isLock (): boolean {
    return this.state === ActionInner.possibleState.lock
  }

  get isAbort (): boolean {
    return this.state === ActionInner.possibleState.abort
  }

  is (...args: ActionStateName[]): boolean {
    return !!args.find((state) => this.state === state)
  }

  /**
   * Put into action in PENDING state  
   */
  exec (...args: Args): Promise<void> {
    if (this.is(ActionInner.possibleState.lock, ActionInner.possibleState.pending)) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        ActionInner.possibleState.pending,
      )
    }

    const newArgs = [...args]
    let abortController = args.length && args[args.length - 1] as AbortController | undefined

    if (!(abortController instanceof AbortController)) {
      abortController = new AbortController()
      newArgs.push(abortController)
    }

    // IMPORTANT:
    // The action should set a pending state before calling the source method
    // to block recursive calls.  Since the action status is already pending,
    // a recursive call will result in an action status conflict error with message:
    // "Try to change someActionName status from pending to pending"
    this.state = ActionInner.possibleState.pending
    this._args = args

    const originalMethod = this.actionFunction[ActionInner.actionFlag]
    const result = originalMethod.apply(this.owner, newArgs)

    // Result can be not a promise.
    // But exec must return promise.
    // So we need to check it and wrap result in promise.
    if (!(result instanceof Promise)) {
      this.state = ActionInner.possibleState.ready

      return Promise.resolve()
    }

    const actionPromise = result
      .then(() => {
        this.ready()
      })
      .catch((originalError: unknown) => {
        const shouldThrowAsIs = originalError instanceof ActionInternalError
          || originalError instanceof RangeError
          || originalError instanceof ReferenceError
          || originalError instanceof SyntaxError
          || originalError instanceof TypeError
          || originalError instanceof URIError
          || originalError instanceof EvalError
        
        if (shouldThrowAsIs) {
          throw originalError
        }

        const isAbort = isAbortError(originalError)

        if (isAbort && !this.is(ActionInner.possibleState.pending, ActionInner.possibleState.lock)) {
          throw new ActionUnexpectedAbortError(this.name, this.state)
        }

        const isAbortedForLock = isAbort
          && (this._value as ActionPendingValue).abortController instanceof AbortController
          && (this._value as ActionPendingValue).abortController.signal.reason === ActionInner.abortedByLock

        if (isAbortedForLock) {
          this.state = ActionInner.possibleState.lock
          this._value = null

          return
        }

        if (isAbort) {
          this.state = ActionInner.possibleState.abort
          
          return
        }

        // If an action throws an error, we wrap it in an ActionError and
        // store it as the action's state.
        // For this reason external try|catch will not work.
        // To handle an error outside the model or in the parent action,
        // you should use "if" statement after waiting for the action promise
        // or use "watcher" by the action state.
        // 
        // Example:
        //      
        // await model.someAction.exec()
        // if (model.someAction.error?.cause) {
        //   handleError(model.someAction.error?.cause)
        //   return
        // }
        //
        // or
        //
        // watch(
        //  () => model.someAction.error,
        //  (error) => {
        //    if (!error) {
        //      return
        //    }
        //    handleError(error.cause)
        //  }
        // )
        this.setError(new ActionError(this.name, { cause: originalError as Error }))
      })
      
    this._value = {
      promise: actionPromise,
      abortController,
    }

    return actionPromise
  }

  // Returns same promise as exec method
  // but in reject state
  // So, any code awaiting promise from exec will be rejected
  abort (reason?: unknown): Promise<void> {
    if (!this.isPending) {
      return Promise.resolve()
    }

    (this._value as ActionPendingValue).abortController.abort(reason)

    return (this._value as ActionPendingValue).promise
  }
    
  lock (): Promise<void> {
    if (this.isPending) {
      return this.abort(ActionInner.abortedByLock)
    }

    this.state = ActionInner.possibleState.lock
    this._value = null

    return Promise.resolve()
  }

  unlock (): this {
    if (!this.isLock) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        ActionInner.possibleState.ready,
      )
    }

    return this.ready()
  }

  protected setError (error: ActionError): this {
    if (!this.isPending) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        ActionInner.possibleState.error,
      )
    }

    this.state = ActionInner.possibleState.error
    this._value = error

    return this
  }

  protected ready (): this {
    this.state = ActionInner.possibleState.ready

    return this
  }

  resetError (): this {
    if (!this.error) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        ActionInner.possibleState.ready,
      )
    }

    return this.ready()
  }
}
