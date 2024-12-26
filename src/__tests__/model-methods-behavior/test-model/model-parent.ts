import { action } from '../../../decorator/action'
import { ProtoModel } from '../../../proto-model'

export class ModelParent extends ProtoModel {
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
