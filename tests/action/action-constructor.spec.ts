import { describe, expect, test } from 'vitest'
import { Action } from '../../src/action'
import { ActionInternalException } from '../../src/error/action-internal-exception'
import { OriginalMethodWrapper } from '../../src/types'
import { TestProtoModel } from './test-model/test-model'

describe('Action constructor', () => {
  test('creates new instance for decorated action method', () => {
    const model = new TestProtoModel()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)

    expect(action.isReady).toBe(true)
    expect(action.name).toBe('singleSuccessAction')
    expect(action.state).toBe(Action.state.ready)
  })

  test('throws error when method is not decorated as action', () => {
    const model = new TestProtoModel()
    expect.assertions(2)
    try {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      new Action(model, model.regularMethodWithData as never as OriginalMethodWrapper<[]>)
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalException)
      expect((error as ActionInternalException).message).toBe('Method regularMethodWithData is not action')
    }
  })

  test('throws error when method does not exist on model', () => {
    const model = new TestProtoModel()
    function someFunction(): Promise<void> {
      return Promise.resolve()
    }

    expect.assertions(2)
    try {
       
      new Action(model, someFunction as never as OriginalMethodWrapper<[]>)
    } catch (error) {
      expect(error).toBeInstanceOf(ActionInternalException)
      expect((error as ActionInternalException).message).toBe('Model does not contain method someFunction')
    }
  })

  test('initializes with correct default state', () => {
    const model = new TestProtoModel()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)

    expect(action.isPending).toBe(false)
    expect(action.isError).toBe(false)
    expect(action.isLock).toBe(false)
    expect(action.isAbort).toBe(false)
    expect(action.error).toBe(null)
    expect(action.asPromise).toBe(null)
    expect(action.asAbortController).toBe(null)
    expect(action.args).toEqual([])
  })

  test('toString returns action name', () => {
    const model = new TestProtoModel()
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const action = new Action(model, model.singleSuccessAction as OriginalMethodWrapper<[]>)

    expect(action.toString()).toBe('singleSuccessAction')
  })
})
