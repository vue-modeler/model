import { beforeEach, describe, expect, it, vi } from 'vitest'
import { isShallow, nextTick, watch } from 'vue'
import { ActionExecutor } from '../src/action-executor'
import { Action, Model } from '../src/types'
import { createApiMock } from './test-model/create-api-mock'
import { createTestModel } from './test-model/create-test-model'
import { TestProtoModel } from './test-model/test-proto-model'

describe('ActionExecutor', () => {
  let executor: Model<ActionExecutor<TestProtoModel>>
  let model: ReturnType<typeof createTestModel>

  beforeEach(() => {
    const apiMock = createApiMock()
    model = createTestModel(apiMock)
    executor = (ActionExecutor<TestProtoModel>).model()
  })

  it('should be shallow reactive', () => {
    expect(isShallow(executor)).toBe(true)
  })

  it('should reactively update servedAction when init is called', async () => {
    const action1 = model.successActionWithoutArgs
    const action2 = model.successActionWithArgs
    
    const servedActions: (typeof action1 | null)[] = []
    
    watch(
      () => executor.servedAction,
      (action) => {
        servedActions.push(action as typeof action1 | null)
      }
    )
    
    // Initial state should be null
    expect(servedActions.length).toBe(0)
    
    // Initialize with first action
    executor.init(action1)
    await nextTick()
    
    expect(servedActions.length).toBe(1)
    expect(servedActions[0]).toBe(action1)
    
    // Initialize with second action
    executor.init(action2, 1, 'test', {})
    await nextTick()
    expect(servedActions.length).toBe(2)
    expect(servedActions[1]).toBe(action2)
    
    // Reset should clear servedAction
    executor.reset()
    await nextTick()
    expect(servedActions.length).toBe(3)
    expect(servedActions[2]).toBeNull()
  })

  describe('init and getters', () => {
    describe('initial state', () => {
      it('should return null for all getters when not initialized', () => {
        expect(executor.servedAction).toBeNull()
        expect(executor.args).toBeNull()
        expect(executor.error).toBeNull()
      })
    })

    describe('initialization without args', () => {
      it('should initialize servedAction and set empty args array', () => {
        const action = model.successActionWithoutArgs
        
        executor.init(action)
        
        expect(executor.servedAction).toBe(action)
        expect(executor.args).toEqual([])
      })
    })

    describe('initialization with args', () => {
      it('should initialize servedAction and args with provided values', () => {
        const action = model.successActionWithArgs
        
        executor.init(action, 42, 'test', { key: 'value' })
        
        expect(executor.servedAction).toBe(action)
        expect(executor.args).toEqual([42, 'test', { key: 'value' }])
      })
    })

    describe('re-initialization', () => {
      it('should allow re-initialization with different action and args', () => {
        const action1 = model.successActionWithoutArgs
        const action2 = model.successActionWithArgs
        
        executor.init(action1)
        expect(executor.servedAction).toBe(action1)
        expect(executor.args).toEqual([])
        
        executor.init(action2, 1, 'test', {})
        expect(executor.servedAction).toBe(action2)
        expect(executor.args).toEqual([1, 'test', {}])
      })

    })

    describe('after reset', () => { 
      it('should clear all getters after reset', () => {
        const action = model.successActionWithArgs
        
        executor.init(action, 1, 'test', {})
        executor.reset()
        
        expect(executor.servedAction).toBeNull()
        expect(executor.args).toBeNull()
        expect(executor.error).toBeNull()
      })

    })
  })

  describe('exec', () => {
    it('should throw error when not initialized', async () => {
      await expect(executor.exec()).rejects.toThrow('Action not initialized')
    })

    it('should throw error when servedAction is null', async () => {
      executor.init(null as unknown as Action<TestProtoModel>)
      
      await expect(executor.exec()).rejects.toThrow('Action not initialized')
    })

    it('should execute served action with provided args and return true on success', async () => {
      const action = model.successActionWithArgs
      const execSpy = vi.spyOn(action, 'exec')
      
      executor.init(action, 42, 'test', { key: 'value' })
      const result = await executor.exec()
      
      expect(execSpy).toHaveBeenCalledWith(42, 'test', { key: 'value' })
      expect(result).toBe(true)
    })

    it('should clear getters after successful execution and return true', async () => {
      const action = model.successActionWithArgs
      
      executor.init(action, 1, 'test', {})
      expect(executor.servedAction).toBe(action)
      expect(executor.args).toEqual([1, 'test', {}])
      expect(executor.error).toBeNull()
      
      const result = await executor.exec()
      
      expect(result).toBe(true)
      expect(executor.servedAction).toBeNull()
      expect(executor.args).toBeNull()
      expect(executor.error).toBeNull()
    })

    it('should save error, not clear getters and return false if action has error', async () => {
      const action = model.singleErrorAction
      
      executor.init(action)
      expect(executor.servedAction).toBe(action)
      expect(executor.args).toEqual([])
      expect(executor.error).toBeNull()
      
      // Execute action to get it into error state
      const result = await executor.exec()
      
      expect(result).toBe(false)
      expect(executor.servedAction).toBe(action)
      expect(executor.args).toEqual([])
      expect(executor.error).toEqual(action.error)
    })
  })

  describe('integration', () => {
    it('should allow init -> exec -> init -> exec sequence', async () => {
      const action1 = model.successActionWithoutArgs
      const action2 = model.successActionWithArgs
      const execSpy1 = vi.spyOn(action1, 'exec')
      const execSpy2 = vi.spyOn(action2, 'exec')
      
      // First action
      executor.init(action1)
      const result1 = await executor.exec()
      expect(result1).toBe(true)
      expect(execSpy1).toHaveBeenCalled()
      
      // Second action
      executor.init(action2, 1, 'test', {})
      const result2 = await executor.exec()
      expect(result2).toBe(true)
      expect(execSpy2).toHaveBeenCalledWith(1, 'test', {})
    })

    it('should allow init -> exec with error -> init -> exec sequence', async () => {
      const actionWithError = model.singleErrorAction
      const actionWithoutError = model.successActionWithoutArgs
      
      // First action - execute with error
      executor.init(actionWithError)
      const result1 = await executor.exec()
      expect(result1).toBe(false)
      
      executor.init(actionWithoutError)
      const result2 = await executor.exec()
      expect(result2).toBe(true)
    })
  })
})

