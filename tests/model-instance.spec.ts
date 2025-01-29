import { describe, expect, it, test } from 'vitest'
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

describe('Model', () => {

  it('is shallow reactive', () => {
    const model = createModel(new TestProtoModel())

    expect(isShallow(model)).toBeTruthy()
  })
  
  it('preserves original methods', () => {
    const model = createModel(new TestProtoModel())

    expect(model.regularMethod).toBeDefined()
    expect(typeof model.regularMethod).toBe('function')
  })

  it('returns action for decorated methods', () => {
    const model = createModel(new TestProtoModel())

    const action = model.actionMethod
    expect(action).toBeDefined()
    expect(action).toBeInstanceOf(Action)
    expect(isShallow(action)).toBeTruthy()
  })

  it('preserves check for instanceof', () => {
    const model = createModel(new TestProtoModel())

    expect(model instanceof TestProtoModel).toBe(true)
    expect(model instanceof ProtoModel).toBe(true)
  })

  it('preserves self type', () => {
    const model = createModel(new TestProtoModel())

    // Type check
    const typedModel: Model<TestProtoModel> = model
    expect(typedModel).toBe(model)
  })
  it('isModelOf returns true for self', () => {
    const model = createModel(new TestProtoModel())

    expect(model.isModelOf(TestProtoModel)).toBe(true)
  })
  it('isModelOf returns false for other model', () => {
    class OtherModel extends ProtoModel {
      regularMethod(): string {
        return 'regular'
      }
    }

    const model = createModel(new TestProtoModel())

    expect(model.isModelOf(OtherModel)).toBe(false)
  })
})

test('createModel throws error when wrapped instance is not ProtoModel', () => {
  class NotProtoModel {
    regularMethod(): string {
      return 'regular'
    }
  }

  const fakeProtoModel = new NotProtoModel()
  expect(() => createModel(fakeProtoModel as never as ProtoModel)).toThrow('ProtoModel instance is required')
})
