import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, shallowReactive, ShallowReactive } from 'vue'
import type { Model } from '../../../src'
import { Cart } from '../cart'

interface ApiService {
  fetchAll: () => Promise<string[]>
  add: (sku: string) => Promise<string[]>
  remove: (sku: string) => Promise<string[]>
}

interface User {
  isLoggedIn: boolean
}

describe('Cart', () => {
  let apiService: ApiService
  let user: ShallowReactive<User>
  let cart: Model<Cart>

  beforeEach(() => {
    apiService = {
      fetchAll: vi.fn(),
      add: vi.fn(),
      remove: vi.fn(),
    }

    user = shallowReactive<User>({
      isLoggedIn: false,
    })

    cart = Cart.model(user, apiService)
  })

  describe('initialization', () => {
    it('initializes with empty items when user is not logged in', () => {
      expect(cart.items.size).toBe(0)
      expect(apiService.fetchAll).not.toHaveBeenCalled()
    })

    it('initializes with items from API when user is already logged in', async () => {
      const mockItems = ['sku1', 'sku2']
      vi.mocked(apiService.fetchAll).mockResolvedValue(mockItems)

      const loggedInUser = shallowReactive<User>({ isLoggedIn: true })
      const cartWithLoggedInUser = Cart.model(loggedInUser, apiService)

      await nextTick()
      await cartWithLoggedInUser.init.promise

      expect(apiService.fetchAll).toHaveBeenCalledTimes(1)
      expect(cartWithLoggedInUser.items.size).toBe(2)
      expect(Array.from(cartWithLoggedInUser.items)).toEqual(mockItems)
    })
  })

  describe('items getter', () => {
    
    it('returns empty Set initially', () => {
      expect(cart.items).toBeInstanceOf(Set)
      expect(cart.items.size).toBe(0)
    })
  })

  describe('init action', () => {
    it('loads items from API when user logs in and updates cart items', async () => {
      const mockItems = ['sku1', 'sku2', 'sku3']
      vi.mocked(apiService.fetchAll).mockResolvedValue(mockItems)

      user.isLoggedIn = true
      await nextTick()

      expect(apiService.fetchAll).toHaveBeenCalledTimes(1)
      expect(cart.items.size).toBe(3)
      expect(Array.from(cart.items)).toEqual(mockItems)
    })

    it('replaces existing items when init is called manually after initial load', async () => {
      const initialItems = ['item1', 'item2']
      const newItems = ['item3', 'item4', 'item5']
      
      vi.mocked(apiService.fetchAll)
        .mockResolvedValueOnce(initialItems)
        .mockResolvedValueOnce(newItems)

      user.isLoggedIn = true
      await nextTick()
      await cart.init.promise
      
      expect(cart.items.size).toBe(2)
      expect(Array.from(cart.items)).toEqual(initialItems)

      await cart.init.exec()

      expect(cart.items.size).toBe(3)
      expect(Array.from(cart.items)).toEqual(newItems)
      expect(apiService.fetchAll).toHaveBeenCalledTimes(2)
    })

    it('handles empty response from API and sets items to empty Set', async () => {
      vi.mocked(apiService.fetchAll).mockResolvedValue([])

      user.isLoggedIn = true
      await nextTick()

      expect(cart.items.size).toBe(0)
    })
  })

  describe('add action', () => {
    it('adds item via API with correct sku and replaces items with API response', async () => {
      const initialItems = ['item1', 'item2']
      const itemsAfterAdd = ['item1', 'item2', 'newItem']
      
      vi.mocked(apiService.fetchAll).mockResolvedValue(initialItems)
      vi.mocked(apiService.add).mockResolvedValue(itemsAfterAdd)

      user.isLoggedIn = true
      await nextTick()

      await cart.add.exec('newItem')

      expect(apiService.add).toHaveBeenCalledWith('newItem')
      expect(cart.items.size).toBe(3)
      expect(Array.from(cart.items)).toEqual(itemsAfterAdd)
    })
  })

  describe('remove action', () => {
    it('removes item via API with correct sku and replaces items with API response', async () => {
      const initialItems = ['item1', 'item2', 'item3']
      const itemsAfterRemove = ['item1', 'item3']
      
      vi.mocked(apiService.fetchAll).mockResolvedValue(initialItems)
      vi.mocked(apiService.remove).mockResolvedValue(itemsAfterRemove)

      user.isLoggedIn = true
      await nextTick()

      await cart.remove.exec('item2')

      expect(apiService.remove).toHaveBeenCalledWith('item2')
      expect(cart.items.size).toBe(2)
      expect(Array.from(cart.items)).toEqual(itemsAfterRemove)
    })

    it('handles removing non-existent item and updates items to empty Set', async () => {
      const itemsAfterRemove: string[] = []
      vi.mocked(apiService.remove).mockResolvedValue(itemsAfterRemove)

      await cart.remove.exec('nonExistent')

      expect(cart.items.size).toBe(0)
    })
  })

  describe('watch behavior', () => {
    it('watches user login state and automatically initializes items when user logs in after creation', async () => {
      const mockItems = ['item1', 'item2']
      vi.mocked(apiService.fetchAll).mockResolvedValue(mockItems)

      // Initially logged out
      expect(cart.items.size).toBe(0)

      // Log in
      user.isLoggedIn = true
      await nextTick()

      expect(apiService.fetchAll).toHaveBeenCalledTimes(1)
      expect(cart.items.size).toBe(2)
      expect(Array.from(cart.items)).toEqual(mockItems)
    })

    it('watches user login state and clears items immediately when user logs out', async () => {
      const mockItems = ['item1', 'item2', 'item3']
      vi.mocked(apiService.fetchAll).mockResolvedValue(mockItems)

      // Log in
      user.isLoggedIn = true
      await nextTick()
      expect(cart.items.size).toBe(3)

      // Log out
      user.isLoggedIn = false
      await nextTick()

      expect(cart.items.size).toBe(0)
    })

    it('watches user login state and re-initializes items when user logs back in after logout', async () => {
      const firstItems = ['item1', 'item2']
      const secondItems = ['item3', 'item4', 'item5']
      
      vi.mocked(apiService.fetchAll)
        .mockResolvedValueOnce(firstItems)
        .mockResolvedValueOnce(secondItems)

      // First login
      user.isLoggedIn = true
      await nextTick()
      expect(cart.items.size).toBe(2)

      // Log out
      user.isLoggedIn = false
      await nextTick()
      expect(cart.items.size).toBe(0)

      // Log in again
      user.isLoggedIn = true
      await nextTick()
      expect(cart.items.size).toBe(3)
      expect(Array.from(cart.items)).toEqual(secondItems)
      expect(apiService.fetchAll).toHaveBeenCalledTimes(2)
    })
  })

})

