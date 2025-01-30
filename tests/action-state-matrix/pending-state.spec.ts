import { beforeEach, describe, expect, it } from 'vitest'
import { ActionError } from '../../src/error/action-error'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateAbortState, validateErrorState, validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'
import { ActionInternalError } from '../../src/error/action-internal-error'
import { ActionUnexpectedAbortError } from '../../src/error/action-unexpected-abort-error'
import { ActionStatusConflictError } from '../../src/error/action-status-conflict-error'

describe('Action in PENDING state', () => {
  let model: Model<TestProtoModel>
  
  beforeEach(() => {
    const api = createApiMock()
    model = createTestModel(api)
  })
  
  it('goes to ERROR state when an error occurs while executing the operation', async () => {
     
    const promise = model.singleErrorAction.exec()
    validatePendingState(model.singleErrorAction, [], promise)
    await promise

    validateErrorState(
      model.singleErrorAction,
      new ActionError(
        model.singleErrorAction.name,
        { cause: new Error('message') }
      )
    )
  })

  it('goes to LOCK state after call lock method', async () => {
    // Action in Pending state has the promise as internal value.
    // To go into the lock state we should abort current operation and thus reject the promise.
    // We use model.nestedWithAbort because it emulate abort by signal.
     
    const actionPromise = model.actionWithAbort.exec()
    validatePendingState(model.actionWithAbort as ActionPublic, [], actionPromise)
    const lockPromise = model.actionWithAbort.lock()

    expect(Object.is(actionPromise, lockPromise)).toBeTruthy()
    await actionPromise

    validateLockState(model.actionWithAbort as ActionPublic)
  })

  it('goes to ABORT state after abort from external execution context', async () => {
     
    const promise = model.actionWithAbort.exec()
    validatePendingState(model.actionWithAbort as ActionPublic, [], promise)
    const abortedPromise = model.actionWithAbort.abort('Abort reason')

    expect(Object.is(promise, abortedPromise)).toBeTruthy()

    await abortedPromise

    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
  })

  it('throws error after trying parallel call of exec', async () => {
     
    const promise = model.successActionWithoutArgs.exec()
    expect(() => model.successActionWithoutArgs.exec()).toThrow('Trying to update state of successActionWithoutArgs from pending to pending')
    await promise
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })

  it('throws error after trying unlock', async () => {
    const promise = model.successActionWithoutArgs.exec()
    expect(() => model.successActionWithoutArgs.unlock()).toThrow('Trying to update state of successActionWithoutArgs from pending to ready')
    validatePendingState(model.successActionWithoutArgs as ActionPublic, [], promise)
    await promise
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })

  it('throws error when trying to call resetError', async () => {
    const promise = model.successActionWithoutArgs.exec()
    expect(() => model.successActionWithoutArgs.resetError()).toThrow('Trying to update state of successActionWithoutArgs from pending to ready')
    validatePendingState(model.successActionWithoutArgs as ActionPublic, [], promise)
    await promise
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })

  it('throws error if it is an ActionInternalError', async () => {
    const promise = model.actionWithCustomError.exec(new ActionInternalError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new ActionInternalError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new ActionInternalError('message'))
  })

  it('throws error if it is an RangeError', async () => {
    const promise = model.actionWithCustomError.exec(new RangeError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new RangeError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new RangeError('message'))
  })

  it('throws error if it is an ReferenceError', async () => {
    const promise = model.actionWithCustomError.exec(new ReferenceError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new ReferenceError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new ReferenceError('message'))
  })

  it('throws error if it is an SyntaxError', async () => {
    const promise = model.actionWithCustomError.exec(new SyntaxError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new SyntaxError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new SyntaxError('message'))
  })

  it('throws error if it is an TypeError', async () => {
    const promise = model.actionWithCustomError.exec(new TypeError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new TypeError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new TypeError('message'))
  })

  it('throws error if it is an URIError', async () => {
    const promise = model.actionWithCustomError.exec(new URIError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new URIError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new URIError('message'))
  })

  it('throws error if it is an EvalError', async () => {
    const promise = model.actionWithCustomError.exec(new EvalError('message'))
    validatePendingState(
      model.actionWithCustomError as ActionPublic,
      [new EvalError('message')],
      promise
    )
    
    await expect(promise).rejects.toThrow(new EvalError('message'))
  })

  it('throws UnexpectedAbortError if state changes during await abort promise', async () => {
    const promise = model.actionWithAbort.exec()
    const abortPromise = model.actionWithAbort.abort()
    model.actionWithAbort._state  = 'ready'
    await expect(abortPromise)
      .rejects
      .toThrow(new ActionUnexpectedAbortError('actionWithAbort', 'ready'))
  })

  it('throws ActionStatusConflictError if state changes during await exec promise with error', async () => {
    const promise = model.actionWithCustomError.exec(new Error('message'))
    model.actionWithCustomError._state = 'ready'
    await expect(promise)
      .rejects
      .toThrow(new ActionStatusConflictError('actionWithCustomError', 'ready', 'error'))
  })
})
