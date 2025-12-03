import { ProtoModel } from "./proto-model"
import { Action } from './types'

export class ActionExecutor<Model extends ProtoModel> extends ProtoModel {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected _servedAction: Action<Model, any[]> | null = null
  protected _args: unknown[] | null = null
  protected _error: Action<Model>['error'] | null = null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  init<Args extends any[] = unknown[]>(action: Action<Model, Args>, ...args: Args): void {
    this._servedAction = action satisfies Action<Model, Args>
    this._args = args
    this._error = null
  } 

  get servedAction(): Action<Model> | null {
    return this._servedAction
  }

  get args(): unknown[] | null {
    return this._args
  }

  get error(): Action<Model>['error'] | null {
    return this._error
  }

  async exec(): Promise<void> {
    if (!this._servedAction || !this._args) {
      throw new Error('Action not initialized')
    }

    await this._servedAction.exec(...this._args)
  
    if (this._servedAction.error) {
      this._error = this._servedAction.error
      
      return
    }

    this.reset()
  }

  reset(): void {
    this._error = null
    this._servedAction = null
    this._args = null
  }
}