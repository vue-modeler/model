---
title: Обработка ошибок
description: Подробное руководство по обработке ошибок в Vue Modeler
---

# Обработка ошибок

Vue Modeler предоставляет мощную систему обработки ошибок, которая автоматически отслеживает и управляет ошибками в действиях.

## Типы ошибок

Vue Modeler определяет несколько типов ошибок:

### ActionError
Базовый класс для всех ошибок действий:

```typescript
import { ActionError } from 'vue-modeler'

// Создание пользовательской ошибки
const error = new ActionError('Custom error message')
```

### ActionInternalError
Ошибки внутренней логики библиотеки:

```typescript
import { ActionInternalError } from 'vue-modeler'

// Ошибка возникает при неправильном использовании API
throw new ActionInternalError('Action decorator is not applied to the method')
```

### ActionStatusConflictError
Ошибки конфликта состояний действий:

```typescript
import { ActionStatusConflictError } from 'vue-modeler'

// Ошибка возникает при попытке изменить состояние действия неправильным образом
throw new ActionStatusConflictError(
  'fetchUsers',
  'pending',
  'ready'
)
```

### ActionUnexpectedAbortError
Ошибки неожиданной отмены действий:

```typescript
import { ActionUnexpectedAbortError } from 'vue-modeler'

// Ошибка возникает при неожиданной отмене действия
throw new ActionUnexpectedAbortError('fetchUsers', 'ready')
```

## Автоматическая обработка ошибок

### Базовый пример

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
      throw error // Перебрасываем для обработки в UI
    }
  }
}
```

### Проверка ошибок в UI

```vue
<template>
  <div>
    <!-- Индикатор ошибки -->
    <div v-if="userModel.fetchUsers.isError" class="error">
      <h3>Ошибка загрузки пользователей</h3>
      <p>{{ userModel.fetchUsers.error?.message }}</p>
      <button @click="retryFetch">Повторить</button>
    </div>

    <!-- Список пользователей -->
    <ul v-else>
      <li v-for="user in userModel.users" :key="user.id">
        {{ user.name }}
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
const retryFetch = async () => {
  userModel.fetchUsers.resetError()
  await userModel.fetchUsers.exec()
}
</script>
```

## Сброс ошибок

### Ручной сброс

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Логика действия
  }

  async retryWithReset() {
    // Сбрасываем ошибку перед повторной попыткой
    if (this.fetchUsers.isError) {
      this.fetchUsers.resetError()
    }

    await this.fetchUsers.exec()
  }
}
```

### Автоматический сброс при новом выполнении

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Ошибка автоматически сбрасывается при новом выполнении
    const response = await fetch('/api/users')
    this.users = await response.json()
  }
}
```

## Типизированная обработка ошибок

### Пользовательские ошибки

```typescript
// Определение пользовательских ошибок
class UserNotFoundError extends Error {
  constructor(userId: number) {
    super(`User with id ${userId} not found`)
    this.name = 'UserNotFoundError'
  }
}

class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error in ${field}: ${message}`)
    this.name = 'ValidationError'
  }
}

export class UserModel extends ProtoModel {
  @action async fetchUser(id: number): Promise<void> {
    try {
      const response = await fetch(`/api/users/${id}`)
      
      if (response.status === 404) {
        throw new UserNotFoundError(id)
      }
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const user = await response.json()
      this.selectedUser = user
    } catch (error) {
      console.error('Failed to fetch user:', error)
      throw error
    }
  }

  @action async createUser(userData: any): Promise<void> {
    try {
      // Валидация
      if (!userData.name) {
        throw new ValidationError('name', 'Name is required')
      }
      
      if (!userData.email) {
        throw new ValidationError('email', 'Email is required')
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

### Обработка разных типов ошибок

```vue
<template>
  <div>
    <div v-if="userModel.fetchUser.isError" class="error">
      <div v-if="isUserNotFoundError" class="not-found">
        <h3>Пользователь не найден</h3>
        <p>{{ userModel.fetchUser.error?.message }}</p>
        <button @click="goBack">Назад</button>
      </div>
      
      <div v-else-if="isNetworkError" class="network-error">
        <h3>Ошибка сети</h3>
        <p>Проверьте подключение к интернету</p>
        <button @click="retryFetch">Повторить</button>
      </div>
      
      <div v-else class="general-error">
        <h3>Произошла ошибка</h3>
        <p>{{ userModel.fetchUser.error?.message }}</p>
        <button @click="retryFetch">Повторить</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const isUserNotFoundError = computed(() => {
  return userModel.fetchUser.error?.name === 'UserNotFoundError'
})

const isNetworkError = computed(() => {
  return userModel.fetchUser.error instanceof TypeError
})

const retryFetch = async () => {
  userModel.fetchUser.resetError()
  await userModel.fetchUser.exec(userId.value)
}

const goBack = () => {
  // Логика возврата
}
</script>
```

## Повторные попытки

### Простая повторная попытка

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async fetchWithRetry(maxRetries = 3) {
    let retries = 0

    while (retries < maxRetries) {
      try {
        await this.fetchUsers.exec()
        return // Успешно
      } catch (error) {
        retries++
        console.log(`Попытка ${retries} из ${maxRetries} не удалась`)

        if (retries >= maxRetries) {
          console.error('Все попытки исчерпаны')
          throw error
        }

        // Ждем перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 1000 * retries))
      }
    }
  }
}
```

