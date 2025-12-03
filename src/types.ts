import { ActionInner } from './action'
import { ProtoModel } from './proto-model'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Action<Model extends ProtoModel, Args extends any[] = unknown[]> = Omit<ActionInner<Model, Args>, 'call'>
export type OriginalMethod = (...args: any[]) => Promise<void>

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface OriginalMethodWrapper<Args extends any[] = unknown[]> {
  (...args: Args): Promise<void>
  [ActionInner.actionFlag]: OriginalMethod
}

export type ActionStateName = keyof typeof ActionInner.possibleState

export type ProtectedMethodInModel = 'action' | 'setActionState'
export type Model<T> = {
  [K in keyof T]:
    T[K] extends ((...args: infer Args) => Promise<void>)
      ? Action<T extends ProtoModel ? T : never, Args>
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
