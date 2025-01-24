import { createModel } from '../../src/create-model'

import { Model } from '../../src/types'
import { TestProtoModel, ApiService } from './test-proto-model'

export function createTestModel (apiMock: ApiService): Model<TestProtoModel> {
  return createModel(
    new TestProtoModel(
      apiMock,
      'readonly',
    )
  )
}

