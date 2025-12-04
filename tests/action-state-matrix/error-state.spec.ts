import { beforeEach, describe, expect, it } from 'vitest'
import { ActionError } from '../../src/error/action-error'
import { Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateErrorState, validateLockState, validatePendingState, validateReadyState } from './state-validator/state-validator'

describe('Action in ERROR state', () => {
  let model: Model<TestProtoModel>

  beforeEach(async () => {
    const apiMock = createApiMock()
    model = createTestModel(apiMock)

     
    try {
      await model.singleErrorAction.exec()
    } catch (error) {
      expect(error).toBeInstanceOf(ActionError)
    }
  })

  it('can go to PENDING state', async () => {
    const promise = model.singleErrorAction.exec()
    validatePendingState(model.singleErrorAction, [], promise)

    await promise
    validateErrorState(
      model.singleErrorAction,
      new ActionError(
        model.singleErrorAction.name,
        { cause: new Error('message') }
      )
    )
  })

  it('can go to READY state', () => {
    model.singleErrorAction.resetError()
    validateReadyState(model.singleErrorAction)
  })


  it('can go to LOCK state after calling method lock from external execution context', async () => {
    await model.singleErrorAction.lock()
    validateLockState(model.singleErrorAction)
  })

  it('throws error after trying unlock', () => {
    const oldError = model.singleErrorAction.error
    expect(() => model.singleErrorAction.unlock()).toThrow('Trying to update state of singleErrorAction from error to ready')

    expect(oldError).not.toBeNull()

    if (oldError) {
      validateErrorState(
        model.singleErrorAction,
        oldError,
      )
    }
  })

  it('does not change state after trying abort', async () => {
    const oldError = model.singleErrorAction.error

    await expect(model.singleErrorAction.abort()).resolves.toBeUndefined()

    expect(oldError).not.toBeNull()

    if (oldError) {
      validateErrorState(
        model.singleErrorAction,
        oldError,
      )
    }
  })
})
