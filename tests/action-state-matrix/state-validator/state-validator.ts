import { expect } from 'vitest'
import { ActionPublic } from '../../../src/types'
import { ActionError } from '../../../src/error/action-error'

export function validateLockState (action: ActionPublic, args: unknown[] = []): void {
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

export function validateErrorState (action: ActionPublic, error: Error, args: unknown[] = []): void {
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

export function validatePendingState (action: ActionPublic, args: unknown[], promise: Promise<unknown>): void {
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

export function validateReadyState (action: ActionPublic): void {
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

export function validateAbortState (action: ActionPublic, reason: unknown, args: unknown[] = []): void {
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



