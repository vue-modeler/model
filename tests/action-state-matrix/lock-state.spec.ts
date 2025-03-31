import { beforeEach, describe, expect, it } from 'vitest'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateLockState, validateReadyState } from './state-validator/state-validator'

describe('Action in LOCK state', () => {
  let model: Model<TestProtoModel>

  beforeEach(async () => {
    const apiMock = createApiMock()
    model = createTestModel(apiMock)

    await model.singleErrorAction.lock()
  })

  it('goes to READY state after unlock', () => {
    model.singleErrorAction.unlock()
    validateReadyState(model.singleErrorAction as ActionPublic)
  })

  it('throws error after trying to call exec', () => {
    expect(() => model.singleErrorAction.exec()).toThrow('Trying to update state of singleErrorAction from lock to pending')
    validateLockState(model.singleErrorAction as ActionPublic)
  })

  it('does not change state after trying abort', async () => {
    await expect(model.singleErrorAction.abort()).resolves.toBeUndefined()
    validateLockState(model.singleErrorAction as ActionPublic)
  })

  it('throws error when trying to call resetError', () => {
    expect(() => model.singleErrorAction.resetError()).toThrow('Trying to update state of singleErrorAction from lock to ready')
    validateLockState(model.singleErrorAction as ActionPublic)
  })
})
