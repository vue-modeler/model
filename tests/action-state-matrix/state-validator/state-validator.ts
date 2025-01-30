import { expect } from 'vitest'
import { ActionPublic } from '../../../src/types'

export function validateLockState (action: ActionPublic): void {
  expect(action.isLock).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()
}

export function validateErrorState (action: ActionPublic, error: Error): void {
  expect(action.isError).toBeTruthy()

  expect(action.error).toBeInstanceOf(Error)
  expect(action.error?.message).toBe(error.message)
  expect(action.asAbortController).toBeNull()
  expect(action.asReason).toBeNull()
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

export function validateAbortState (action: ActionPublic, reason: unknown): void {
  expect(action.isAbort).toBeTruthy()
  expect(action.asAbortController).toBeNull()
  expect(action.error).toBeNull()
  expect(action.asReason).toBe(reason)
}



