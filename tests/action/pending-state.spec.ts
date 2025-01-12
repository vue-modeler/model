import { beforeEach, describe, expect, it } from 'vitest'
import { Action } from '../../src/action'
import { ActionError } from '../../src/error/action-error'
import { validateAbortState, validateErrorState, validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'
import { TestProtoModel } from './test-model/test-model'
import { OriginalMethodWrapper } from '../../src/types'

describe('Action in PENDING state', () => {
  let model: TestProtoModel
  let action: Action

  beforeEach(() => {
    model = new TestProtoModel()
  })

  it('goes to ERROR state when an error occurs while executing the operation', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleErrorAction as OriginalMethodWrapper<[]>)
    const promise = action.exec()
    validatePendingState(action)
    await promise

    validateErrorState(action, new ActionError(action.name, { cause: new Error() }))
  })

  it('goes to LOCK state after call lock method', async () => {
    // Action in Pending state has the promise as internal value.
    // To go into the lock state we should abort current operation and thus reject the promise.
    // That`s why we use model.nestedWithAbort. This method can be aborterd.
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.nestedWithAbort as OriginalMethodWrapper<[]>)
    const actionPromise = action.exec()
    validatePendingState(action)
    const lockPromise = action.lock()

    expect(Object.is(actionPromise, lockPromise)).toBeTruthy()
    await actionPromise

    validateLockState(action)
  })

  it('goes to ABORT state after abort from external execution context', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.nestedWithAbort as OriginalMethodWrapper<[]>)
    const promise = action.exec()
    validatePendingState(action)
    const abortedPromise = action.abort('Abort for it')

    expect(Object.is(promise, abortedPromise)).toBeTruthy()

    await abortedPromise

    validateAbortState(action, 'Abort for it')
  })

  it('throws error after trying parallel call ', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)
    const promise = action.exec()
    expect(() => action.exec()).toThrow('Trying to update state of singleSuccessAction from pending to pending')
    await promise
    validateReadyState(action)
  })

  it('throws error after trying unlock', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)
    const promise = action.exec()
    expect(() => action.unlock()).toThrow('Trying to update state of singleSuccessAction from pending to ready')
    validatePendingState(action)
    await promise
    validateReadyState(action)
  })
})
