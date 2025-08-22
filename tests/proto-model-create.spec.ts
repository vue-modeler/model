import { describe, expect, it } from 'vitest'
import { isShallow } from 'vue'
import { createModel } from '../src/create-model'
import { ProtoModel } from '../src/proto-model'
import { Model } from '../src/types'

class TestProtoModel extends ProtoModel {
  constructor(
    public readonly name: string,
    public readonly value: number
  ) {
    super()
  }

  get displayName(): string {
    return `${this.name} (${this.value.toString()})`
  }
}

class TestProtoModelWithActions extends ProtoModel {
  constructor(
    public readonly api: { fetch: () => Promise<string> }
  ) {
    super()
  }

  async testAction(): Promise<void> {
    await this.api.fetch()
  }
}

describe('ProtoModel.create', () => {
  it('creates a model instance with correct arguments', () => {
    const model = TestProtoModel.model('TestModel', 42)

    expect(model).toBeInstanceOf(TestProtoModel)
    expect(model.name).toBe('TestModel')
    expect(model.value).toBe(42)
    expect(model.displayName).toBe('TestModel (42)')
  })

  it('returns a reactive model', () => {
    const model = TestProtoModel.model('TestModel', 42)

    expect(isShallow(model)).toBe(true)
  })

  it('preserves instanceof checks', () => {
    const model = TestProtoModel.model('TestModel', 42)

    expect(model instanceof TestProtoModel).toBe(true)
    expect(model instanceof ProtoModel).toBe(true)
  })

  it('works with different constructor parameters', () => {
    const api = { fetch: () => Promise.resolve('test') }
    const model = TestProtoModelWithActions.model(api)

    expect(model).toBeInstanceOf(TestProtoModelWithActions)
    expect(model.api).toBe(api)
  })

  it('creates model with same result as createModel function', () => {
    const protoModel = new TestProtoModel('TestModel', 42)
    const modelViaCreate = TestProtoModel.model('TestModel', 42)
    const modelViaFunction = createModel(protoModel)

    // Both should be reactive models
    expect(isShallow(modelViaCreate)).toBe(true)
    expect(isShallow(modelViaFunction)).toBe(true)

    // Both should have same properties
    expect(modelViaCreate.name).toBe(modelViaFunction.name)
    expect(modelViaCreate.value).toBe(modelViaFunction.value)
  })

  it('maintains type safety', () => {
    const model = TestProtoModel.model('TestModel', 42)
    
    // Type check - should be Model<TestProtoModel>
    const typedModel: Model<TestProtoModel> = model
    expect(typedModel).toBe(model)
  })

  it('works with inheritance', () => {
    class ChildProtoModel extends TestProtoModel {
      constructor(name: string, value: number, public extra: string) {
        super(name, value)
      }
    }

    const model = ChildProtoModel.model('Child', 100, 'extra')

    expect(model).toBeInstanceOf(ChildProtoModel)
    expect(model).toBeInstanceOf(TestProtoModel)
    expect(model).toBeInstanceOf(ProtoModel)
    expect(model.name).toBe('Child')
    expect(model.value).toBe(100)
    expect(model.extra).toBe('extra')
  })

  it('preserves model identity', () => {
    const model1 = TestProtoModel.model('Test1', 1)
    const model2 = TestProtoModel.model('Test2', 2)

    expect(model1).not.toBe(model2)
    expect(model1.name).toBe('Test1')
    expect(model2.name).toBe('Test2')
  })

  it('throws error when trying to create ProtoModel directly', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    expect(() => {(ProtoModel as any).model()}).toThrow('ProtoModel is abstract class and can not be instantiated')
  })

  it('allows creation of concrete ProtoModel subclasses', () => {
    expect(() => {
      TestProtoModel.model('Test', 42)
    }).not.toThrow()
  })
})
