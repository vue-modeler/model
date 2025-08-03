---
title: Декораторы
description: Подробное руководство по использованию декораторов в Vue Modeler
---

# Декораторы

Декораторы в Vue Modeler предоставляют элегантный способ объявления действий и автоматического управления их жизненным циклом.

## Декоратор @action

Основной декоратор `@action` используется для объявления асинхронных действий:

```typescript
import { ProtoModel } from 'vue-modeler'
import { action } from 'vue-modeler/decorator'

export class UserModel extends ProtoModel {
  users = []

  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async createUser(userData: any): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const newUser = await response.json()
    this.users.push(newUser)
  }
}
```

## Как работает декоратор

Декоратор `@action` выполняет следующие преобразования:

1. **Создание обертки**: Оборачивает оригинальный метод в специальную функцию
2. **Добавление метаданных**: Добавляет флаг `__action_original_method__` к методу
3. **Интеграция с моделью**: Подключает метод к системе управления состояниями

### Внутренняя работа

```typescript
// Что происходит при применении декоратора
@action async fetchUsers(): Promise<void> {
  // Ваш код
}

// Преобразуется в:
async fetchUsers(...args: any[]): Promise<void> {
  return this.action(this.fetchUsers).exec(...args)
}

// С добавлением метаданных:
fetchUsers[Action.actionFlag] = originalMethod
```

## Типы методов с декоратором

### Асинхронные методы

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async createUser(userData: any): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const newUser = await response.json()
    this.users.push(newUser)
  }
}
```

### Синхронные методы

```typescript
export class UserModel extends ProtoModel {
  @action normalSyncMethod(): number {
    return 42
  }

  @action syncMethodWithData(data: string): string {
    return `Processed: ${data}`
  }
}
```

### Методы с параметрами

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUser(id: number): Promise<void> {
    const response = await fetch(`/api/users/${id}`)
    const user = await response.json()
    this.selectedUser = user
  }

  @action async updateUser(id: number, updates: any): Promise<void> {
    const response = await fetch(`/api/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    })
    const updatedUser = await response.json()
    this.updateUserInList(updatedUser)
  }
}
```

## Ограничения декоратора

### Только для методов класса

```typescript
export class UserModel extends ProtoModel {
  // ✅ Правильно - метод класса
  @action async fetchUsers(): Promise<void> {
    // Логика
  }

  // ❌ Неправильно - не метод класса
  const fetchUsers = @action async () => {
    // Логика
  }
}
```

### Только для функций

```typescript
export class UserModel extends ProtoModel {
  // ✅ Правильно - функция
  @action async fetchUsers(): Promise<void> {
    // Логика
  }

  // ❌ Неправильно - не функция
  @action users = []
}
```

### Только в классах ProtoModel

```typescript
// ✅ Правильно - в классе ProtoModel
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Логика
  }
}

// ❌ Неправильно - не в классе ProtoModel
export class RegularClass {
  @action async fetchUsers(): Promise<void> {
    // Логика
  }
}
```

## Использование в наследовании

### Базовый класс с действиями

```typescript
export abstract class BaseModel extends ProtoModel {
  @action async handleRequest<T>(request: Promise<T>): Promise<T> {
    this.loading = true
    try {
      return await request
    } finally {
      this.loading = false
    }
  }
}

export class UserModel extends BaseModel {
  users = []

  @action async fetchUsers(): Promise<void> {
    const users = await this.handleRequest(
      fetch('/api/users').then(res => res.json())
    )
    this.users = users
  }
}
```

### Переопределение действий

```typescript
export class BaseUserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Базовая логика
  }
}

export class AdminUserModel extends BaseUserModel {
  @action async fetchUsers(): Promise<void> {
    // Расширенная логика для админов
    await super.fetchUsers()
    // Дополнительная логика
  }
}
```

## Типизация с декораторами

### Типизированные параметры

```typescript
interface CreateUserData {
  name: string
  email: string
  role?: string
}

