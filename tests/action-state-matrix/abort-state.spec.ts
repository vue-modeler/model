import { beforeEach, describe, expect, it } from 'vitest'
import { ActionPublic, Model } from '../../src/types'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateAbortState, validateLockState, validatePendingState } from './state-validator/state-validator'

describe('Action in ABORT state', () => {
  let model: Model<TestProtoModel>

  beforeEach(async () => {
    const api = createApiMock()
    model = createTestModel(api)
    const promise = model.actionWithAbort.exec()
    await model.actionWithAbort.abort('Abort reason')
    await promise
  })

  it('goes to PENDING state', () => {
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
    expect(() => model.actionWithAbort.exec()).not.toThrow()
    validatePendingState(model.actionWithAbort as ActionPublic)
  })

  it('goes to LOCK state', () => {
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
    expect(() => model.actionWithAbort.lock()).not.toThrow()
    validateLockState(model.actionWithAbort as ActionPublic)
  })

  it('allows to call abort again without errors.', () => {
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
    expect(() => model.actionWithAbort.abort()).not.toThrow()
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
  })

  it('throws error when trying to call resetError', () => {
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
    expect(() => model.actionWithAbort.resetError()).toThrow('Trying to update state of actionWithAbort from abort to ready')
    validateAbortState(model.actionWithAbort as ActionPublic, 'Abort reason')
  })
})
