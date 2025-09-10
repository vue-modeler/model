import { nextTick } from 'vue'

import { describe, expect, Mock, test, vi } from 'vitest'
import { TestProtoModel } from './test-model'
import { ProtoModel } from '../../src/proto-model'

export interface ApiService {
  sendRequest: (...args: unknown[]) => Promise<unknown>
  sendRequestFromParent: (...args: unknown[]) => Promise<unknown>
}

interface WatcherMock {
  watcherInConstructor: Mock
  computedInConstructor: Mock
}

const createWatcherMocks = (): WatcherMock => ({
  watcherInConstructor: vi.fn(),
  computedInConstructor: vi.fn(),
})

// Test model that exposes the protected watch method for testing
class TestWatchModel extends ProtoModel {
  public watch (...args: unknown[]) {
    return super.watch(...args)
  }
}


describe('Test model', () => {
  
  test('computes property defined as ComputedRef in constructor', () => {
    const watcherMocks = createWatcherMocks()
    const model = TestProtoModel.model(0, watcherMocks)

    model.inc()
    expect(model.computedFromConstructor).toBe(2)

    model.inc()
    expect(model.computedFromConstructor).toBe(4)

    expect(watcherMocks.computedInConstructor.mock.calls).toHaveLength(2)
  })

  test('runs watcher witch is defined in constructor', async () => {
    const watcherMocks = createWatcherMocks()
    const model = TestProtoModel.model(0, watcherMocks)

    model.inc()
    await nextTick()

    model.inc()
    await nextTick()

    expect(watcherMocks.watcherInConstructor.mock.calls).toHaveLength(2)
    expect(watcherMocks.watcherInConstructor.mock.calls[0][0]).toBe(1)
    expect(watcherMocks.watcherInConstructor.mock.calls[1][0]).toBe(2)
  })

  test('computed props and watcher are dispose after call destructor', async () => {
    const watcherMocks = createWatcherMocks()
    const model = TestProtoModel.model(0, watcherMocks)

    model.inc()
    await nextTick()

    expect(model.computedFromConstructor).toBe(2)
    expect(watcherMocks.computedInConstructor.mock.calls).toHaveLength(1)
    expect(watcherMocks.watcherInConstructor.mock.calls).toHaveLength(1)

    model.destructor()

    model.inc()
    await nextTick()

    expect(model.computedFromConstructor).toBe(2)
    expect(watcherMocks.computedInConstructor.mock.calls).toHaveLength(1)
    expect(watcherMocks.watcherInConstructor.mock.calls).toHaveLength(1)
  })

  test('watch method throws error when called with no arguments', () => {
    const model = new TestWatchModel()

    expect(() => {
      model.watch()
    }).toThrow('watch requires at least one argument')
  })

  test('watch method calls watchEffect when called with one argument', () => {
    const model = new TestWatchModel()
    
    const watchEffectCallback = vi.fn()
    
    // Call watch with one argument (should trigger watchEffect)
    model.watch(watchEffectCallback)
    
    // Verify that the watchEffect callback was called
    expect(watchEffectCallback).toHaveBeenCalled()
  })
})
