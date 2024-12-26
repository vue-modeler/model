export const createApiMock = (): {
  sendRequest: jest.Mock
  sendRequestFromParent: jest.Mock
} => ({
  sendRequest: jest.fn(),
  sendRequestFromParent: jest.fn(),
})
