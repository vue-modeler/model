import { ComputedRef, ref } from 'vue'

import { ProtoModel } from '../../src/proto-model'

export class TestProtoModel extends ProtoModel {
  readonly debug = 'debug'

  protected _counter = ref(0)

  protected _computedFromConstructor: ComputedRef<number>
  protected _computedFromHook: ComputedRef<number> | null = null

  constructor (
    initCounterValue: number,
    protected watchers: {
      watcherInConstructor: (count: number) => void
      computedInConstructor: () => void
    },
  ) {
    super()

    this._counter.value = initCounterValue

    this._computedFromConstructor = this.computed(
      () => {
        this.watchers.computedInConstructor()

        return this._counter.value * 2
      },
    )

    this.watch(
      () => this._counter.value,
      this.watchers.watcherInConstructor,
    )
  }

  get counter (): number {
    return this._counter.value
  }

  get computedFromHook (): number {
    return this._computedFromHook?.value || this._counter.value
  }

  get computedFromConstructor (): number {
    return this._computedFromConstructor?.value || this._counter.value
  }

  inc (): void {
    this._counter.value = this._counter.value + 1
  }
}
