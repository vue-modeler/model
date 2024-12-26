import { action } from '../../../decorator/action'
import { model } from '../../../decorator/model'
import { ProtoModel } from '../../../proto-model'

@model
export class TestModel extends ProtoModel {
  @action async singleSuccessAction (): Promise<void> {
    return Promise.resolve()
  }

  @action async singleErrorAction (): Promise<void> {
    return Promise.reject(new Error())
  }

  @action async rootSuccessAction (): Promise<void> {
    await this.nestedActionA()
    await this.nestedActionB()
  }

  @action async rootErrorAction (): Promise<void> {
    await this.nestedActionA()
    await this.singleErrorAction()
  }

  @action async nestedActionA (): Promise<void> {
    await Promise.resolve()
  }

  @action async nestedActionB (): Promise<void> {
    await Promise.resolve()
  }

  @action async rootActionWithErrorInSubAction (): Promise<void> {
    await this.subActionWithError()
  }

  @action async subActionWithError (): Promise<void> {
    await Promise.reject(new Error())
  }

  @action async recursivelyAction (index = 0): Promise<void> {
    if (index === 2) {
      return
    }

    await this.recursivelyAction(index + 1)
  }

  @action async nestedWithAbort (abortController = new AbortController()): Promise<void> {
    await new Promise((resolve, reject) => {
      abortController?.signal.addEventListener('abort', () => {
        reject(new DOMException('', 'AbortError'))
      })
    })
  }

  @action async rootWithNestedAndAbort (): Promise<void> {
    await this.nestedWithAbort()
  }

  nativeMethodWithError (): void {
    throw new Error()
  }

  nativeMethodWithData<T> (data:T): T {
    return data
  }

  async nativeAsyncMethodWithData<T> (data: T): Promise<T> {
    return Promise.resolve(data)
  }

  async nativeAsyncMethodWithError (): Promise<void> {
    return Promise.reject(new Error())
  }
}
