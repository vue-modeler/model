import { ShallowReactive } from 'vue'
import { Action, ActionLike } from './action'
import { ProtoModel } from './proto-model'

export type OriginalMethod = (...args: any[]) => Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface OriginalMethodWrapper<Args extends any[] = unknown[]> {
  (...args: Args): Promise<void>
  [Action.actionFlag]: OriginalMethod
}

export type ActionStateName = keyof typeof Action.possibleState

export type ProtectedMethodInModel = 'action' | 'setActionState'
export type Model<T extends object = object> = ShallowReactive<{
  [K in keyof T]:
    T[K] extends ((...args: infer Args) => Promise<void>)
      ? ActionLike<T, Args>
      : K extends ProtectedMethodInModel
        ? never
        : T[K]
}>

export type ModelAdapterProxyConstructor = new <Target extends ProtoModel>(
  target: Target,
  handler: ProxyHandler<Target>
) => Model<Target>

export type ModelConstructor<T extends new (...args: unknown[]) => unknown> = T extends new (...args: unknown[]) => infer R
  ? R extends ProtoModel
    ? T
    : never
  : never
