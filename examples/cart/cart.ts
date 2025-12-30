import { ProtoModel, action } from '../../src'
import { ShallowReactive } from 'vue'

interface ApiService {
  fetchAll: () => Promise<string[]>
  add: (sku: string) => Promise<string[]>
  remove: (sku: string) => Promise<string[]>
}

interface User {
  isLoggedIn: boolean
}

export class Cart extends ProtoModel {
  protected _items: Set<string> = new Set()

  constructor(
    private user: ShallowReactive<User> ,
    private api: ApiService,
  ) {
    super()

    this.watch(
      () => this.user.isLoggedIn,
      (isLoggedIn: boolean) => {
        if (isLoggedIn) {
          this.init()

          return 
        }

        this._items = new Set()
      },
      { immediately: true },
    )
  }

  get items(): Set<string> {
    return this._items
  }

  @action async init(): Promise<void> {
    const res = await this.api.fetchAll()
    this._items = new Set(res)
  }
  

  @action async add(sku: string): Promise<void> {
    const res = await this.api.add(sku)
    this._items = new Set(res)
  }

  @action async remove(sku: string): Promise<void> {
    const res = await this.api.remove(sku)
    this._items = new Set(res)
  }
}