---
title: Блокировка действий
description: Подробное руководство по блокировке действий в Vue Modeler
---

# Блокировка действий

Блокировка действий в Vue Modeler позволяет предотвратить повторное выполнение действий и управлять их доступностью.

## Основы блокировки

### Блокировка действия

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async lockAction() {
    // Блокируем действие
    await this.fetchUsers.lock()
    console.log('Действие заблокировано')
  }
}
```

### Разблокировка действия

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async unlockAction() {
    // Разблокируем действие
    this.fetchUsers.unlock()
    console.log('Действие разблокировано')
  }
}
```

### Проверка состояния блокировки

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  checkLockState() {
    if (this.fetchUsers.isLock) {
      console.log('Действие заблокировано')
    } else {
      console.log('Действие доступно')
    }
  }
}
```

## Предотвращение повторных вызовов

### Блокировка формы

```typescript
export class UserModel extends ProtoModel {
  @action async submitForm(formData: any): Promise<void> {
    // Блокируем действие для предотвращения повторной отправки
    if (this.submitForm.isLock) {
      console.log('Форма уже отправляется')
      return
    }

    await this.submitForm.lock()
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Ошибка отправки формы')
      }
      
      console.log('Форма отправлена успешно')
    } catch (error) {
      console.error('Ошибка отправки формы:', error)
      throw error
    } finally {
      // Разблокируем действие
      this.submitForm.unlock()
    }
  }
}
```

### Блокировка с таймаутом

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async lockWithTimeout(timeoutMs: number) {
    await this.fetchUsers.lock()
    
    // Автоматически разблокируем через указанное время
    setTimeout(() => {
      this.fetchUsers.unlock()
      console.log('Действие автоматически разблокировано')
    }, timeoutMs)
  }
}
```

## Использование в UI

### Блокировка кнопок

```vue
<template>
  <div>
    <form @submit.prevent="submitForm">
      <input v-model="formData.name" placeholder="Имя" required />
      <input v-model="formData.email" type="email" placeholder="Email" required />
      
      <button 
        type="submit"
        :disabled="userModel.submitForm.isLock || userModel.submitForm.isPending"
      >
        <span v-if="userModel.submitForm.isPending">Отправка...</span>
        <span v-else-if="userModel.submitForm.isLock">Заблокировано</span>
        <span v-else>Отправить</span>
      </button>
    </form>

    <div v-if="userModel.submitForm.isLock" class="lock-notice">
      Форма заблокирована для предотвращения повторной отправки
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const formData = ref({
  name: '',
  email: ''
})

const submitForm = async () => {
  await userModel.submitForm.exec(formData.value)
}
</script>

<style scoped>
.lock-notice {
  padding: 10px;
  background: #fff3cd;
  border-radius: 4px;
  color: #856404;
  margin-top: 10px;
}
</style>
```

### Блокировка с индикатором

```vue
<template>
  <div>
    <div class="action-controls">
      <button 
        @click="lockAction"
        :disabled="userModel.fetchUsers.isLock"
      >
        Заблокировать
      </button>
      
      <button 
        @click="unlockAction"
        :disabled="!userModel.fetchUsers.isLock"
      >
        Разблокировать
      </button>
      
      <button 
        @click="fetchUsers"
        :disabled="userModel.fetchUsers.isLock || userModel.fetchUsers.isPending"
      >
        Загрузить
      </button>
    </div>

    <div class="status-indicator">
      <div v-if="userModel.fetchUsers.isLock" class="locked">
        🔒 Действие заблокировано
      </div>
      <div v-else-if="userModel.fetchUsers.isPending" class="pending">
        ⏳ Действие выполняется
      </div>
      <div v-else class="ready">
        ✅ Действие готово
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const lockAction = async () => {
  await userModel.fetchUsers.lock()
}

const unlockAction = () => {
  userModel.fetchUsers.unlock()
}

const fetchUsers = async () => {
  await userModel.fetchUsers.exec()
}
</script>

<style scoped>
.action-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.status-indicator {
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
}

.locked {
  background: #f8d7da;
  color: #721c24;
}

.pending {
  background: #d1ecf1;
  color: #0c5460;
}

.ready {
  background: #d4edda;
  color: #155724;
}
</style>
```

## Блокировка с условиями

### Условная блокировка

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

  async conditionalLock() {
    // Блокируем создание пользователя, если загрузка не завершена
    if (!this.fetchUsers.isReady) {
      await this.createUser.lock()
      console.log('Создание пользователя заблокировано до завершения загрузки')
    }
  }

  async unlockAfterFetch() {
    // Разблокируем создание пользователя после загрузки
    if (this.fetchUsers.isReady && this.createUser.isLock) {
      this.createUser.unlock()
      console.log('Создание пользователя разблокировано')
    }
  }
}
```

### Блокировка на основе состояния

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  @action async deleteUser(userId: number): Promise<void> {
    await fetch(`/api/users/${userId}`, { method: 'DELETE' })
    this.users = this.users.filter(user => user.id !== userId)
  }

  async smartLock() {
    // Блокируем удаление, если есть выполняющиеся операции
    if (this.fetchUsers.isPending) {
      await this.deleteUser.lock()
      console.log('Удаление заблокировано - идет загрузка')
    }

    // Блокируем загрузку, если есть операции удаления
    if (this.deleteUser.isPending) {
      await this.fetchUsers.lock()
      console.log('Загрузка заблокирована - идет удаление')
    }
  }
}
```

