import { validateAbortState, validateErrorState, validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'
import { TestModel } from './test-model/test-model'
import { Action } from '../../action'
import { ActionError } from '../../error/action-error'

describe('Action in PENDING state', () => {
  let model: TestModel
  let action: Action

  beforeEach(() => {
    model = new TestModel()
  })

  test('goes to ERROR state when an error occurs while executing the operation', async () => {
    action = new Action(model, model.singleErrorAction)
    const promise = action.exec()
    validatePendingState(action)
    await promise

    validateErrorState(action, new ActionError(action.name, { cause: new Error() }))
  })

  test('goes to LOCK state after call lock method', async () => {
    // Action in Pending state has the promise as internal value.
    // To go into the lock state we should abort current operation and thus reject the promise.
    // That`s why we use model.nestedWithAbort. This method can be aborterd.
    action = new Action(model, model.nestedWithAbort)
    const actionPromise = action.exec()
    validatePendingState(action)
    const lockPromise = action.lock()

    expect(Object.is(actionPromise, lockPromise)).toBeTruthy()
    await actionPromise

    validateLockState(action)
  })

  test('goes to ABORT state after abort from external execution context', async () => {
    action = new Action(model, model.nestedWithAbort)
    const promise = action.exec()
    validatePendingState(action)
    const abortedPromise = action.abort('Abort for test')

    expect(Object.is(promise, abortedPromise)).toBeTruthy()

    await abortedPromise

    validateAbortState(action, 'Abort for test')
  })

  test('throws error after trying parallel call ', async () => {
    action = new Action(model, model.singleSuccessAction)
    const promise = action.exec()
    expect(() => action.exec()).toThrow('Trying to update state of singleSuccessAction from pending to pending')
    await promise
    validateReadyState(action)
  })

  test('throws error after trying unlock', async () => {
    action = new Action(model, model.singleSuccessAction)
    const promise = action.exec()
    expect(() => action.unlock()).toThrow('Trying to update state of singleSuccessAction from pending to ready')
    validatePendingState(action)
    await promise
    validateReadyState(action)
  })
})
