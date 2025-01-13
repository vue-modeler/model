import { createModel } from '../../../src/create-model'

import { Model } from '../../../src/types'
import { ApiService } from '../model-methods-behavior.spec'
import { TestProtoModel } from './test-proto-model'

export function createTestModel (apiMock: ApiService): Model<TestProtoModel> {
  return createModel(
    new TestProtoModel(
      apiMock,
      'readonly',
    )
  )
}

