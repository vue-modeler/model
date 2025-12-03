import { describe, expect, test } from 'vitest'
import { ActionUnexpectedAbortError } from '../../src/error/action-unexpected-abort-error'
import { ActionInner } from '../../src/action'

describe('ActionUnexpectedAbortError', () => {
  test('creates error with correct message format', () => {
    const actionName = 'testAction'
    const currentState = ActionInner.possibleState.ready
    const error = new ActionUnexpectedAbortError(actionName, currentState)

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ActionUnexpectedAbortError)
    expect(error.name).toBe('ActionUnexpectedAbortError')
    expect(error.message).toBe('Unexpected AbortError for the action testAction in state ready')
  })
}) 
