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
  expect(action.asReason).toBeNull()
  expect(action.asError).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)
  expect(action.asAbortController).toBeNull()
}

export function validateErrorState (action: ActionPublic, error: Error, args: unknown[] = []): void {
  expect(action.state).toBe('error')
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeTruthy()
  expect(action.error).toBeInstanceOf(ActionError)
  expect(action.asError).toBeInstanceOf(ActionError)
  expect(action.error?.message).toBe(error.message)
  expect(action.asAbortController).toBeNull()
  expect(action.asReason).toBeNull()
  expect(action.args).toEqual(args)
}

export function validatePendingState (action: ActionPublic, args: unknown[], promise: Promise<unknown>): void {
  expect(action.state).toBe('pending')
  expect(action.isPending).toBeTruthy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.asReason).toBeNull()
  expect(action.asError).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)

  expect(action.asPromise).toBe(promise)
  expect(action.asAbortController).toBeInstanceOf(AbortController)
}

export function validateReadyState (action: ActionPublic): void {
  expect(action.isReady).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()

  expect(action.state).toBe('ready')
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeTruthy()
  expect(action.isLock).toBeFalsy()
  expect(action.isAbort).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.asReason).toBeNull()
  expect(action.asError).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual([])
}

export function validateAbortState (action: ActionPublic, reason: unknown, args: unknown[] = []): void {
  expect(action.state).toBe('abort')
  expect(action.isAbort).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.asReason).toBe(reason)
  
  expect(action.isPending).toBeFalsy()
  expect(action.isReady).toBeFalsy()
  expect(action.isLock).toBeFalsy()
  expect(action.isError).toBeFalsy()
  expect(action.asError).toBeNull()
  expect(action.error).toBeNull()
  expect(action.args).toEqual(args)

}



