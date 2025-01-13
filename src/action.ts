import { ActionError } from './error/action-error'
import { ActionInternalException } from './error/action-internal-exception'
import { ActionStatusConflictError } from './error/action-status-conflict-error'
import { ActionUnexpectedAbortError } from './error/action-unexpected-abort-error'
import { NestedActionError } from './error/nested-action-error'
import { ProtoModel } from './proto-model'
import { OriginalMethodWrapper, ActionStateName } from './types'

const isAbortError = (originalError: unknown): boolean => (originalError instanceof DOMException
  && originalError.name === 'AbortError')
  || (typeof originalError === 'object' && originalError !== null && 'message' in originalError && originalError.message === 'canceled')



interface ActionPendingValue {
  promise: Promise<void>
  abortController: AbortController
}

type ActionValue = ActionPendingValue | ActionError | NestedActionError | null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export class Action<Args extends any[] = unknown[]> {
  static readonly actionFlag = Symbol('__action_original_method__')
  static readonly state = {
    pending: 'pending',
    error: 'error',
    lock: 'lock',
    ready: 'ready',
    abort: 'abort',
  } as const

  static abortedByLock = Symbol('lock')

  readonly name: string
  protected _state: ActionStateName = Action.state.ready
  protected _value: ActionValue = null
  protected _args: Args | null = null

  constructor (
    protected model: ProtoModel,
    protected actionFunction: OriginalMethodWrapper<Args>,
  ) {
    const name = actionFunction.name

    const isModelMethod = name in model && typeof (model as unknown as Record<string, unknown>)[name] === 'function'
    if (!isModelMethod) {
      throw new ActionInternalException(`Model does not contain method ${name}`)
    }

    if (typeof actionFunction[Action.actionFlag] !== 'function') {
      throw new ActionInternalException(`Method ${name} is not action`)
    }

    this.name = name
  }

  // TODO: add tests
  toString (): string {
    return this.name
  }

  // TODO: add tests
  get state (): ActionStateName {
    return this._state
  }

  get asAbortController (): null | AbortController {
    if (this.isPending) {
      return (this._value as ActionPendingValue).abortController
    }

    return null
  }

  // TODO: add tests
  get args (): Args | never[] {
    return this._args || []
  }

  get asPromise (): null | Promise<void> {
    if (this.isPending) {
      return (this._value as ActionPendingValue).promise
    }

    return null
  }

  /**
   * @deprecated use this.error
   */
  get asError (): null | ActionError {
    return this.error
  }

  get error (): null | ActionError {
    if (this.isError) {
      return this._value as ActionError
    }

    return null
  }

  get asReason (): unknown {
    if (this.isAbort) {
      return (this._value as ActionPendingValue).abortController.signal.reason as unknown
    }

    return null
  }

  get isPending (): boolean {
    return this._state === Action.state.pending
  }

  get isError (): boolean {
    return this._state === Action.state.error
  }

  get isReady (): boolean {
    return this._state === Action.state.ready
  }

  get isLock (): boolean {
    return this._state === Action.state.lock
  }

  get isAbort (): boolean {
    return this._state === Action.state.abort
  }

  is (...args: ActionStateName[]): boolean {
    return !!args.find((state) => this._state === state)
  }

  exec (...args: Args): Promise<void> {
    if (this.is(Action.state.lock, Action.state.pending)) {
      throw new ActionStatusConflictError(
        this.name,
        this._state,
        Action.state.pending,
      )
    }

    const newArgs = args
    let abortController = args[args.length - 1] as AbortController | undefined

    if (!(abortController instanceof AbortController)) {
      abortController = new AbortController()
      newArgs.push(abortController)
    }

    this._state = Action.state.pending
    this._args = args

    const originalMethod = this.actionFunction[Action.actionFlag]
    const result = originalMethod.apply(this.model, newArgs)

    if (!(result instanceof Promise)) {
      this._state = Action.state.ready

      return Promise.resolve(result)
    }

    const actionPromise = result
      .then(() => {
        this.ready()
      })
      .catch((originalError: unknown) => {
        const shouldThrowAsIs = originalError instanceof ActionInternalException
          || originalError instanceof RangeError
          || originalError instanceof ReferenceError
          || originalError instanceof SyntaxError
          || originalError instanceof TypeError
          || originalError instanceof URIError

        if (shouldThrowAsIs) {
          throw originalError
        }

        const isAbort = isAbortError(originalError)

        if (isAbort && !this.is(Action.state.pending, Action.state.lock)) {
          throw new ActionUnexpectedAbortError(this.name, this._state)
        }

        const isAbortedForLock = isAbort
          && (this._value as ActionPendingValue).abortController instanceof AbortController
          && (this._value as ActionPendingValue).abortController.signal.reason === Action.abortedByLock

        if (isAbortedForLock) {
          this._state = Action.state.lock
          this._value = null

          return
        }

        if (isAbort) {
          // TODO: need test
          this._state = Action.state.abort
          
          return
        }

        // If an action throws an error, we wrap it in an ActionError and
        // store it as the action's state.
        // Then we throw the ActionError at the next level.
        // At the highest level, error throwing  will be blocked.
        // For this reason try|catch will not work.
        // To catch an action error outside the model, we must use "if" statement
        // after waiting for the action promise or use "watcher" by the action state.
        // 
        // For example:
        //      
        // await model.someAction()
        // if (model.action(someAction).error) {
        //   handleError()
        //   return
        // }
        //
        // or
        //
        // watch(
        //  () => model.action(model.someAction.error),
        //  (error) => {
        //    if (!error) {
        //      return
        //    }
        //    handleError()
        //  }
        // )
        const actionError = originalError instanceof ActionError
          ? new NestedActionError(this.name, { cause: originalError })
          : new ActionError(this.name, { cause: originalError as Error })

        this.setError(actionError)
      })

    this._value = {
      promise: actionPromise,
      abortController,
    }

    return actionPromise
  }

  // It return same promise as exec method
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

    this._state = Action.state.lock
    this._value = null

    return Promise.resolve()
  }

  unlock (): this {
    if (!this.isLock) {
      throw new ActionStatusConflictError(
        this.name,
        this._state,
        Action.state.ready,
      )
    }

    return this.ready()
  }

  protected setError (error: ActionError | NestedActionError): this {
    if (!this.isPending) {
      throw new ActionStatusConflictError(
        this.name,
        this._state,
        Action.state.error,
      )
    }

    this._state = Action.state.error
    this._value = error

    return this
  }

  protected ready (): this {
    if (this.isError) {
      throw new ActionStatusConflictError(
        this.name,
        this._state,
        Action.state.ready,
      )
    }

    this._state = Action.state.ready

    return this
  }

  resetError (): this {
    if (!this.error) {
      throw new ActionStatusConflictError(
        this.name,
        this._state,
        Action.state.ready,
      )
    }

    this._state = Action.state.ready

    return this
  }
}
