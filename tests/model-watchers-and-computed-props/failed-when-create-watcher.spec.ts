import { expect, Mock, test, vi } from 'vitest'
import { createModel } from '../../src'
import { TestProtoModel } from './test-model'


vi.mock('vue', async () => {
  const scopeRunnerSpy = vi.fn(() => undefined)
  const effectScopeConstructorSpy = vi.fn(() => ({
    run: scopeRunnerSpy
  }))

  return {
    ...(await vi.importActual<typeof import('vue')>('vue')),
    // this will only affect "foo" outside of the original module
    effectScope: effectScopeConstructorSpy
  }
})

interface WatcherMock {
  watcherInConstructor: Mock
  computedInConstructor: Mock
}

const createWatcherMocks = (): WatcherMock => ({
  watcherInConstructor: vi.fn(),
  computedInConstructor: vi.fn(),
})

test('createModel throws error when watchStopHandler is undefined', () => {
  
  expect(() => {
    createModel(new TestProtoModel(0, createWatcherMocks()))
  }).toThrow('watchStopHandler is undefined')
})
