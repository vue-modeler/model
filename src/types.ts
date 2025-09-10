import { Action } from './action'
import { ProtoModel } from './proto-model'

export type ActionPublic = Omit<Action, 'call'>
export type OriginalMethod = (...args: any[]) => Promise<void>

export interface OriginalMethodWrapper<Args extends unknown[] = unknown[]> {
  (...args: Args): Promise<void>
  [Action.actionFlag]: OriginalMethod
}

export type ActionStateName = keyof typeof Action.possibleState

export type ProtectedMethodInModel = 'action' | 'setActionState'
export type Model<T> = {
  [K in keyof T]:
    T[K] extends ((...args: infer Args) => Promise<void>)
      ? Action<Args>
      : K extends ProtectedMethodInModel
        ? never
        : T[K]
}

export type ModelAdapterProxyConstructor = new <Target extends ProtoModel>(
  target: Target,
  handler: ProxyHandler<Target>
) => Model<Target>

export type ModelConstructor<T extends new (...args: unknown[]) => unknown> = T extends new (...args: unknown[]) => infer R
  ? R extends ProtoModel
    ? T
    : never
  : never
