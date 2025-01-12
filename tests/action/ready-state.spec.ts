import { validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'
import { TestProtoModel } from './test-model/test-model'
import { Action } from '../../src/action'
import { describe, expect, it } from 'vitest'
import { beforeEach } from 'vitest'
import { OriginalMethodWrapper } from '../../src/types'

describe('Action in READY state', () => {
  let model: TestProtoModel
  let action: Action

  beforeEach(() => {
    model = new TestProtoModel()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)
  })

  it('goes to PENDING state', () => {
    expect(() => action.exec()).not.toThrow()
    validatePendingState(action)
  })

  it('goes to LOCK state', () => {
    expect(() => action.lock()).not.toThrow()
    validateLockState(action)
  })

  it('throws error when trying to call unlock', () => {
    expect(() => action.unlock()).toThrow('Trying to update state of singleSuccessAction from ready to ready')
    validateReadyState(action)
  })

  it('lets to call abort without errors', () => {
    expect(() => action.abort()).not.toThrow()
    validateReadyState(action)
  })
})
