import { ShallowReactive } from 'vue'

import { ActionPublic } from '../../../src/types'
import { action } from '../../../src/decorator/action'
import { ParentProtoModel } from './parent-proto-model'

export class TestProtoModel extends ParentProtoModel {
  readonly debug = 'debug'

  constructor (
    readonly api: {
      sendRequest: (...args: unknown[]) => Promise<unknown>
      sendRequestFromParent: (...args: unknown[]) => Promise<unknown>
    },
    readonly testReadonly: string | null = null,
  ) {
    super(api)
  }

  get testGetter (): number {
    return 1
  }

  @action async successActionWithoutArgs (ac = new AbortController()): Promise<void> {
    await this.api.sendRequest(ac)
  }

  @action async successActionWithArgs (
    numberArg: number,
    stringArgs: string,
    objectArg: object,
    ac = new AbortController(),
  ): Promise<void> {
    await this.api.sendRequest(
      numberArg,
      stringArgs,
      objectArg,
      ac,
    )
  }

  @action async actionWithSuperCall (...args: unknown[]): Promise<void> {
    await super.actionWithSuperCall(...(args as []))
  }

  @action async singleErrorAction (): Promise<void> {
    return Promise.reject(new Error())
  }

  @action async rootSuccessAction (): Promise<void> {
    console.log('rootSuccessAction')

    await this.nestedActionA()
    await this.nestedActionB()
  }

  @action async rootErrorAction (): Promise<void> {
    await this.nestedActionA()
    // inside this action an error will be thrown and the action  will get the Error status.
    // But the current action will be completed successfully
    // and will receive the “Ready” status.
    //
    // If it is necessary for the current action to receive an error status,
    // you need to check the status of the child action and throw an error
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

  @action async rootWithNestedAndAbort (abortCurrent: boolean, abortController = new AbortController()): Promise<void> {
    // we share abortController, but it will not abort all actions.
    // Each action call has separate Promise
    // So, aborting nested action will reject Promise of the nested action only
    // Current action Promise will be resolved succesfully.
    await this.nestedWithAbort(abortController)

    // To abort current action after nested we should
    // 1. check that the nested action state is abort
    // 2. throw new DOMException('', 'AbortError') - this execption switchs state of the current action to abort
    if (abortCurrent && this.action(this.nestedWithAbort).isAbort) {
      throw new DOMException('', 'AbortError')
    }
  }

  // we can define async method without @action decorator,
  // From external scope it will be seen as regular method
  async regularAsyncMethodWithError (message: string): Promise<void> {
    return Promise.reject(new Error(message))
  }

  // All methods below are not considered as Actions
  // because an Action is an asynchronous method with void result.
  regularMethodWithError (): void {
    throw new Error()
  }

  regularMethodWithData<T> (data:T): T {
    return data
  }

  async regularAsyncMethodWithData<T> (data: T): Promise<T> {
    return Promise.resolve(data)
  }

  // IMPORTANT: if yo need call action inside a regular method
  // you should convert the method to action.
  // Method which calls action is action
  //
  // But inside regular method you can take a Action as object to get it state.
  // Use for it  this.action(this.some Action)
  regularMethodWithActionInside (): ShallowReactive<ActionPublic> {
    return this.action(this.nestedActionA)
  }
}
