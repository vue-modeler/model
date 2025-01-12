import { beforeEach, describe, expect, it } from 'vitest'
import { Action } from '../../src/action'
import { validateLockState, validateReadyState } from './state-validator/state-validator'
import { TestProtoModel } from './test-model/test-model'
import { OriginalMethodWrapper } from '../../src/types'

describe('Action in LOCK state', () => {
  let action: Action
  let model: TestProtoModel

  beforeEach(async () => {
    model = new TestProtoModel()

    // eslint-disable-next-line @typescript-eslint/unbound-method
    action = new Action(model, model.singleErrorAction as OriginalMethodWrapper<[]>)
    await action.lock()
  })

  it('goes to READY state after unlock', () => {
    action.unlock()
    validateReadyState(action)
  })

  it('throws error after trying to call exec', () => {
    expect(() => action.exec()).toThrow('Trying to update state of singleErrorAction from lock to pending')
    validateLockState(action)
  })

  it('does not change state after trying abort', async () => {
    await expect(action.abort()).resolves.toBeUndefined()
    validateLockState(action)
  })
})
