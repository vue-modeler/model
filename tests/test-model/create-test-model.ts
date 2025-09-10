
import { Model } from '../../src/types'
import { TestProtoModel, ApiService } from './test-proto-model'

export const createTestModel = (apiMock: ApiService): Model<TestProtoModel> => TestProtoModel.model(apiMock, 'readonly')


