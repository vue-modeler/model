import { expect, test, vi } from 'vitest'
import { model } from '../src/model'
import { createApiMock } from './test-model/create-api-mock'
import { TestProtoModel } from './test-model/test-proto-model'

vi.mock('@vue-modeler/dc')

test('model calls provider factory function', async () => {
  const dc = await import('@vue-modeler/dc')
  dc.provider = vi.fn()

  model(() => new TestProtoModel(createApiMock()))

  expect(dc.provider).toHaveBeenCalled()
})

