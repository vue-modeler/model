import { ProtoModel } from "./proto-model"
import { SrActionLike } from './action'

export class ActionExecutor<T extends object> extends ProtoModel {
  protected _servedAction: SrActionLike<T> | null = null
  protected _args: unknown[] | null = null
  protected _error: SrActionLike<T>['error'] | null = null

  init<Args extends unknown[]>(action: SrActionLike<T, Args>, ...args: Args): void {
    this._servedAction = action as SrActionLike<T>
    this._args = args
    this._error = null
  } 

  get servedAction(): SrActionLike<T> | null {
    return this._servedAction
  }

  get args(): unknown[] | null {
    return this._args
  }

  get error(): SrActionLike<T>['error'] | null {
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