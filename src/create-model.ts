import { ProtoModel } from './proto-model'

/**
 * Wraps ProtoModel instance with proxy to handle get traps for actions
 * and to return Action instance instead of original method.
 * 
 * This is a convenience export. The actual implementation is in ProtoModel.createModel.
 * 
 * @param protoModel - ProtoModel instance.
 * @returns model instance wrapped with proxy.
 * @see src/proto-model.ts
 */
export function createModel<Target extends ProtoModel> (
  protoModel: Target,
): ReturnType<typeof ProtoModel.createModel<Target>> {
  return ProtoModel.createModel(protoModel)
}
