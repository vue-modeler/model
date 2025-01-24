import { Mock, vi } from 'vitest'

export function createApiMock (): {
  sendRequest: Mock
  sendRequestFromParent: Mock
} {
  return {
    sendRequest: vi.fn().mockImplementation(async () => {
      console.log('>> sendRequest')
      const promise = new Promise((resolve) => {
        setTimeout(() => {
          console.log('>> sendRequest resolve')
          resolve(void 0)
        }, 0)
      })

      console.log('<< sendRequest')

      return promise
    }),
    sendRequestFromParent: vi.fn().mockImplementation(async () => {
      console.log('sendRequestFromParent')

      return Promise.resolve()
    }),
  }
}
