import { expect } from 'vitest'
import { ProtoModel } from '../../../src'
import { ActionError } from '../../../src/error/action-error'
import { Action } from '../../../src/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateLockState<T extends ProtoModel, Args extends any[] = unknown[]> (action: Action<T, Args>, args: Args = [] as unknown as Args): void {
  expect(action.state).toBe('lock')
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeTruthy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.abortReason).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)
  expect(action.abortController).toBeNull()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateErrorState<T extends ProtoModel, Args extends any[] = unknown[]> (action: Action<T, Args>, error: Error, args: Args = [] as unknown as Args): void {
  expect(action.state).toBe('error')
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeTruthy()
  expect(action.error).toBeInstanceOf(ActionError)
  expect(action.error?.message).toBe(error.message)
  expect(action.abortController).toBeNull()
  expect(action.abortReason).toBeNull()
  expect(action.args).toEqual(args)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validatePendingState<T extends ProtoModel, Args extends any[] = unknown[]> (action: Action<T, Args>, args: Args = [] as unknown as Args, promise: Promise<unknown>): void {
  expect(action.state).toBe('pending')
  expect(action.isPending).toBeTruthy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.abortReason).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)

  expect(action.promise).toBe(promise)
  expect(action.abortController).toBeInstanceOf(AbortController)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateReadyState<T extends ProtoModel, Args extends any[] = unknown[]> (action: Action<T, Args>) : void {
  expect(action.isReady).toBeTruthy()
  expect(action.abortController).toBeNull()
  expect(action.error).toBeNull()

  expect(action.state).toBe('ready')
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeTruthy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.abortReason).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual([])
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateAbortState<T extends ProtoModel, Args extends any[] = unknown[]> (action: Action<T, Args>, reason: unknown, args: Args = [] as unknown as Args): void {
  expect(action.state).toBe('abort')
  expect(action.isAbort).toBeTruthy()
  expect(action.abortController).toBeNull()
  expect(action.abortReason).toBe(reason)
  
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)

}



