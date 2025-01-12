import { beforeEach, describe, it } from 'vitest'
import { Action } from '../../src/action'
import { ActionError } from '../../src/error/action-error'
import { OriginalMethodWrapper } from '../../src/types'
import { expect } from 'vitest'
import { validateErrorState, validateLockState, validatePendingState } from './state-validator/state-validator'
import { TestProtoModel } from './test-model/test-model'

describe('Action in ERROR state', () => {
  let model: TestProtoModel
  let action:Action

  beforeEach(async () => {
    model = new TestProtoModel()

     
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleErrorAction as OriginalMethodWrapper<[]>)
    try {
      await action.exec()
    } catch (error) {
      expect(error).toBeInstanceOf(ActionError)
    }
  })

  it('can go to PENDING state', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new Action(model, model.singleErrorAction as OriginalMethodWrapper<[]>)
    const promise = action.exec()
    validatePendingState(action)

    await promise
    validateErrorState(action, new ActionError(action.name, { cause: new Error() }))
  })

  it('can go to LOCK state after calling method lock from external execution context', async () => {
    await action.lock()
    validateLockState(action)
  })

  it('throws error after trying unlock', async () => {
    const oldError = action.error
    expect(() => action.unlock()).toThrow('Trying to update state of singleErrorAction from error to ready')

    expect(oldError).not.toBeNull()

    if (oldError) {
      validateErrorState(
        action,
        oldError,
      )
    }
  })

  it('does not change state after trying abort', async () => {
    const oldError = action.error

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
