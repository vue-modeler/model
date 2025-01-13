
import { Action } from './action'
import { ProtoModel } from './proto-model'

export type ActionPublic = Omit<Action, 'call'>
export type OriginalMethod<Args extends unknown[] = unknown[]> = (...args: Args) => void | Promise<void>

export interface OriginalMethodWrapper<Args extends unknown[] = unknown[]> {
  (...args: Args): void | Promise<void>
  [Action.actionFlag]: OriginalMethod
}

export type ActionStateName = keyof typeof Action.state

export type Model<T> = {
  [K in keyof T]:
    T[K] extends ((...args: infer Args) => Promise<void>)
      ? Action<Args>
      : K extends 'action'
        ? never
        : T[K]
}

export interface ModelAdapterProxyConstructor {
  new <Target extends ProtoModel>(target: Target, handler: ProxyHandler<Target>): Model<Target>
}

export type ModelConstructor<T extends { new (...args: any[]): any }> = T extends { new (...args: any[]): infer R }
  ? R extends ProtoModel
    ? T
    : never
  : never
