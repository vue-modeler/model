import { beforeEach, describe, expect, test } from 'vitest'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'


describe('Model with normal properties', () => {
  let model: ReturnType<typeof createTestModel>
  
  beforeEach(() => {
    model = createTestModel(createApiMock())
  })

  test('preserves access to normal properties', () => {
  
    expect(model.normalPropery).toBe(1)
    expect(model.normalParentPropery).toBe(1)
  })

  test('preserves access to property getters', () => {
    expect(model.someGetter).toBe(2)
    expect(model.parentGetter).toBe(2)
  })

  // It is possable but not recomended
  test('allows set new values to public normal properties', () => {
    expect(() => { model.normalPropery = 3 }).not.toThrow()
    expect(() => { model.normalParentPropery = 3 }).not.toThrow()
    
    expect(model.normalPropery).toBe(3)
    expect(model.normalParentPropery).toBe(3)
  })
}) 