export class UserModel extends ProtoModel {
  @action async createUser(userData: CreateUserData): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const newUser = await response.json()
    this.users.push(newUser)
  }
}
```

### Типизированные возвращаемые значения

```typescript
interface User {
  id: number
  name: string
  email: string
}

export class UserModel extends ProtoModel {
  @action async fetchUser(id: number): Promise<User> {
    const response = await fetch(`/api/users/${id}`)
    return await response.json()
  }

  @action async validateEmail(email: string): Promise<boolean> {
    const response = await fetch('/api/validate-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    const result = await response.json()
    return result.isValid
  }
}
```

## Вложенные действия

### Вызов других действий

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async fetchUserDetails(userId: number): Promise<void> {
    const response = await fetch(`/api/users/${userId}/details`)
    const details = await response.json()
    // Обработка деталей
  }

  @action async fetchAllUserData(): Promise<void> {
    // Сначала загружаем список пользователей
    await this.fetchUsers()
    
    // Затем загружаем детали для каждого пользователя
    for (const user of this.users) {
      await this.fetchUserDetails(user.id)
    }
  }
}
```

### Условное выполнение действий

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async processUsers(): Promise<void> {
    // Проверяем состояние другого действия
    if (this.fetchUsers.isReady) {
      // Обрабатываем пользователей
      for (const user of this.users) {
        await this.processUser(user)
      }
    } else {
      throw new Error('Users not loaded')
    }
  }

  private async processUser(user: any): Promise<void> {
    // Логика обработки пользователя
  }
}
```

## Обработка ошибок в декораторах

### Автоматическая обработка

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    try {
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      this.users = await response.json()
    } catch (error) {
      // Ошибка автоматически сохраняется в action.error
      console.error('Failed to fetch users:', error)
      throw error
    }
  }
}
```

### Пользовательские ошибки

```typescript
export class UserModel extends ProtoModel {
  @action async createUser(userData: any): Promise<void> {
    try {
      // Валидация данных
      if (!userData.name || !userData.email) {
        throw new Error('Name and email are required')
      }

      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      })

      if (!response.ok) {
        throw new Error(`Failed to create user: ${response.statusText}`)
      }

      const newUser = await response.json()
      this.users.push(newUser)
    } catch (error) {
      console.error('Failed to create user:', error)
      throw error
    }
  }
}
```

## Лучшие практики

### 1. Именование действий

```typescript
export class UserModel extends ProtoModel {
  // ✅ Хорошо - глаголы в инфинитиве
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }
  @action async updateUser(): Promise<void> { }
  @action async deleteUser(): Promise<void> { }

  // ❌ Плохо - существительные
  @action async users(): Promise<void> { }
  @action async data(): Promise<void> { }
}
```

### 2. Разделение ответственности

```typescript
export class UserModel extends ProtoModel {
  // ✅ Хорошо - одно действие, одна ответственность
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async createUser(userData: any): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const newUser = await response.json()
    this.users.push(newUser)
  }

  // ❌ Плохо - слишком много ответственности
  @action async handleUsers(): Promise<void> {
    // Загрузка, создание, обновление, удаление - все в одном методе
  }
}
```

### 3. Типизация

```typescript
// ✅ Хорошо - с типизацией
interface User {
  id: number
  name: string
  email: string
}

interface CreateUserData {
  name: string
  email: string
}

export class UserModel extends ProtoModel {
  users: User[] = []

  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async createUser(userData: CreateUserData): Promise<void> {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    })
    const newUser: User = await response.json()
    this.users.push(newUser)
  }
}
```

### 4. Обработка ошибок

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    try {
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      this.users = await response.json()
    } catch (error) {
      console.error('Failed to fetch users:', error)
      
      // Можно добавить дополнительную логику
      if (error instanceof TypeError) {
        throw new Error('Network error - check your connection')
      }
      
      throw error
    }
  }
}
```

## Следующие шаги

Теперь, когда вы изучили декораторы, вы можете:

1. [Изучить обработку ошибок](/guides/error-handling/)
2. [Познакомиться с отменой операций](/guides/abort/)
3. [Изучить блокировку действий](/guides/locking/)
4. [Посмотреть примеры](/examples/) 