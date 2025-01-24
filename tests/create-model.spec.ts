import { describe, expect, test } from 'vitest'
import { action } from '../src/decorator/action'
import { ProtoModel } from '../src/proto-model'
import { createModel } from '../src/create-model'
import { Action } from '../src/action'
import { Model } from '../src/types'
import { isShallow } from 'vue'

class TestProtoModel extends ProtoModel {
  regularMethod(): string {
    return 'regular'
  }
  
  @action
  async actionMethod(): Promise<void> {
    return Promise.resolve()
  }
}

describe('createModel', () => {

  test('returns shallow reactive model', () => {
    const model = createModel(new TestProtoModel())

    expect(isShallow(model)).toBeTruthy()
  })
  
  test('returns action for decorated methods', () => {
    const model = createModel(new TestProtoModel())

    const action = model.actionMethod
    expect(action).toBeDefined()
    expect(action).toBeInstanceOf(Action)
    expect(isShallow(action)).toBeTruthy()

    expect(model.regularMethod).toBeDefined()
    expect(typeof model.regularMethod).toBe('function')
  })

  test('preserves instanceof checks', () => {
    const model = createModel(new TestProtoModel())

    expect(model instanceof TestProtoModel).toBe(true)
    expect(model instanceof ProtoModel).toBe(true)
  })

  test('preserves model type', () => {
    const model = createModel(new TestProtoModel())

    // Type check
    const typedModel: Model<TestProtoModel> = model
    expect(typedModel).toBe(model)
  })
}) 