### Умная повторная попытка

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async smartRetry() {
    let retries = 0
    const maxRetries = 3
    const baseDelay = 1000

    while (retries < maxRetries) {
      try {
        await this.fetchUsers.exec()
        return
      } catch (error) {
        retries++
        
        // Проверяем тип ошибки
        if (error instanceof TypeError) {
          // Ошибка сети - ждем дольше
          await new Promise(resolve => setTimeout(resolve, baseDelay * retries * 2))
        } else if (error.message.includes('500')) {
          // Ошибка сервера - ждем еще дольше
          await new Promise(resolve => setTimeout(resolve, baseDelay * retries * 3))
        } else {
          // Другие ошибки - не повторяем
          throw error
        }

        if (retries >= maxRetries) {
          throw error
        }
      }
    }
  }
}
```

## Глобальная обработка ошибок

### Мониторинг всех ошибок

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }
  @action async deleteUser(): Promise<void> { }

  // Проверка наличия ошибок
  get hasAnyErrors(): boolean {
    return this.hasActionWithError
  }

  // Получение всех действий с ошибками
  get actionsWithErrors(): string[] {
    const errors = []
    if (this.fetchUsers.isError) errors.push('fetchUsers')
    if (this.createUser.isError) errors.push('createUser')
    if (this.deleteUser.isError) errors.push('deleteUser')
    return errors
  }

  // Сброс всех ошибок
  resetAllErrors(): void {
    if (this.fetchUsers.isError) this.fetchUsers.resetError()
    if (this.createUser.isError) this.createUser.resetError()
    if (this.deleteUser.isError) this.deleteUser.resetError()
  }
}
```

### Глобальный обработчик ошибок

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    try {
      const response = await fetch('/api/users')
      this.users = await response.json()
    } catch (error) {
      this.handleError('fetchUsers', error)
      throw error
    }
  }

  private handleError(actionName: string, error: any): void {
    // Логирование ошибки
    console.error(`Error in ${actionName}:`, error)

    // Отправка в систему мониторинга
    this.sendToMonitoring(actionName, error)

    // Уведомление пользователя
    this.showNotification(error)
  }

  private sendToMonitoring(actionName: string, error: any): void {
    // Отправка в систему мониторинга (например, Sentry)
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        tags: {
          action: actionName,
          model: 'UserModel'
        }
      })
    }
  }

  private showNotification(error: any): void {
    // Показ уведомления пользователю
    if (window.toast) {
      window.toast.error(error.message)
    }
  }
}
```

## Лучшие практики

### 1. Специфичные ошибки

```typescript
// ✅ Хорошо - специфичные ошибки
class UserNotFoundError extends Error {
  constructor(userId: number) {
    super(`User with id ${userId} not found`)
    this.name = 'UserNotFoundError'
  }
}

class ValidationError extends Error {
  constructor(field: string, message: string) {
    super(`Validation error in ${field}: ${message}`)
    this.name = 'ValidationError'
  }
}

// ❌ Плохо - общие ошибки
throw new Error('Something went wrong')
```

### 2. Информативные сообщения

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    try {
      const response = await fetch('/api/users')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`)
      }
      
      this.users = await response.json()
    } catch (error) {
      // ✅ Хорошо - информативное сообщение
      console.error('Failed to fetch users:', error)
      
      // ❌ Плохо - неинформативное сообщение
      console.error('Error:', error)
      
      throw error
    }
  }
}
```

### 3. Правильная обработка в UI

```vue
<template>
  <div>
    <!-- ✅ Хорошо - детальная обработка -->
    <div v-if="userModel.fetchUsers.isError" class="error">
      <div v-if="isNetworkError" class="network-error">
        <h3>Ошибка сети</h3>
        <p>Проверьте подключение к интернету</p>
        <button @click="retryFetch">Повторить</button>
      </div>
      
      <div v-else class="general-error">
        <h3>Ошибка загрузки</h3>
        <p>{{ userModel.fetchUsers.error?.message }}</p>
        <button @click="retryFetch">Повторить</button>
      </div>
    </div>

    <!-- ❌ Плохо - общая обработка -->
    <div v-if="userModel.fetchUsers.isError">
      Ошибка: {{ userModel.fetchUsers.error?.message }}
    </div>
  </div>
</template>
```

### 4. Логирование ошибок

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    try {
      const response = await fetch('/api/users')
      this.users = await response.json()
    } catch (error) {
      // ✅ Хорошо - детальное логирование
      console.error('Failed to fetch users:', {
        error: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        action: 'fetchUsers'
      })
      
      throw error
    }
  }
}
```

## Следующие шаги

Теперь, когда вы изучили обработку ошибок, вы можете:

1. [Изучить отмену операций](/guides/abort/)
2. [Познакомиться с блокировкой действий](/guides/locking/)
3. [Изучить жизненный цикл](/guides/lifecycle/)
4. [Посмотреть примеры](/examples/) 