import { validateErrorState, validateLockState, validatePendingState } from './state-validator/state-validator'
import { TestModel } from './test-model/test-model'
import { Action } from '../../action'
import { ActionError } from '../../error/action-error'

describe('Action in ERROR state', () => {
  let model: TestModel
  let action:Action

  beforeEach(async () => {
    model = new TestModel()

    action = new Action(model, model.singleErrorAction)
    try {
      await action.exec()
    } catch (e) { }
  })

  test('goes to PENDING state', async () => {
    const action = new Action(model, model.singleErrorAction)
    const promise = action.exec()
    validatePendingState(action)

    await promise
    validateErrorState(action, new ActionError(action.name, { cause: new Error() }))
  })

  test('goes to LOCK state after calling method lock from external execution context', () => {
    action.lock()
    validateLockState(action)
  })

  test('throws error after trying unlock', () => {
    const oldError = action.asError
    expect(() => action.unlock()).toThrow('Trying to update state of singleErrorAction from error to ready')

    expect(oldError).not.toBeNull()

    if (oldError) {
      validateErrorState(
        action,
        oldError,
      )
    }
  })

  test('does not change state after trying abort', async () => {
    const oldError = action.asError

    await expect(action.abort()).resolves.toBeUndefined()

    expect(oldError).not.toBeNull()

    if (oldError) {
      validateErrorState(
        action,
        oldError,
      )
    }
  })
})
