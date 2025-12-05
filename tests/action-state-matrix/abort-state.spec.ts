import { beforeEach, describe, expect, it } from 'vitest'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
import { TestProtoModel } from '../test-model/test-proto-model'
import { validateAbortState, validateLockState, validatePendingState } from './state-validator/state-validator'
import { Model } from '../../src/types'

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
    validateAbortState(model.actionWithAbort, 'Abort reason')
    const promise = model.actionWithAbort.exec()
    validatePendingState(model.actionWithAbort, promise)
  })

  it('goes to LOCK state', () => {
    validateAbortState(model.actionWithAbort, 'Abort reason')
    expect(() => model.actionWithAbort.lock()).not.toThrow()
    validateLockState(model.actionWithAbort)
  })

  it('allows to call abort again without errors.', () => {
    validateAbortState(model.actionWithAbort, 'Abort reason')
    expect(() => model.actionWithAbort.abort()).not.toThrow()
    validateAbortState(model.actionWithAbort, 'Abort reason')
  })

  it('throws error when trying to call resetError', () => {
    validateAbortState(model.actionWithAbort, 'Abort reason')
    expect(() => model.actionWithAbort.resetError()).toThrow('Trying to update state of actionWithAbort from abort to ready')
    validateAbortState(model.actionWithAbort, 'Abort reason')
  })
})
