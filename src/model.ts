import { DependencyFactory, Provider, provider, ProviderOptions } from '@vue-modeler/dc'

import { createModel } from './create-model'
import { ProtoModel } from './proto-model'
import { Model } from './types'

// This is previous version of model. It is not used now.
// It is kept for reference.
//
// export function model<
//   T extends { new (...args: any[]): any },
//   A extends ApplyProvider<ConstructorParameters<T>>
// >(
//   constructor: ModelConstructor<T>,
//   ...originalArgs: A
// ): Provider<ModelAdapter<InstanceType<T>>> {
//   return provider(() => {
//     const args = originalArgs.map(
//       (arg) => (typeof arg === 'function' && isProvider(arg)
//         ? (arg as () => unknown)()
//         : arg
//       ))
//     const model = createModel(new constructor(...args))
//     return model
//   })
// }

type ProviderFactory<T> = (factory: DependencyFactory<T>, options?: ProviderOptions) => Provider<T>

export function model<T extends ProtoModel> (
  modelFactory: () => T,
  options?: ProviderOptions,
): Provider<Model<T>> {
  const factory: DependencyFactory<Model<T>> = () => createModel(modelFactory())

  return (provider as ProviderFactory<Model<T>>)(factory, options)
}
