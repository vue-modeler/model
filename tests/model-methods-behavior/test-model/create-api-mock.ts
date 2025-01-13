import { Mock, vi } from 'vitest'

export function createApiMock (): {
  sendRequest: Mock
  sendRequestFromParent: Mock
} {
  return {
    sendRequest: vi.fn(),
    sendRequestFromParent: vi.fn(),
  }
}
