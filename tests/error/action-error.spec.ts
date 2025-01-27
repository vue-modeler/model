import { describe, expect, test } from 'vitest'
import { ActionError } from '../../src/error/action-error'

describe('ActionError', () => {
  test('creates error with default options', () => {
    const actionName = 'testAction'
    const cause = new Error('Original error')
    const error = new ActionError(actionName, { cause })

    
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ActionError)
    expect(error.name).toBe('ActionError')
    expect(error.message).toBe('Action testAction throw error')
    expect(error.cause).toBe(cause)
  })

  test('throwCause throws the original cause', () => {
    const actionName = 'testAction'
    const cause = new Error('Original error')
    const error = new ActionError(actionName, { cause })

    expect(() => {
      error.throwCause()
    }).toThrow(cause)
  })
}) 