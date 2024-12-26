import { validateLockState, validateReadyState } from './state-validator/state-validator'
import { TestModel } from './test-model/test-model'
import { Action } from '../../action'

describe('Action in LOCK state', () => {
  let action: Action
  let model: TestModel

  beforeEach(async () => {
    model = new TestModel()

    action = new Action(model, model.singleErrorAction)
    action.lock()
  })

  test('goes to READY state after unlock', () => {
    action.unlock()
    validateReadyState(action)
  })

  test('throws error after trying to call exec', () => {
    expect(() => action.exec()).toThrow('Trying to update state of singleErrorAction from lock to pending')
    validateLockState(action)
  })

  test('does not change state after trying abort', async () => {
    await expect(action.abort()).resolves.toBeUndefined()
    validateLockState(action)
  })
})
