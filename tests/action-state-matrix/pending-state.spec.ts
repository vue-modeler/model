import { beforeEach, describe, expect, it } from 'vitest'
import { ActionError } from '../../src/error/action-error'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateAbortState, validateErrorState, validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'

describe('Action in PENDING state', () => {
  let model: Model<TestProtoModel>
  
  beforeEach(() => {
    const api = createApiMock()
    model = createTestModel(api)
  })

  it('goes to ERROR state when an error occurs while executing the operation', async () => {
     
    const promise = model.singleErrorAction.exec()
    validatePendingState(model.singleErrorAction)
    await promise

    validateErrorState(model.singleErrorAction, new ActionError(model.singleErrorAction.name, { cause: new Error() }))
  })

  it('goes to LOCK state after call lock method', async () => {
    // Action in Pending state has the promise as internal value.
    // To go into the lock state we should abort current operation and thus reject the promise.
    // That`s why we use model.nestedWithAbort. This method can be aborterd.
     
    const actionPromise = model.actionWithAbort.exec()
    validatePendingState(model.actionWithAbort as ActionPublic)
    const lockPromise = model.actionWithAbort.lock()

    expect(Object.is(actionPromise, lockPromise)).toBeTruthy()
    await actionPromise

    validateLockState(model.actionWithAbort as ActionPublic)
  })

  it('goes to ABORT state after abort from external execution context', async () => {
     
    const promise = model.actionWithAbort.exec()
    validatePendingState(model.actionWithAbort as ActionPublic)
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
    validatePendingState(model.successActionWithoutArgs as ActionPublic)
    await promise
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })
})
