import { Mock, vi } from 'vitest'

export function createApiMock (): {
  sendRequest: Mock
  sendRequestFromParent: Mock
} {
  return {
    sendRequest: vi.fn().mockImplementation(async () => {
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          resolve(void 0)
        }, 0)
      })

      return promise
    }),
    sendRequestFromParent: vi.fn().mockImplementation(() => {
      return Promise.resolve()
    }),
  }
}
