---
title: Жизненный цикл
description: Подробное руководство по жизненному циклу моделей и действий в Vue Modeler
---

# Жизненный цикл

Vue Modeler предоставляет детальный контроль над жизненным циклом моделей и действий, что позволяет эффективно управлять ресурсами и состоянием.

## Жизненный цикл модели

### Создание модели

```typescript
export class UserModel extends ProtoModel {
  constructor() {
    super() // Вызывается конструктор базового класса
    console.log('Модель создана')
  }
}
```

### Инициализация

```typescript
export class UserModel extends ProtoModel {
  private interval: number
  private eventListeners: Array<() => void> = []

  constructor() {
    super()
    
    // Инициализация ресурсов
    this.interval = setInterval(() => {
      this.updateData()
    }, 5000)

    // Добавление слушателей событий
    const listener = () => this.handleResize()
    window.addEventListener('resize', listener)
    this.eventListeners.push(() => window.removeEventListener('resize', listener))
  }
}
```

### Уничтожение модели

```typescript
export class UserModel extends ProtoModel {
  private interval: number
  private eventListeners: Array<() => void> = []

  constructor() {
    super()
    this.interval = setInterval(() => {
      this.updateData()
    }, 5000)
  }

  destructor() {
    // Очистка интервалов
    clearInterval(this.interval)
    
    // Удаление слушателей событий
    this.eventListeners.forEach(removeListener => removeListener())
    this.eventListeners = []
    
    // Вызов деструктора базового класса
    super.destructor()
    
    console.log('Модель уничтожена')
  }
}
```

## Жизненный цикл действий

### Состояния действий

Действие проходит через следующие состояния:

1. **Ready** - готово к выполнению
2. **Pending** - выполняется
3. **Ready** - завершено успешно
4. **Error** - завершено с ошибкой
5. **Abort** - отменено
6. **Lock** - заблокировано

### Отслеживание состояний

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    console.log('Действие началось')
    
    try {
      const response = await fetch('/api/users')
      this.users = await response.json()
      console.log('Действие завершено успешно')
    } catch (error) {
      console.log('Действие завершено с ошибкой:', error)
      throw error
    }
  }

  monitorActionLifecycle() {
    const action = this.fetchUsers
    
    // Отслеживаем изменения состояний
    this.watch(() => action.state, (newState, oldState) => {
      console.log(`Состояние изменилось: ${oldState} -> ${newState}`)
    })
  }
}
```

## Управление ресурсами

### Автоматическая очистка

```typescript
export class UserModel extends ProtoModel {
  private intervals: number[] = []
  private timeouts: number[] = []
  private subscriptions: Array<() => void> = []

  constructor() {
    super()
    
    // Создание ресурсов
    this.setupAutoRefresh()
    this.setupEventListeners()
  }

  private setupAutoRefresh() {
    const interval = setInterval(() => {
      this.refreshData()
    }, 30000)
    this.intervals.push(interval)
  }

  private setupEventListeners() {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        this.pauseUpdates()
      } else {
        this.resumeUpdates()
      }
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    this.subscriptions.push(() => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    })
  }

  destructor() {
    // Очистка интервалов
    this.intervals.forEach(clearInterval)
    this.intervals = []
    
    // Очистка таймаутов
    this.timeouts.forEach(clearTimeout)
    this.timeouts = []
    
    // Отписка от событий
    this.subscriptions.forEach(unsubscribe => unsubscribe())
    this.subscriptions = []
    
    super.destructor()
  }
}
```

### Управление памятью

```typescript
export class UserModel extends ProtoModel {
  private cache = new Map<string, any>()
  private cacheSize = 0
  private maxCacheSize = 100

  setCacheItem(key: string, value: any) {
    // Удаляем старые элементы при превышении лимита
    if (this.cacheSize >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
      this.cacheSize--
    }
    
    this.cache.set(key, value)
    this.cacheSize++
  }

  destructor() {
    // Очищаем кэш
    this.cache.clear()
    this.cacheSize = 0
    
    super.destructor()
  }
}
```

## Жизненный цикл с зависимостями

### Внедрение зависимостей

```typescript
export class UserModel extends ProtoModel {
  constructor(
    private apiService: ApiService,
    private storageService: StorageService
  ) {
    super()
  }

  @action async fetchUsers(): Promise<void> {
    const users = await this.apiService.getUsers()
    this.users = users
    this.storageService.save('users', users)
  }

  destructor() {
    // Очистка зависимостей
    this.storageService.clear('users')
    super.destructor()
  }
}
```

### Управление внешними ресурсами

```typescript
export class UserModel extends ProtoModel {
  private websocket: WebSocket | null = null
  private reconnectTimer: number | null = null

  constructor() {
    super()
    this.setupWebSocket()
  }

  private setupWebSocket() {
    this.websocket = new WebSocket('ws://localhost:8080')
    
    this.websocket.onmessage = (event) => {
      this.handleMessage(JSON.parse(event.data))
    }
    
    this.websocket.onclose = () => {
      this.scheduleReconnect()
    }
  }

  private scheduleReconnect() {
    this.reconnectTimer = window.setTimeout(() => {
      this.setupWebSocket()
    }, 5000)
  }

