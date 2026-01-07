import { shallowReactive } from 'vue'
import { ActionError } from './error/action-error'
import { ActionInternalError } from './error/action-internal-error'
import { ActionStatusConflictError } from './error/action-status-conflict-error'
import { ActionUnexpectedAbortError } from './error/action-unexpected-abort-error'
import { ProtoModel } from './proto-model'
import { ActionStateName, Model, OriginalMethodWrapper } from './types'

const isAbortError = (originalError: unknown): boolean => (originalError instanceof DOMException
  && originalError.name === 'AbortError')
  || (typeof originalError === 'object' && originalError !== null && 'message' in originalError && originalError.message === 'canceled')

interface ActionPendingValue {
  promise: Promise<void>
  abortController: AbortController
}

type ActionValue = ActionPendingValue | ActionError | null

/**
 * Public API interface for Action instances.
 * Describes only the public contract without implementation details.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ActionLike<T extends object, Args extends any[] = unknown[]> {
  readonly name: string
  readonly owner: Model<T>
  readonly possibleStates: ActionStateName[]
  readonly state: ActionStateName
  readonly abortController: null | AbortController
  readonly args: Args | never[]
  readonly promise: null | Promise<void>
  readonly error: null | ActionError
  readonly abortReason: unknown
  readonly isPending: boolean
  readonly isError: boolean
  readonly isReady: boolean
  readonly isLock: boolean
  readonly isAbort: boolean

  is (...args: ActionStateName[]): boolean
  validate (...args: Args): Error[]
  exec (...args: Args): Promise<void>
  abort (reason?: unknown): Promise<void>
  lock (): Promise<void>
  unlock (): this
  resetError (): this
  toString (): string
}

/**
 * We should to use here `<T extends ProtoModel>` because 
 * we need some methods from `ProtoModel` class which are protected in context of `Model<T>`.
 * For example, `setActionState` method.
 * @see `ProtoModel.setActionState`
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Action<T extends object, Args extends any[] = unknown[]> implements ActionLike<T, Args> {
  static readonly actionFlag = Symbol('__action_original_method__')
  static readonly possibleState = {
    pending: 'pending',
    error: 'error',
    lock: 'lock',
    ready: 'ready',
    abort: 'abort',
  } as const

  static readonly abortedByLock = Symbol('lock')

  readonly name: string
  protected _state: ActionStateName = Action.possibleState.ready
  protected _value: ActionValue = null
  protected _args: Args | null = null

  constructor (
    protected _model: T,
    protected actionFunction: OriginalMethodWrapper<Args>,
    protected ownerGetter: () => Model<T>,
    protected setStateCb: (
      action: ActionLike<T, Args>,
      oldState: ActionStateName,
      newState: ActionStateName,
    ) => void,
    protected _validateArgs: (
      action: ActionLike<T, Args>,
      ... args: Args
    ) => Error[],
  ) {
    const name = actionFunction.name

    const isModelMethod = name in this._model 
      && typeof this._model[name as keyof T] === 'function'
    
      if (!isModelMethod) {
      throw new ActionInternalError(`Model does not contain method ${name}`)
    }

    if (typeof actionFunction[Action.actionFlag] !== 'function') {
      throw new ActionInternalError(`Method ${name} is not action`)
    }

    this.name = name
  }


  static create<T extends ProtoModel, Args extends unknown[] = unknown[]>(
    model: T,
    actionFunction: OriginalMethodWrapper<Args>,
    ownerGetter: () => Model<T>,
    setStateCb: (
      action: ActionLike<T, Args>,
      oldState: ActionStateName,
      newState: ActionStateName,
    ) => void,
    validateArgs: (
      action: ActionLike<T, Args>,
      ... args: Args
    ) => Error[],
  ): ActionLike<T, Args> {
    
    return shallowReactive(new Action(
      model,
      actionFunction,
      ownerGetter,
      setStateCb,
      validateArgs,
    ))
  }

  toString (): string {
    return this.name
  }

  get owner (): Model<T> {
    return this.ownerGetter()
  }

  get possibleStates (): ActionStateName[] {
    return Object.values(Action.possibleState)
  }

  get state (): ActionStateName {
    return this._state
  }

  protected set state (newState: ActionStateName) {
    const oldState = this._state
    this._state = newState

    // Args of action are not important for setActionState method
    this.setStateCb(this, oldState, newState)
  }

  get abortController (): null | AbortController {
    if (this.isPending) {
      return (this._value as ActionPendingValue).abortController
    }

    return null
  }

  get args (): Args | never[] {
    return this._args ?? []
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
    return this.state === Action.possibleState.pending
  }

  get isError (): boolean {
    return this.state === Action.possibleState.error
  }

  get isReady (): boolean {
    return this.state === Action.possibleState.ready
  }

  get isLock (): boolean {
    return this.state === Action.possibleState.lock
  }

  get isAbort (): boolean {
    return this.state === Action.possibleState.abort
  }

  is (...args: ActionStateName[]): boolean {
    return args.includes(this.state)
  }

  validate(...args: Args): Error[] {
    return this._validateArgs(this, ...args)
  }
  /**
   * Put into action in PENDING state  
   */
  exec (...args: Args): Promise<void> {
    if (this.is(Action.possibleState.lock, Action.possibleState.pending)) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        Action.possibleState.pending,
      )
    }

    const newArgs = [...args]
    let abortController = args.length && args.at(-1) as AbortController | undefined

    if (!(abortController instanceof AbortController)) {
      abortController = new AbortController()
      newArgs.push(abortController)
    }

    // IMPORTANT:
    // The action should set a pending state before calling the source method
    // to block recursive calls.  Since the action status is already pending,
    // a recursive call will result in an action status conflict error with message:
    // "Try to change someActionName status from pending to pending"
    this.state = Action.possibleState.pending
    this._args = args

    const originalMethod = this.actionFunction[Action.actionFlag]
    const result = originalMethod.apply(this._model, newArgs)

    // Result can be not a promise.
    // But exec must return promise.
    // So we need to check it and wrap result in promise.
    if (!(result instanceof Promise)) {
      this.state = Action.possibleState.ready

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

        if (isAbort && !this.is(Action.possibleState.pending, Action.possibleState.lock)) {
          throw new ActionUnexpectedAbortError(this.name, this.state)
        }

        const isAbortedForLock = isAbort
          && (this._value as ActionPendingValue).abortController instanceof AbortController
          && (this._value as ActionPendingValue).abortController.signal.reason === Action.abortedByLock

        if (isAbortedForLock) {
          this.state = Action.possibleState.lock
          this._value = null

          return
        }

        if (isAbort) {
          this.state = Action.possibleState.abort
          
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
      return this.abort(Action.abortedByLock)
    }

    this.state = Action.possibleState.lock
    this._value = null

    return Promise.resolve()
  }

  unlock (): this {
    if (!this.isLock) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        Action.possibleState.ready,
      )
    }

    return this.ready()
  }

  protected setError (error: ActionError): this {
    if (!this.isPending) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        Action.possibleState.error,
      )
    }

    this.state = Action.possibleState.error
    this._value = error

    return this
  }

  protected ready (): this {
    this.state = Action.possibleState.ready

    return this
  }

  resetError (): this {
    if (!this.error) {
      throw new ActionStatusConflictError(
        this.name,
        this.state,
        Action.possibleState.ready,
      )
    }

    return this.ready()
  }
}