## Блокировка с восстановлением

### Автоматическое восстановление

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async lockWithRecovery() {
    // Блокируем действие
    await this.fetchUsers.lock()
    
    try {
      // Выполняем операцию, которая может завершиться ошибкой
      await this.performRiskyOperation()
    } catch (error) {
      console.error('Операция завершилась ошибкой:', error)
      // Разблокируем действие при ошибке
      this.fetchUsers.unlock()
    }
  }

  private async performRiskyOperation(): Promise<void> {
    // Рискованная операция
    throw new Error('Something went wrong')
  }
}
```

### Блокировка с таймаутом восстановления

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> {
    const response = await fetch('/api/users')
    this.users = await response.json()
  }

  async lockWithTimeoutRecovery(timeoutMs: number) {
    await this.fetchUsers.lock()
    
    const timeoutId = setTimeout(() => {
      if (this.fetchUsers.isLock) {
        this.fetchUsers.unlock()
        console.log('Действие автоматически разблокировано по таймауту')
      }
    }, timeoutMs)

    try {
      await this.performOperation()
    } finally {
      clearTimeout(timeoutId)
      // Разблокируем действие в любом случае
      if (this.fetchUsers.isLock) {
        this.fetchUsers.unlock()
      }
    }
  }

  private async performOperation(): Promise<void> {
    // Длительная операция
    await new Promise(resolve => setTimeout(resolve, 2000))
  }
}
```

## Глобальная блокировка

### Блокировка всех действий

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }
  @action async deleteUser(): Promise<void> { }

  async lockAllActions() {
    await this.fetchUsers.lock()
    await this.createUser.lock()
    await this.deleteUser.lock()
    console.log('Все действия заблокированы')
  }

  unlockAllActions() {
    this.fetchUsers.unlock()
    this.createUser.unlock()
    this.deleteUser.unlock()
    console.log('Все действия разблокированы')
  }

  get hasAnyLockedActions(): boolean {
    return this.fetchUsers.isLock || 
           this.createUser.isLock || 
           this.deleteUser.isLock
  }
}
```

### Блокировка с приоритетами

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }
  @action async deleteUser(): Promise<void> { }

  async lockByPriority(priority: 'high' | 'medium' | 'low') {
    switch (priority) {
      case 'high':
        // Блокируем все действия
        await this.lockAllActions()
        break
      case 'medium':
        // Блокируем только создание и удаление
        await this.createUser.lock()
        await this.deleteUser.lock()
        break
      case 'low':
        // Блокируем только удаление
        await this.deleteUser.lock()
        break
    }
  }
}
```

## Лучшие практики

### 1. Всегда разблокируйте действия

```typescript
export class UserModel extends ProtoModel {
  @action async submitForm(formData: any): Promise<void> {
    await this.submitForm.lock()
    
    try {
      const response = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (!response.ok) {
        throw new Error('Ошибка отправки')
      }
    } finally {
      // ✅ Хорошо - всегда разблокируем
      this.submitForm.unlock()
    }
  }
}
```

### 2. Проверяйте состояние перед блокировкой

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }

  async safeLock() {
    // ✅ Хорошо - проверяем состояние
    if (this.fetchUsers.isLock) {
      console.log('Действие уже заблокировано')
      return
    }

    await this.fetchUsers.lock()
  }
}
```

### 3. Используйте блокировку для предотвращения конфликтов

```typescript
export class UserModel extends ProtoModel {
  @action async fetchUsers(): Promise<void> { }
  @action async createUser(): Promise<void> { }

  async preventConflicts() {
    // Блокируем создание пользователя во время загрузки
    if (this.fetchUsers.isPending) {
      await this.createUser.lock()
      console.log('Создание заблокировано - идет загрузка')
    }
  }
}
```

### 4. Информативные сообщения о блокировке

```typescript
export class UserModel extends ProtoModel {
  @action async submitForm(formData: any): Promise<void> {
    if (this.submitForm.isLock) {
      throw new Error('Форма уже отправляется, дождитесь завершения')
    }

    await this.submitForm.lock()
    
    try {
      // Логика отправки
    } finally {
      this.submitForm.unlock()
    }
  }
}
```

## Следующие шаги

Теперь, когда вы изучили блокировку действий, вы можете:

1. [Изучить жизненный цикл](/guides/lifecycle/)
2. [Познакомиться с отменой операций](/guides/abort/)
3. [Изучить обработку ошибок](/guides/error-handling/)
4. [Посмотреть примеры](/examples/) 