  destructor() {
    // Закрываем WebSocket
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
    
    // Очищаем таймер переподключения
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    
    super.destructor()
  }
}
```

## Мониторинг жизненного цикла

### Отслеживание изменений

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  setupLifecycleMonitoring() {
    // Отслеживаем изменения пользователей
    this.watch(() => this.users, (newUsers, oldUsers) => {
      console.log('Пользователи изменились:', {
        old: oldUsers?.length || 0,
        new: newUsers?.length || 0
      })
    })

    // Отслеживаем состояние действия
    this.watch(() => this.fetchUsers.state, (newState) => {
      console.log('Состояние fetchUsers:', newState)
    })
  }
}
```

### Логирование жизненного цикла

```typescript
export class UserModel extends ProtoModel {
  private lifecycleLog: string[] = []

  constructor() {
    super()
    this.logLifecycle('constructor')
  }

  @action async fetchUsers(): Promise<void> {
    this.logLifecycle('fetchUsers started')
    
    try {
      const response = await fetch('/api/users')
      this.users = await response.json()
      this.logLifecycle('fetchUsers completed')
    } catch (error) {
      this.logLifecycle('fetchUsers failed')
      throw error
    }
  }

  private logLifecycle(event: string) {
    const timestamp = new Date().toISOString()
    this.lifecycleLog.push(`${timestamp}: ${event}`)
    console.log(`[Lifecycle] ${event}`)
  }

  destructor() {
    this.logLifecycle('destructor')
    super.destructor()
  }

  getLifecycleLog(): string[] {
    return [...this.lifecycleLog]
  }
}
```

## Асинхронный жизненный цикл

### Асинхронная инициализация

```typescript
export class UserModel extends ProtoModel {
  private initialized = false

  constructor() {
    super()
    this.initializeAsync()
  }

  private async initializeAsync() {
    try {
      // Загружаем конфигурацию
      const config = await this.loadConfig()
      this.applyConfig(config)
      
      // Инициализируем сервисы
      await this.initializeServices()
      
      this.initialized = true
      console.log('Модель асинхронно инициализирована')
    } catch (error) {
      console.error('Ошибка инициализации:', error)
    }
  }

  @action async fetchUsers(): Promise<void> {
    if (!this.initialized) {
      throw new Error('Модель не инициализирована')
    }
    
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  private async loadConfig(): Promise<any> {
    const response = await fetch('/api/config')
    return response.json()
  }

  private applyConfig(config: any): void {
    // Применяем конфигурацию
  }

  private async initializeServices(): Promise<void> {
    // Инициализируем сервисы
  }
}
```

### Асинхронная очистка

```typescript
export class UserModel extends ProtoModel {
  private cleanupTasks: Array<() => Promise<void>> = []

  constructor() {
    super()
    this.setupCleanupTasks()
  }

  private setupCleanupTasks() {
    this.cleanupTasks.push(async () => {
      // Сохраняем данные
      await this.saveData()
    })

    this.cleanupTasks.push(async () => {
      // Закрываем соединения
      await this.closeConnections()
    })
  }

  async destructor() {
    console.log('Начинаем асинхронную очистку')
    
    // Выполняем задачи очистки
    for (const task of this.cleanupTasks) {
      try {
        await task()
      } catch (error) {
        console.error('Ошибка при очистке:', error)
      }
    }
    
    super.destructor()
    console.log('Асинхронная очистка завершена')
  }

  private async saveData(): Promise<void> {
    // Сохранение данных
  }

  private async closeConnections(): Promise<void> {
    // Закрытие соединений
  }
}
```

## Лучшие практики

### 1. Всегда вызывайте super.destructor()

```typescript
export class UserModel extends ProtoModel {
  destructor() {
    // Очистка ресурсов
    this.cleanupResources()
    
    // ✅ Хорошо - всегда вызываем super.destructor()
    super.destructor()
  }
}
```

### 2. Используйте try-finally для критических ресурсов

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const controller = new AbortController()
    
    try {
      const response = await fetch('/api/users', {
        signal: controller.signal
      })
      this.users = await response.json()
    } finally {
      // ✅ Хорошо - очищаем ресурсы в finally
      controller.abort()
    }
  }
}
```

### 3. Отслеживайте утечки памяти

```typescript
export class UserModel extends ProtoModel {
  private resourceCount = 0

  addResource() {
    this.resourceCount++
    console.log(`Ресурс добавлен, всего: ${this.resourceCount}`)
  }

  removeResource() {
    this.resourceCount--
    console.log(`Ресурс удален, всего: ${this.resourceCount}`)
  }

  destructor() {
    if (this.resourceCount > 0) {
      console.warn(`Внимание: ${this.resourceCount} ресурсов не очищено`)
    }
    super.destructor()
  }
}
```

### 4. Используйте слабые ссылки для кэша

```typescript
export class UserModel extends ProtoModel {
  private cache = new WeakMap<object, any>()

  setCacheItem(key: object, value: any) {
    this.cache.set(key, value)
  }

  getCacheItem(key: object): any {
    return this.cache.get(key)
  }

  // WeakMap автоматически очищает память при удалении ключей
}
```

## Следующие шаги

Теперь, когда вы изучили жизненный цикл, вы можете:

1. [Изучить обработку ошибок](/guides/error-handling/)
2. [Познакомиться с отменой операций](/guides/abort/)
3. [Изучить блокировку действий](/guides/locking/)
4. [Посмотреть примеры](/examples/) 