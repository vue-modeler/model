import { beforeEach, describe, expect, test } from 'vitest'
import { Action } from '../src/action'
import { ActionInternalError } from '../src/error/action-internal-error'
import { Model, OriginalMethodWrapper } from '../src/types'
import { TestProtoModel } from './test-model/test-proto-model'
import { createApiMock } from './test-model/create-api-mock'

function someFunction(): Promise<void> {
  return Promise.resolve()
}
describe('Action constructor', () => {

  let protoModel: TestProtoModel
  let model: Model<TestProtoModel>

  beforeEach(() => {
    const api = createApiMock()
    protoModel = new TestProtoModel(api)
    model = TestProtoModel.model(api, 'readonly')
  })

  test('creates new instance for decorated action method with default state', () => {
    const action = Action.create(
      protoModel,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      protoModel.successActionWithoutArgs as OriginalMethodWrapper<[]>,
      () => model,
      () => {
        // do nothing
      },
      () => {
        return []
      }
    )

    expect(action.state).toBe(Action.possibleState.ready)
    expect(action.toString()).toBe('successActionWithoutArgs')
    expect(action.name).toBe('successActionWithoutArgs')
    expect(action.isReady).toBe(true)
    expect(action.isPending).toBe(false)
    expect(action.isError).toBe(false)
    expect(action.isLock).toBe(false)
    expect(action.isAbort).toBe(false)
    expect(action.error).toBe(null)
    expect(action.abortReason).toBe(null)
    expect(action.promise).toBe(null)
    expect(action.abortController).toBe(null)
    expect(action.args).toEqual([])
    expect(action.owner).toBe(model)
  })

  test('throws error when method is not decorated as action', () => {
    expect.assertions(2)
    try {
      new Action(
        protoModel,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        protoModel.normalSyncMethodWithData as never as OriginalMethodWrapper<[]>,
        () => model,
        () => {
          // do nothing
        },
        () => {
          return []
        }
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalError)
      expect((error as ActionInternalError).message).toBe('Method normalSyncMethodWithData is not action')
    }
  })

  test('throws error when method does not exist on model', () => {
    

    expect.assertions(2)
    try {
      new Action(
        protoModel,
        someFunction as never as OriginalMethodWrapper<[]>,
        () => model,
        () => {
          // do nothing
        },
        () => {
          return []
        } 
      )
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalError)
      expect((error as ActionInternalError).message).toBe('Model does not contain method someFunction')
    }
  })
})
