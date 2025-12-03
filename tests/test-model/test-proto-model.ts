import { ShallowReactive } from 'vue'

import { action } from '../../src/decorator'
import { Action } from '../../src/types'
import { ParentProtoModel } from './parent-proto-model'

export interface ApiService {
  sendRequest: (...args: unknown[]) => Promise<unknown>
  sendRequestFromParent: (...args: unknown[]) => Promise<unknown>
}

export class TestProtoModel extends ParentProtoModel {
  readonly debug = 'debug'

  normalProperty = 1

  constructor (
    readonly api: {
      sendRequest: (...args: unknown[]) => Promise<unknown>
      sendRequestFromParent: (...args: unknown[]) => Promise<unknown>
    },
    readonly testReadonly: string | null = null,
  ) {
    super(api)
  }

  get someGetter (): number {
    return 1 + 1
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
    return Promise.reject(new Error('message'))
  }

  @action async actionWithCustomError (error: Error): Promise<void> {
    await new Promise((resolve, reject) => {
      reject(error)
    })
  }

  @action async rootSuccessAction (): Promise<void> {
    await this.nestedActionA()
    await this.nestedActionB()
  }

  @action async rootErrorAction (): Promise<void> {
    await this.nestedActionA()
    // Error will be thrown inside singleErrorAction and it will get the Error status.
    // But rootErrorAction action will be completed successfully
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

  @action async actionWithAbort (abortController = new AbortController()): Promise<void> {
    await new Promise((resolve, reject) => {
      abortController.signal.addEventListener('abort', () => {
        reject(new DOMException('', 'AbortError'))
      })
    })
  }

  /**
   * We can share abortController, but it will not abort the whole chain of actions.
   * Each action call has separate Promise scope.
   * So, aborting abortController will reject Promise of the nested action only
   * and nested action state will be abort
   * Current action Promise will be resolved succesfully.
   * 
   * To abort current action after nested we should
   * 1. check that the nested action state is abort
   * 2. throw new DOMException('', 'AbortError') - this execption switchs state of the current action to abort
   * 
   * Example:
   * 
   * ```ts
   * if (this.action(this.nestedWithAbort as OriginalMethodWrapper<[]>).isAbort) {
   *   throw new DOMException('', 'AbortError')
   * }
   * ```
   */
  @action async rootWithNestedAndAbort (options: { shareAbortController: boolean }, abortController = new AbortController()): Promise<void> {
    if (options.shareAbortController) {
      await this.actionWithAbort(abortController)
    } else {
      await this.actionWithAbort()
    }
  }

  /**
   * We can define ASYNC METHOD WITCH RETURNS VOID WITHOUT @action DECORATOR,
   * From external scope it will be seen as Action
   * But it is not Action, because decorator is not applied.
   * Thus, trying to call model.normalAsyncMethod.exec() will THROW AN ERROR IN RUNTIME
   */
  async normalAsyncMethodWithVoidResult (message: string): Promise<void> {
    return Promise.reject(new Error(message))
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @action async normalAsyncMethodWithReturnDataAsAction (data: number): Promise<number> {
    return Promise.resolve(data)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @action normalSyncMethodWithReturnDataAsAction (num: number): number {
    return num + 1
  }
  
  
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  @action normalSyncMethodWithVoid (): void {
    return 
  }

  /**
   * All methods below are not considered as Actions
   * because an Action is an asynchronous method with void result.
   */
  normalSyncMethodWithError (): void {
    throw new Error()
  }

  normalSyncMethodWithData<T> (data:T): T {
    return data
  }

  async normalAsyncMethodWithData<T> (data: T): Promise<T> {
    return Promise.resolve(data)
  }

  async normalAsyncMethodWithError (message: string): Promise<string> {
    return Promise.reject(new Error(message))
  }


  /**
   * IMPORTANT: if yo need call action inside a normal method
   * you should apply @action decorator to the normal method.
   * Method which calls action is action
   *
   * But inside normal method you can take a Action as object to get it state.
   * Use for it  this.action(this.someAction)
   */
  normalSyncMethodWithActionInside (): ShallowReactive<Action<this>> {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    return this.action(this.nestedActionA)
  }
  
  
  tryGetActionByMethod (): ShallowReactive<Action<this>> {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return this.action(this.normalSyncMethodWithError.bind(this))
  }
  
}
