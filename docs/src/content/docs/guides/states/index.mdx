---
title: Состояния
description: Подробное руководство по состояниям действий в Vue Modeler
---

# Состояния

Состояния - это ключевая концепция Vue Modeler, которая позволяет отслеживать жизненный цикл действий и реагировать на их изменения в UI.

## Обзор состояний

Каждое действие в Vue Modeler может находиться в одном из пяти состояний:

| Состояние | Описание | Свойство |
|-----------|----------|----------|
| **Ready** | Действие готово к выполнению или завершено успешно | `isReady` |
| **Pending** | Действие в данный момент выполняется | `isPending` |
| **Error** | При выполнении произошла ошибка | `isError` |
| **Abort** | Действие было отменено | `isAbort` |
| **Lock** | Действие заблокировано | `isLock` |

## Проверка состояний

### Базовые проверки

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Логика действия
  }

  checkActionState() {
    const action = this.fetchUsers

    if (action.isReady) {
      console.log('Действие готово к выполнению')
    }

    if (action.isPending) {
      console.log('Действие выполняется')
    }

    if (action.isError) {
      console.log('Ошибка:', action.error?.message)
    }

    if (action.isAbort) {
      console.log('Действие отменено')
    }

    if (action.isLock) {
      console.log('Действие заблокировано')
    }
  }
}
```

### Множественные проверки

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Логика действия
  }

  checkMultipleStates() {
    const action = this.fetchUsers

    // Проверка нескольких состояний
    if (action.is('pending', 'error')) {
      console.log('Действие либо выполняется, либо в ошибке')
    }

    // Проверка активных состояний (не ready)
    if (action.is('pending', 'error', 'abort', 'lock')) {
      console.log('Действие не в состоянии ready')
    }
  }
}
```

## Использование в UI

### Базовые индикаторы

```vue
<template>
  <div>
    <!-- Индикатор загрузки -->
    <div v-if="userModel.fetchUsers.isPending" class="loading">
      <span>Загрузка пользователей...</span>
      <button @click="cancelFetch">Отменить</button>
    </div>

    <!-- Индикатор ошибки -->
    <div v-else-if="userModel.fetchUsers.isError" class="error">
      <span>Ошибка: {{ userModel.fetchUsers.error?.message }}</span>
      <button @click="retryFetch">Повторить</button>
    </div>

    <!-- Успешный результат -->
    <div v-else-if="userModel.fetchUsers.isReady" class="success">
      <ul>
        <li v-for="user in userModel.users" :key="user.id">
          {{ user.name }}
        </li>
      </ul>
    </div>

    <!-- Кнопка выполнения -->
    <button 
      @click="fetchUsers"
      :disabled="userModel.fetchUsers.isPending || userModel.fetchUsers.isLock"
    >
      Загрузить пользователей
    </button>
  </div>
</template>

<script setup lang="ts">
const fetchUsers = async () => {
  await userModel.fetchUsers.exec()
}

const retryFetch = async () => {
  userModel.fetchUsers.resetError()
  await userModel.fetchUsers.exec()
}

const cancelFetch = () => {
  userModel.fetchUsers.abort()
}
</script>
```

### Комплексные индикаторы

```vue
<template>
  <div class="user-management">
    <!-- Глобальный индикатор загрузки -->
    <div v-if="userModel.hasPendingActions" class="global-loading">
      Выполняются операции...
    </div>

    <!-- Индикатор ошибок -->
    <div v-if="userModel.hasActionWithError" class="global-error">
      Есть ошибки в операциях
    </div>

    <!-- Форма создания пользователя -->
    <form @submit.prevent="createUser" class="user-form">
      <input v-model="newUser.name" placeholder="Имя" required />
      <input v-model="newUser.email" type="email" placeholder="Email" required />
      
      <button 
        type="submit"
        :disabled="userModel.createUser.isPending || userModel.createUser.isLock"
      >
        <span v-if="userModel.createUser.isPending">Создание...</span>
        <span v-else>Создать пользователя</span>
      </button>
    </form>

    <!-- Список пользователей -->
    <div class="user-list">
      <div v-for="user in userModel.users" :key="user.id" class="user-item">
        <span>{{ user.name }}</span>
        <button 
          @click="deleteUser(user.id)"
          :disabled="userModel.deleteUser.isPending"
        >
          Удалить
        </button>
      </div>
    </div>
  </div>
</template>
```

## Управление состояниями

### Блокировка действий

```typescript
export class UserModel extends ProtoModel {
  @action async submitForm(formData: any): Promise<void> {
    // Логика отправки формы
  }

  async handleFormSubmit(formData: any) {
    // Блокируем действие для предотвращения повторной отправки
    if (this.submitForm.isLock) {
      console.log('Форма уже отправляется')
      return
    }

    await this.submitForm.lock()
    
    try {
      await this.submitForm.exec(formData)
      console.log('Форма отправлена успешно')
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
    } finally {
      this.submitForm.unlock()
    }
  }
}
```

