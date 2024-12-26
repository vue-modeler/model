import { model } from '#app/modeler/model'

import { Model } from '../../../types'
import { ApiService } from '../model-methods-behavior.spec'
import { TestModel } from './test-model'

export const createTestModel = (apiMock: ApiService): Model<TestModel> => model(() => (
  new TestModel(
    apiMock,
    'readonly',
  )
))()

