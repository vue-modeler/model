import { validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'
import { TestModel } from './test-model/test-model'
import { Action } from '../../action'

describe('Action in READY state', () => {
  let model: TestModel
  let action: Action

  beforeEach(() => {
    model = new TestModel()
    action = new Action(model, model.singleSuccessAction)
  })

  test('goes to PENDING state', () => {
    expect(() => action.exec()).not.toThrow()
    validatePendingState(action)
  })

  test('goes to LOCK state', () => {
    expect(() => action.lock()).not.toThrow()
    validateLockState(action)
  })

  test('throws error when trying to call unlock', () => {
    expect(() => action.unlock()).toThrow('Trying to update state of singleSuccessAction from ready to ready')
    validateReadyState(action)
  })

  test('lets to call abort without errors', () => {
    expect(() => action.abort()).not.toThrow()
    validateReadyState(action)
  })
})
