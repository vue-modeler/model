import { action } from '../../src/decorator/action'
import { ProtoModel } from '../../src/proto-model'

export class ParentProtoModel extends ProtoModel {
  readonly debug = 'debug'

  normalParentPropery = 1

  constructor (
    readonly api: { sendRequestFromParent: (...args: unknown[]) => Promise<unknown> },
  ) {
    super()
  }

  get parentGetter(): number {
    return 1 + 1
  }

  normalSyncMethodFromParent (data: number): number {
    return data
  }

  @action async actionWithSuperCall (...args: unknown[]): Promise<void> {
    await this.api.sendRequestFromParent(...args)
  }
}
