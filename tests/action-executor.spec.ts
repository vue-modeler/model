import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActionExecutor } from '../src/action-executor'
import { Action } from '../src/types'
import { createApiMock } from './test-model/create-api-mock'
import { createTestModel } from './test-model/create-test-model'
import { TestProtoModel } from './test-model/test-proto-model'

describe('ActionExecutor', () => {
  let executor: ActionExecutor<TestProtoModel>
  let model: ReturnType<typeof createTestModel>

  beforeEach(() => {
    const apiMock = createApiMock()
    model = createTestModel(apiMock)
    executor = new ActionExecutor<TestProtoModel>()
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

    it('should execute served action with provided args', async () => {
      const action = model.successActionWithArgs
      const execSpy = vi.spyOn(action, 'exec')
      
      executor.init(action, 42, 'test', { key: 'value' })
      await executor.exec()
      
      expect(execSpy).toHaveBeenCalledWith(42, 'test', { key: 'value' })
    })

    it('should clear getters after successful execution', async () => {
      const action = model.successActionWithArgs
      
      executor.init(action, 1, 'test', {})
      expect(executor.servedAction).toBe(action)
      expect(executor.args).toEqual([1, 'test', {}])
      expect(executor.error).toBeNull()
      
      await executor.exec()
      
      expect(executor.servedAction).toBeNull()
      expect(executor.args).toBeNull()
      expect(executor.error).toBeNull()
    })

    it('should save error and not clear getters if action has error', async () => {
      const action = model.singleErrorAction
      
      executor.init(action)
      expect(executor.servedAction).toBe(action)
      expect(executor.args).toEqual([])
      expect(executor.error).toBeNull()
      
      // Execute action to get it into error state
      await executor.exec()
      
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
      await executor.exec()
      expect(execSpy1).toHaveBeenCalled()
      
      // Second action
      executor.init(action2, 1, 'test', {})
      await executor.exec()
      expect(execSpy2).toHaveBeenCalledWith(1, 'test', {})
    })

    it('should allow init -> exec with error -> init -> exec sequence', async () => {
      const actionWithError = model.singleErrorAction
      const actionWithoutError = model.successActionWithoutArgs
      
      // First action - execute with error
      executor.init(actionWithError)
      await executor.exec()
      
      executor.init(actionWithoutError)
      await executor.exec()
    })
  })
})

