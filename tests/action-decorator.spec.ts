import { describe, it, expect, beforeEach, vi, Mock } from 'vitest'
import { action } from '../src/decorator/action'
import { ProtoModel } from '../src/proto-model'
import { Action } from '../src/action'
import { ActionPublic, OriginalMethodWrapper } from '../src/types'


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

const createContext = (
  originalMethod: (...args: any[]) => Promise<void>,
  methodName: string | symbol = "testAction",
  contextDto: Partial<ClassMethodDecoratorContext<TestProtoModel, (...args: any[]) => Promise<void>>> = {}
): ClassMethodDecoratorContext<TestProtoModel, (...args: any[]) => Promise<void>> => {
  
  return {
    kind: "method",
    name: methodName,
    static: false,
    private: false,
    addInitializer(): void {
      // Mock implementation
    },
    access: {
      has(): boolean {
        return true
      },
      get(): (...args: any[]) => Promise<void> {
        return originalMethod
      }
    },
    metadata: {},
    ...contextDto
  }
}

describe('Action decorator', () => {

  let mockTarget: TestProtoModel
  let originalMethod: (...args: any[]) => Promise<void>
  
  beforeEach(() => {
    mockTarget = new TestProtoModel()
    const proto = Object.getPrototypeOf(mockTarget) as TestProtoModel
    originalMethod = Object.getOwnPropertyDescriptor(proto, 'testAction')?.value as (...args: any[]) => Promise<void>
  })

  it('creates new method and save original into Action.actionFlag', () => {
    const context = createContext(originalMethod)
      
    const wrapper = action(
      originalMethod,
      context
    )

    expect(typeof wrapper).toBe('function')
    expect(wrapper).not.toBe(originalMethod)
    expect(wrapper[Action.actionFlag]).toBeDefined() 
    expect(wrapper[Action.actionFlag]).toBe(originalMethod) 
    expect(typeof wrapper[Action.actionFlag]).toBe('function')
  })

  it('throws error if method is static', () => {  
    const context = createContext(originalMethod, "testAction", { static: true })

    expect(() => action(
      originalMethod,
      context
    )).toThrow('Action decorator is not supported for static methods')
  })

  it('throws error if method is private', () => {
    const context = createContext(originalMethod, "testAction", { private: true })
    
    expect(() => action(
      originalMethod,
      context
    )).toThrow('Action decorator is not supported for private methods')
  })

  it('creates wrapper with correct function name', () => {
    const context = createContext(originalMethod, "testAction")
    
    const wrapper = action(
      originalMethod,
      context
    )

    expect(wrapper.name).toBe('testAction')
  })

  it('works with symbol method names', () => {
    const symbolName = Symbol('symbolAction')
    const context = createContext(originalMethod, symbolName)
    
    const wrapper = action(
      originalMethod,
      context
    )

    // Should still work even with symbol names
    expect(wrapper.name).toBe(symbolName.toString())
    expect(wrapper[Action.actionFlag]).toBe(originalMethod)
  })
})

describe('Original method wrapper', () => {

  let mockTarget: TestProtoModel
  let actionMock: ActionPublic
  let actionProtectedMethodMock: Mock
  let wrapper: OriginalMethodWrapper<[number, string]>
  let originalMethod: (...args: any[]) => Promise<void>
  
  beforeEach(() => {
    mockTarget = new TestProtoModel()
    actionMock = {
      exec: vi.fn(),
      is: vi.fn(),
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
      toString: vi.fn(),
      abort: vi.fn(),
      lock: vi.fn(),
      unlock: vi.fn(),
      resetError: vi.fn(),
    }
    actionProtectedMethodMock = vi.fn().mockReturnValue(actionMock)
    
    // Create wrapper using the new API
    originalMethod = mockTarget.testAction.bind(mockTarget)
    const context = createContext(originalMethod)
    wrapper = action(originalMethod, context)
    
    // Mock the action method on the target
    Object.defineProperty(mockTarget, 'action', {
      value: actionProtectedMethodMock,
      writable: false,
      enumerable: false,
      configurable: false
    })
  })

  it('gets action and calls exec with original method args', async () => {
    // Bind the wrapper to the target
    const boundWrapper = wrapper.bind(mockTarget)
    
    await boundWrapper(1, 'test')
    
    expect(actionProtectedMethodMock).toHaveBeenCalled()
    const actionCallArg = actionProtectedMethodMock.mock.calls[0][0] as OriginalMethodWrapper<[number, string]>
    expect(actionCallArg).toBe(wrapper)
    expect(actionCallArg[Action.actionFlag]).toBe(originalMethod)
    
    expect(actionMock.exec).toHaveBeenCalled()
    expect((actionMock.exec as Mock).mock.calls[0][0]).toBe(1)
    expect((actionMock.exec as Mock).mock.calls[0][1]).toBe('test')
  })
})