### Сброс ошибок

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    // Логика загрузки
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

### Отмена операций

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(abortController = new AbortController()): Promise<void> {
    const response = await fetch('/api/users', {
      signal: abortController.signal
    })
    this.users = await response.json()
  }

  async fetchWithTimeout(timeoutMs: number) {
    const abortController = new AbortController()
    const timeoutId = setTimeout(() => {
      abortController.abort('Timeout')
    }, timeoutMs)

    try {
      await this.fetchUsers.exec(abortController)
    } catch (error) {
      if (this.fetchUsers.isAbort) {
        console.log('Запрос отменен по таймауту')
      }
    } finally {
      clearTimeout(timeoutId)
    }
  }
}
```

## Мониторинг состояний модели

### Глобальные состояния

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }
  @action async deleteUser(): Promise<void> { }

  // Проверка наличия выполняющихся действий
  get hasAnyPendingActions(): boolean {
    return this.hasPendingActions
  }

  // Проверка наличия ошибок
  get hasAnyErrors(): boolean {
    return this.hasActionWithError
  }

  // Подсчет выполняющихся действий
  get pendingActionsCount(): number {
    let count = 0
    if (this.fetchUsers.isPending) count++
    if (this.createUser.isPending) count++
    if (this.deleteUser.isPending) count++
    return count
  }

  // Получение всех действий с ошибками
  get actionsWithErrors(): string[] {
    const errors = []
    if (this.fetchUsers.isError) errors.push('fetchUsers')
    if (this.createUser.isError) errors.push('createUser')
    if (this.deleteUser.isError) errors.push('deleteUser')
    return errors
  }
}
```

### Реактивные вычисления

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }

  // Реактивное вычисление состояния загрузки
  get isLoading(): boolean {
    return this.fetchUsers.isPending || this.createUser.isPending
  }

  // Реактивное вычисление состояния ошибки
  get hasErrors(): boolean {
    return this.fetchUsers.isError || this.createUser.isError
  }

  // Реактивное вычисление сообщения об ошибке
  get errorMessage(): string | null {
    if (this.fetchUsers.isError) return this.fetchUsers.error?.message
    if (this.createUser.isError) return this.createUser.error?.message
    return null
  }
}
```

## Типизация состояний

### Интерфейсы состояний

```typescript
interface ActionState {
  isReady: boolean
  isPending: boolean
  isError: boolean
  isAbort: boolean
  isLock: boolean
  error?: Error
}

interface ModelStates {
  hasPendingActions: boolean
  hasActionWithError: boolean
  pendingActionsCount: number
}

export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }

  // Типизированная проверка состояния
  checkState(): ActionState {
    const action = this.fetchUsers
    return {
      isReady: action.isReady,
      isPending: action.isPending,
      isError: action.isError,
      isAbort: action.isAbort,
      isLock: action.isLock,
      error: action.error
    }
  }
}
```

## Лучшие практики

### 1. Проверка состояний перед выполнением

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }

  async safeFetch() {
    // Проверяем состояние перед выполнением
    if (this.fetchUsers.isPending) {
      console.log('Загрузка уже выполняется')
      return
    }

    if (this.fetchUsers.isLock) {
      console.log('Действие заблокировано')
      return
    }

    // Выполняем действие
    await this.fetchUsers.exec()
  }
}
```

### 2. Обработка ошибок с восстановлением

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }

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

### 3. Условное выполнение на основе состояний

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }

  async performOperation() {
    // Выполняем только если нет ошибок
    if (!this.hasActionWithError) {
      await this.fetchUsers.exec()
    } else {
      console.log('Есть ошибки, пропускаем операцию')
    }
  }

  async conditionalCreate() {
    // Создаем пользователя только если загрузка завершена
    if (this.fetchUsers.isReady) {
      await this.createUser.exec()
    } else {
      console.log('Дождитесь завершения загрузки')
    }
  }
}
```

### 4. Автоматическое управление состояниями

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }

  async autoFetch() {
    // Автоматически сбрасываем ошибки
    if (this.fetchUsers.isError) {
      this.fetchUsers.resetError()
    }

    // Автоматически разблокируем если заблокировано
    if (this.fetchUsers.isLock) {
      this.fetchUsers.unlock()
    }

    // Выполняем действие
    await this.fetchUsers.exec()
  }
}
```

## Следующие шаги

Теперь, когда вы изучили состояния, вы можете:

1. [Изучить декораторы](/guides/decorators/)
2. [Познакомиться с обработкой ошибок](/guides/error-handling/)
3. [Изучить отмену операций](/guides/abort/)
4. [Посмотреть примеры](/examples/) 