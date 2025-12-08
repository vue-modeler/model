import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActionLike } from '../src/action'
import { action } from '../src/decorator/action'
import { createModel } from '../src/create-model'
import { ProtoModel } from '../src/proto-model'
import { Model } from '../src/types'

class TestProtoModelWithValidation extends ProtoModel {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  @action async testAction(value: number): Promise<void> {
    return Promise.resolve()
  }

  protected validateArgs(action: ActionLike<this>, ...args: unknown[]): Error[] {
    const errors: Error[] = []
    const value = args[0] as number
    
    if (value < 0) {
      errors.push(new Error('Value must be positive'))
    }
    
    if (value > 100) {
      errors.push(new Error('Value must not exceed 100'))
    }
    
    return errors
  }
}

class TestProtoModelWithEmptyValidation extends ProtoModel {
  @action
  async testAction(): Promise<void> {
    return Promise.resolve()
  }

  protected validateArgs(): Error[] {
    return []
  }
}

describe('Action.validate', () => {
  let model: Model<TestProtoModelWithValidation>
  let protoModel: TestProtoModelWithValidation

  beforeEach(() => {
    protoModel = new TestProtoModelWithValidation()
    model = createModel(protoModel)
  })

  it('returns empty array when validation passes', () => {
    const errors = model.testAction.validate(50)
    expect(errors).toEqual([])
  })

  it('returns array of errors when validation fails', () => {
    const errors = model.testAction.validate(-10)
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toBe('Value must be positive')
  })

  it('returns multiple errors when multiple validations fail', () => {
    const errors = model.testAction.validate(150)
    expect(errors).toHaveLength(1)
    expect(errors[0].message).toBe('Value must not exceed 100')
  })

  it('calls validateArgs with correct action and arguments', () => {
    const validateArgsSpy = vi.spyOn(protoModel, 'validateArgs' as never)
    
    model.testAction.validate(50)
    
    expect(validateArgsSpy).toHaveBeenCalledTimes(1)
    expect(validateArgsSpy).toHaveBeenCalledWith(
      model.testAction,
      50
    )
  })

  it('works with action that has no arguments', () => {
    const emptyModel = TestProtoModelWithEmptyValidation.model()
    const errors = emptyModel.testAction.validate()
    expect(errors).toEqual([])
  })

  it('throws error when validateArgs throws', () => {
    class TestProtoModelWithThrowingValidation extends ProtoModel {
      @action
      async testAction(): Promise<void> {
        return Promise.resolve()
      }

      protected validateArgs(): Error[] {
        throw new Error('Validation error')
      }
    }

    const throwingModel = TestProtoModelWithThrowingValidation.model()
    
    expect(() => throwingModel.testAction.validate()).toThrow('Validation error')
  })

  it('preserves error instances from validateArgs', () => {
    class TestProtoModelWithCustomErrors extends ProtoModel {
      @action
      async testAction(): Promise<void> {
        return Promise.resolve()
      }

      protected validateArgs(): Error[] {
        return [
          new Error('Error 1'),
          new TypeError('Error 2'),
          new RangeError('Error 3'),
        ]
      }
    }

    const customModel = TestProtoModelWithCustomErrors.model()
    const errors = customModel.testAction.validate()
    
    expect(errors).toHaveLength(3)
    expect(errors[0]).toBeInstanceOf(Error)
    expect(errors[1]).toBeInstanceOf(TypeError)
    expect(errors[2]).toBeInstanceOf(RangeError)
    expect(errors[0].message).toBe('Error 1')
    expect(errors[1].message).toBe('Error 2')
    expect(errors[2].message).toBe('Error 3')
  })
})

