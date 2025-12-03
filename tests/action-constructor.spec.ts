import { beforeEach, describe, expect, test } from 'vitest'
import { ActionInner } from '../src/action'
import { ActionInternalError } from '../src/error/action-internal-error'
import { OriginalMethodWrapper } from '../src/types'
import { TestProtoModel } from './test-model/test-proto-model'
import { createApiMock } from './test-model/create-api-mock'

describe('Action constructor', () => {

  let protoModel: TestProtoModel

  beforeEach(() => {
    const api = createApiMock()
    protoModel = new TestProtoModel(api)
  })

  test('successfully creates action outside a model, but the action will throw error in run time', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new ActionInner(protoModel, protoModel.successActionWithoutArgs as OriginalMethodWrapper<[]>) 
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    expect(() => { action.exec() }).toThrow(new Error('Action not found'))
  })

  test('creates new instance for decorated action method with default state', () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new ActionInner(protoModel, protoModel.successActionWithoutArgs as OriginalMethodWrapper<[]>)

    expect(action.state).toBe(ActionInner.possibleState.ready)
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
  })

  test('throws error when method is not decorated as action', () => {
    expect.assertions(2)
    try {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      new ActionInner(protoModel, protoModel.normalSyncMethodWithData as never as OriginalMethodWrapper<[]>)
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalError)
      expect((error as ActionInternalError).message).toBe('Method normalSyncMethodWithData is not action')
    }
  })

  test('throws error when method does not exist on model', () => {
    function someFunction(): Promise<void> {
      return Promise.resolve()
    }

    expect.assertions(2)
    try {
       
      new ActionInner(protoModel, someFunction as never as OriginalMethodWrapper<[]>)
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalError)
      expect((error as ActionInternalError).message).toBe('Model does not contain method someFunction')
    }
  })
})
