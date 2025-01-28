import { describe, expect, test } from 'vitest'
import { createApiMock } from '../test-model/create-api-mock'
import { createTestModel } from '../test-model/create-test-model'
  
describe('Asynchronous method', () => {
  
  test('without @action decorator and with void result is seen like Action but throws error in runtime', async () => {
    expect.assertions(3)
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect(typeof model.normalAsyncMethodwithVoidResult).toBe('function')

    try {
      await model.normalAsyncMethodwithVoidResult.exec('I won`t be called')
    } catch (error) {
      expect(error).toBeInstanceOf(TypeError)
      expect((error as Error).message).toEqual('model.normalAsyncMethodwithVoidResult.exec is not a function')
    }
  })

  test('with not void result works as usual', async () => {
    expect.assertions(4)
    const apiMock = createApiMock()
    const model = createTestModel(apiMock)

    expect(typeof model.normalAsyncMethodWithData).toBe('function')
    expect(typeof model.normalAsyncMethodWithError).toBe('function')

    try {
      const result = await model.normalAsyncMethodWithData(10)
      expect(result).toEqual(10)

      await model.normalAsyncMethodWithError('I will be called')
    } catch (error) {
      expect(error).toEqual(new Error('I will be called'))
    }
  })
})

test('Synchronous method works as usual', () => {
  const apiMock = createApiMock()
  const model = createTestModel(apiMock)

  expect(typeof model.normalSyncMethodWithData).toBe('function')
  expect(typeof model.normalSyncMethodFromParent).toBe('function')
  expect(typeof model.normalSyncMethodWithError).toBe('function')
  
  expect(model.normalSyncMethodWithData(10)).toEqual(10)
  expect(model.normalSyncMethodFromParent(10)).toEqual(10)
  expect(() => { model.normalSyncMethodWithError(); }).toThrowError()
})

test('Action accessable inside any normal method', () => {
  const apiMock = createApiMock()
  const model = createTestModel(apiMock)

  const action = model.normalSyncMethodWithActionInside()

  expect(action).toEqual(model.nestedActionA)
})