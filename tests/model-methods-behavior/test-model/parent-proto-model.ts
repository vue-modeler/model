import { action } from '../../../src/decorator/action'
import { ProtoModel } from '../../../src/proto-model'

export class ParentProtoModel extends ProtoModel {
  readonly debug = 'debug'

  constructor (
    readonly api: { sendRequestFromParent: (...args: unknown[]) => Promise<unknown> },
  ) {
    super()
  }

  @action async actionWithSuperCall (...args: unknown[]): Promise<void> {
    await this.api.sendRequestFromParent(...args)
  }
}
