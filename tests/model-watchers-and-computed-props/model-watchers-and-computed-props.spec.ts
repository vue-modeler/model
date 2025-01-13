
import { isReactive, isShallow, nextTick } from 'vue'

import { describe, expect, Mock, vi, test } from 'vitest'
import { createModel } from '../../src'
import { TestProtoModel } from './test-model'

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

describe('Test model', () => {
  test('is shallow reactive', () => {
    const watcherMocks = createWatcherMocks()
    const model = createModel(new TestProtoModel(0, watcherMocks))

    expect(isShallow(model)).toBeTruthy()
  })

  test('computes proprerty defined as ComputedRef in constructor', () => {
    const watcherMocks = createWatcherMocks()
    const model = createModel(new TestProtoModel(0, watcherMocks))

    model.inc()
    expect(model.computedFromConstructor).toBe(2)

    model.inc()
    expect(model.computedFromConstructor).toBe(4)

    expect(watcherMocks.computedInConstructor.mock.calls).toHaveLength(2)
  })

  test('runs watcher witch is defined in constructor', async () => {
    const watcherMocks = createWatcherMocks()
    const model = createModel(new TestProtoModel(0, watcherMocks))

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
    const model = createModel(new TestProtoModel(0, watcherMocks))

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
})
