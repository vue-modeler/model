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
}

describe('Action decorator', () => {

  let mockTarget: TestProtoModel
  
  beforeEach(() => {
    mockTarget = new TestProtoModel()
  })


  it('creates new method and save original into Action.actionFlag', () => {
    const proto = Object.getPrototypeOf(mockTarget) as TestProtoModel
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'testAction')
    if (!descriptor) {
      throw new Error('Descriptor is not defined')
    }

    const originalMethod = descriptor.value as (...args: any[]) => Promise<void>
    
    action(
      mockTarget,
      'testAction',
      descriptor
    )

    expect(descriptor.value).not.toBe(originalMethod)
    expect((descriptor.value as OriginalMethodWrapper<[]>)[Action.actionFlag]).toBeDefined() 
    expect((descriptor.value as OriginalMethodWrapper<[]>)[Action.actionFlag]).toBe(originalMethod) 
    expect(typeof (descriptor.value as OriginalMethodWrapper<[]>)[Action.actionFlag]).toBe('function')
  })

  it('throws error if target is not ProtoModel', () => {
    class TestNativeModel {
      testAction(): Promise<void> {
        return Promise.resolve()
      }
    }
    
    const mockTarget = new TestNativeModel()
    
    const proto = Object.getPrototypeOf(mockTarget) as object
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'testAction')
    if (!descriptor) {
      throw new Error('Descriptor is not defined')
    }

    expect(() => action(
      mockTarget,
      'testAction',
      descriptor
    )).toThrow('Target is not instance of ProtoModel')
  })

  it('throws error if action name is not string', () => {
    const actionName = Symbol('testAction')
    class TestNativeModel {
      [actionName](): Promise<void> {
        return Promise.resolve()
      }
    }
    
    const mockTarget = new TestNativeModel()
    
    const proto = Object.getPrototypeOf(mockTarget) as object
    const descriptor = Object.getOwnPropertyDescriptor(proto, actionName)
    if (!descriptor) {
      throw new Error('Descriptor is not defined')
    }

    expect(() => action(
      mockTarget,
      actionName,
      descriptor  
    )).toThrow('Action name is not a string')
  })

  it('throws error if descriptor value is not function', () => {
    const descriptor = Object.getOwnPropertyDescriptor(mockTarget, 'property')
    if (!descriptor) {
      throw new Error('Descriptor is not defined')
    }

    expect(() => action(
      mockTarget,
      'property',
      descriptor  
    )).toThrow('Property value is not a function')
  })
})

describe('Original method wrapper ', () => {

  let mockTarget: TestProtoModel
  let actionMock: ActionPublic
  let actionProtectedMethodMock: Mock
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
    const proto = Object.getPrototypeOf(mockTarget) as TestProtoModel
    Object.defineProperty(proto, 'action', {
      value: actionProtectedMethodMock,
      writable: false,
      enumerable: false,
      configurable: false
    })
  })

  it('gets action and calls exec with original method args', async () => {
    const proto = Object.getPrototypeOf(mockTarget) as TestProtoModel
    const descriptor = Object.getOwnPropertyDescriptor(proto, 'testAction')
    if (!descriptor) {
      throw new Error('Descriptor is not defined')
    }

    const originalMethod = descriptor.value as (...args: any[]) => Promise<void>
    
    action(
      mockTarget,
      'testAction',
      descriptor
    )

    const originalMethodWrapper = descriptor.value as OriginalMethodWrapper<[]>
    Object.defineProperty(mockTarget, 'testAction', descriptor);
    
    await mockTarget.testAction(1, 'test')
    expect(actionProtectedMethodMock).toHaveBeenCalled()

    const actionCallArg = (actionProtectedMethodMock).mock.calls[0][0] as OriginalMethodWrapper<[]>
    expect(actionCallArg).toBe(originalMethodWrapper)
    expect(actionCallArg[Action.actionFlag]).toBe(originalMethod)
    
    expect(actionMock.exec).toHaveBeenCalled()
    expect((actionMock.exec as Mock).mock.calls[0][0]).toBe(1)
    expect((actionMock.exec as Mock).mock.calls[0][1]).toBe('test')
  })
})
