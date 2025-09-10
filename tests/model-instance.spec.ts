import { describe, expect, it } from 'vitest'
import { isShallow } from 'vue'
import { Action } from '../src/action'
import { action } from '../src/decorator/action'
import { ProtoModel } from '../src/proto-model'
import { Model } from '../src/types'

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
    const model = TestProtoModel.model()

    expect(isShallow(model)).toBeTruthy()
  })
  
  it('preserves original methods', () => {
    const model = TestProtoModel.model()

    expect(model.regularMethod).toBeDefined()
    expect(typeof model.regularMethod).toBe('function')
  })

  it('returns action for decorated methods', () => {
    const model = TestProtoModel.model()

    const action = model.actionMethod
    expect(action).toBeDefined()
    expect(action).toBeInstanceOf(Action)
    expect(isShallow(action)).toBeTruthy()
  })

  it('preserves check for instanceof', () => {
    const model = TestProtoModel.model()

    expect(model instanceof TestProtoModel).toBe(true)
    expect(model instanceof ProtoModel).toBe(true)
  })

  it('preserves self type', () => {
    const model = TestProtoModel.model()

    // Type check
    const typedModel: Model<TestProtoModel> = model
    expect(typedModel).toBe(model)
  })
  it('isModelOf returns true for self', () => {
    const model = TestProtoModel.model()

    expect(model.isModelOf(TestProtoModel)).toBe(true)
  })
  it('isModelOf returns false for other model', () => {
    class OtherModel extends ProtoModel {
      regularMethod(): string {
        return 'regular'
      }
    }

    const model = TestProtoModel.model()

    expect(model.isModelOf(OtherModel)).toBe(false)
  })
})
