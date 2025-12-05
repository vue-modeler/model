import { ProtoModel } from "./proto-model"
import { ActionLike } from './action'

export class ActionExecutor<T extends object> extends ProtoModel {
  protected _servedAction: ActionLike<T> | null = null
  protected _args: unknown[] | null = null
  protected _error: ActionLike<T>['error'] | null = null

  init<Args extends unknown[]>(action: ActionLike<T, Args>, ...args: Args): void {
    this._servedAction = action as ActionLike<T>
    this._args = args
    this._error = null
  } 

  get servedAction(): ActionLike<T> | null {
    return this._servedAction
  }

  get args(): unknown[] | null {
    return this._args
  }

  get error(): ActionLike<T>['error'] | null {
    return this._error
  }

  async exec(): Promise<boolean> {
    if (!this._servedAction || !this._args) {
      throw new Error('Action not initialized')
    }

    await this._servedAction.exec(...this._args)
  
    if (this._servedAction.error) {
      this._error = this._servedAction.error
      
      return false
    }

    this.reset()

    return true
  }

  reset(): void {
    this._error = null
    this._servedAction = null
    this._args = null
  }
}