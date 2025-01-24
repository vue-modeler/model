import { beforeEach, describe, expect, it } from 'vitest'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'

describe('Action in ABORT state', () => {
  let model: Model<TestProtoModel>

  beforeEach(async () => {
    const api = createApiMock()
    model = createTestModel(api)
    await model.successActionWithoutArgs.abort('Abort reason')
  })

  it('goes to PENDING state', () => {
    expect(() => model.successActionWithoutArgs.exec()).not.toThrow()
    validatePendingState(model.successActionWithoutArgs as ActionPublic)
  })

  it('goes to LOCK state', () => {
    expect(() => model.successActionWithoutArgs.lock()).not.toThrow()
    validateLockState(model.successActionWithoutArgs as ActionPublic)
  })

  it('allows to call abort again without errors.', () => {
    expect(() => model.successActionWithoutArgs.abort()).not.toThrow()
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })
})
