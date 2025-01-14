import { describe, expect, test } from 'vitest'
import { action } from '../src/decorator/action'
import { ProtoModel } from '../src/proto-model'
import { createModel } from '../src/create-model'
import { Action } from '../src/action'
import { Model } from '../src/types'
import { isShallow } from 'vue'

class TestProtoModel extends ProtoModel {
  regularProperty = 'test'
  
  regularMethod(): string {
    return 'regular'
  }

  @action
  async actionMethod(): Promise<void> {
    return Promise.resolve()
  }

  get computedProperty(): string {
    return 'computed' + '1'
  }
}

describe('createModel', () => {

  test('returns shallow reactive model', () => {
    const model = createModel(new TestProtoModel())

    expect(isShallow(model)).toBeTruthy()
  })


  test('creates proxy that returns action for decorated methods', () => {
    const model = createModel(new TestProtoModel())

    expect(model.actionMethod).toBeDefined()
    expect(model.actionMethod).toBeInstanceOf(Action)
  })

  test('preserves access to regular methods', () => {
    const model = createModel(new TestProtoModel())

    expect(model.regularMethod()).toBe('regular')
  })

  test('preserves access to regular properties', () => {
    const model = createModel(new TestProtoModel())

    expect(model.regularProperty).toBe('test')
  })

  test('preserves access to computed properties', () => {
    const model = createModel(new TestProtoModel())

    expect(model.computedProperty).toBe('computed1')
  })

  test('allows setting regular properties', () => {
    const model = createModel(new TestProtoModel())

    model.regularProperty = 'modified'
    expect(model.regularProperty).toBe('modified')
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