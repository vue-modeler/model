import { beforeEach, describe, expect, it } from 'vitest'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'

describe('Action in READY state', () => {
  let model: Model<TestProtoModel>

  beforeEach(() => {
    const apiMock = createApiMock()
    model = createTestModel(apiMock)
  })

  it('goes to PENDING state', () => {
    expect(() => model.successActionWithoutArgs.exec()).not.toThrow()
    validatePendingState(model.successActionWithoutArgs as ActionPublic)
  })

  it('goes to LOCK state', () => {
    expect(() => model.successActionWithoutArgs.lock()).not.toThrow()
    validateLockState(model.successActionWithoutArgs as ActionPublic)
  })

  it('throws error when trying to call unlock', () => {
    expect(() => model.successActionWithoutArgs.unlock()).toThrow('Trying to update state of successActionWithoutArgs from ready to ready')
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })

  it('throws error when trying to call resetError', () => {
    expect(() => model.successActionWithoutArgs.resetError()).toThrow('Trying to update state of successActionWithoutArgs from ready to ready')
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })

  it('allows to call abort without errors', () => {
    expect(() => model.successActionWithoutArgs.abort()).not.toThrow()
    validateReadyState(model.successActionWithoutArgs as ActionPublic)
  })
})
