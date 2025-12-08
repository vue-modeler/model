import { beforeEach, describe, expect, it, Mock, vi } from 'vitest'
import { Action, ActionLike } from '../src/action'
import { createModel } from '../src/create-model'
import { action } from '../src/decorator/action'
import { ProtoModel } from '../src/proto-model'
import { OriginalMethodWrapper } from '../src/types'

class TestProtoModel extends ProtoModel {
  property = 'test'

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  testAction(a: number, b: string): Promise<void> {
    return Promise.resolve()
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  voidAction(a: number): void {
    // void method
  }
}

type TestMethod = (this: TestProtoModel, ...args: any[]) => Promise<void>

const createContext = (
  originalMethod: TestMethod,
  methodName: string | symbol = 'testAction',
  overrides: Partial<ClassMethodDecoratorContext<TestProtoModel, TestMethod>> = {}
): ClassMethodDecoratorContext<TestProtoModel, TestMethod> => {
  return {
    kind: 'method',
    name: methodName,
    static: false,
    private: false,
    addInitializer: vi.fn(),
    access: {
      has: vi.fn().mockReturnValue(true),
      get: vi.fn().mockReturnValue(originalMethod),
    },
    metadata: {},
    ...overrides,
  }
}

const getOriginalMethod = (target: TestProtoModel, methodName: string): TestMethod => {
  const proto = Object.getPrototypeOf(target) as TestProtoModel
  const descriptor = Object.getOwnPropertyDescriptor(proto, methodName)
  if (!descriptor?.value) {
    throw new Error(`Method ${methodName} not found`)
  }
  return descriptor.value as TestMethod
}

describe('Action decorator', () => {
  let mockTarget: TestProtoModel
  let originalMethod: TestMethod

  beforeEach(() => {
    mockTarget = new TestProtoModel()
    originalMethod = getOriginalMethod(mockTarget, 'testAction')
  })

  describe('basic functionality', () => {
    it('creates a wrapper function and saves original method into Action.actionFlag', () => {
      const context = createContext(originalMethod)
      const wrapper = action(originalMethod, context)

      expect(typeof wrapper).toBe('function')
      expect(wrapper).not.toBe(originalMethod)
      expect(wrapper[Action.actionFlag]).toBeDefined()
      expect(wrapper[Action.actionFlag]).toBe(originalMethod)
      expect(typeof wrapper[Action.actionFlag]).toBe('function')
    })
  })

  describe('method name handling', () => {
    it('creates wrapper with correct function name for string method name', () => {
      const context = createContext(originalMethod, 'testAction')
      const wrapper = action(originalMethod, context)

      expect(wrapper.name).toBe('testAction')
    })

    it('handles symbol method names correctly', () => {
      const symbolName = Symbol('symbolAction')
      const context = createContext(originalMethod, symbolName)
      const wrapper = action(originalMethod, context)

      expect(wrapper.name).toBe(symbolName.toString())
      expect(wrapper[Action.actionFlag]).toBe(originalMethod)
    })

    it('throws helpful error when method name cannot be stringified', () => {
      const brokenName = {
        toString: vi.fn(() => {
          throw new Error('test failure')
        }),
      }
      const context = createContext(originalMethod, brokenName as unknown as string | symbol)

      expect(() => action(originalMethod, context)).toThrow(
        'Invalid context. Can`t get name of the method: test failure'
      )
    })
  })

  describe('validation', () => {
    it('throws error when method is static', () => {
      const context = createContext(originalMethod, 'testAction', { static: true })

      expect(() => action(originalMethod, context)).toThrow(
        'Action decorator is not supported for static methods'
      )
    })

    it('throws error when method is private', () => {
      const context = createContext(originalMethod, 'testAction', { private: true })

      expect(() => action(originalMethod, context)).toThrow(
        'Action decorator is not supported for private methods'
      )
    })

    it('allows non-static, non-private methods', () => {
      const context = createContext(originalMethod, 'testAction', {
        static: false,
        private: false,
      })

      expect(() => action(originalMethod, context)).not.toThrow()
    })
  })
})

describe('Original method wrapper execution', () => {
  let mockTarget: TestProtoModel
  let actionMock: ActionLike<TestProtoModel>
  let actionMethodMock: Mock
  let wrapper: OriginalMethodWrapper<[number, string]>
  let originalMethod: TestMethod

  beforeEach(() => {
    mockTarget = new TestProtoModel()
    originalMethod = getOriginalMethod(mockTarget, 'testAction')

    actionMock = {
      owner: createModel(mockTarget),
      exec: vi.fn().mockResolvedValue(undefined),
      is: vi.fn().mockReturnValue(false),
      name: 'testAction',
      state: Action.possibleState.ready,
      possibleStates: Object.values(Action.possibleState),
      abortController: null,
      promise: null,
      error: null,
      abortReason: null,
      isPending: false,
      isError: false,
      isReady: true,
      isLock: false,
      isAbort: false,
      args: [],
      toString: vi.fn().mockReturnValue('testAction'),
      abort: vi.fn(),
      lock: vi.fn(),
      unlock: vi.fn(),
      resetError: vi.fn(),
    }

    actionMethodMock = vi.fn().mockReturnValue(actionMock)

    const context = createContext(originalMethod)
    wrapper = action(originalMethod, context)

    // Replace original action method with mock inside the model instance.
    // This is needed to test that the wrapper is called correctly.
    Object.defineProperty(mockTarget, 'action', {
      value: actionMethodMock,
      writable: false,
      enumerable: false,
      configurable: false,
    })
  })

  it('calls this.action() with wrapper containing correct actionFlag', async () => {
    const boundWrapper = wrapper.bind(mockTarget)
    await boundWrapper(1, 'test')

    expect(actionMethodMock).toHaveBeenCalledTimes(1)
    expect(actionMethodMock).toHaveBeenCalledWith(wrapper)
    
    const wrapperArg = actionMethodMock.mock.calls[0][0] as OriginalMethodWrapper<[number, string]>
    expect(wrapperArg).toBe(wrapper)
    expect(wrapperArg[Action.actionFlag]).toBe(originalMethod)
  })

  it('calls exec() on action with correct arguments preserving order and values', async () => {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const execMock = actionMock.exec
    const boundWrapper = wrapper.bind(mockTarget)
    const args: [number, string] = [100, 'world']
    await boundWrapper(...args)

    expect(execMock).toHaveBeenCalledTimes(1)
    expect(execMock).toHaveBeenCalledWith(100, 'world')
  })
})
