# vue-modeler/model

[![npm version](https://img.shields.io/npm/v/@vue-modeler/model.svg)](https://www.npmjs.com/package/@vue-modeler/model) [![codecov](https://codecov.io/gh/vue-modeler/model/branch/main/graph/badge.svg?token=BFQI22MBZ1)](https://codecov.io/gh/vue-modeler/model) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=vue-modeler_model&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=vue-modeler_model)

## What is @vue-modeler/model

A state management library based on models for [Vue.js](https://vuejs.org/). The extremely simple API serves single purpose — creating models. It preserves types, supports OOP, DRY, and SOLID principles.

---

### Key Features

- **No global state store**. No store means no problems. State is encapsulated within the model and is reactive. Outside the model, it's only accessible for reading and observation.
- **Extremely simple API**: A model prototype is a standard class, actions are defined as standard methods with decorators. Create a model by calling a factory method — nothing more needed. Reactive properties and behavior are defined using the standard Vue API.
- **Supports shared models**. Models can be shared across components. You can manage model instances using dependency injection or your own container pattern.
- **Follows DRY principle**. Actions have their own state. There's no need to write additional code to track action states. Focus instead on designing architecture and business logic.
- **Embraces OOP**. Model prototypes are classes, supporting inheritance, encapsulation, polymorphism, and destructors.
- **Complies with SOLID principles**. Encourages clean coding practices like composition of models, dependency injection via constructors, separation of interfaces, single responsibility, etc.
- **Maintains type safety**. All code completion hints will work both inside and outside the context of the class.

---

### Goals of Creation

#### **Eliminate boilerplate code in actions and reduce the codebase.**
##### Problems:
- Actions often come with repetitive code for tracking execution through extra variables such as `isLoading`, `isPending`. This code adds little value to business logic but inflates the codebase.
- Cancelling or blocking an action can be challenging. Developers tend to reinvent the wheel, even though these operations are common patterns.
- Exception handling introduces further complications—developers either forget about it or handle it inconsistently without clear guidelines.

##### Solutions:
- An action is represented as an object with reactive properties reflecting its execution status: `ready`, `pending`, `lock`, `abort`, `error`.
- Block or cancel an action easily using the `lock` and `abort` methods.
- Actions catch exceptions, create errors, save them as part of the state, and provide a unified interface for handling.

Less code, fewer issues.

#### **Use Classes and Interfaces**
Both Vuex and Pinia employ custom approaches for managing stores and reusing common code. I wanted to use standard classes, interfaces, getters, and protected properties. That's why my models are built upon classes and support OOP patterns.

#### **Reuse Business Logic Across Projects**
Models are classes where dependencies are injected via constructors, so model files don't contain direct imports of external dependencies. Models can easily be extracted into separate modules and reused in other projects or with different UI libraries.

---

### Additional Benefits
- **Layered project structure**:
   - Application layer contains model definitions.
   - Infrastructure layer includes request/response factories and API calls.
   - UI layer handles templates, filters, and display logic.
   - Configuration layer is the dependency container where developers establish relationships between models and other layers.
- **Clear folder structure**. Each layer has its dedicated directory. Inside the application and infrastructure directories, subfolders are organized by domain areas.

---

This library promises to simplify state management in [Vue.js](https://vuejs.org/) applications while promoting clean, scalable, and maintainable code.

## Installation

Install @vue-modeler/model:

```bash
npm add @vue-modeler/model
```

It is recommended to use it together with the dependency container [@vue-modeler/dc](https://github.com/vue-modeler/dc). For installation instructions and provider setup, see the [@vue-modeler/dc documentation](https://github.com/vue-modeler/dc?tab=readme-ov-file#installation).

## Usage Examples

### 1. Define Proto model

```typescript
import { ProtoModel, action } from '@vue-modeler/model'

export interface Api {
   fetchUser: () => Promise<UserDto>
   patch: (dto: PatchDto) => Promise<void> 
}

export interface UserDto {
   name: string
   email: string
}

export interface PatchDto {
   name?: string
   email?: string
}

// Define your model class extending ProtoModel
class User extends ProtoModel {
  
  // Regular properties. It will be reactive after creation model 
  protected _name = ''
  protected _email = ''
  
  get name(): string {
   return this._name
  }

  get email(): string {
   return this._email
  }

  constructor(
     private api: Api
  ) {
     super()

     this.init()
  }   
  
  // Actions (async methods with @action decorator)
  @action async init() {
    if (this.action(this.patch).isPending) {
      throw new Error('action execution conflict')
    } 

    const userDto = await this.api.fetchUser()
    this._name = userDto.name
    this._email = userDto.email
  }
   
  @action async patch(dto: PatchDto): Promise<void> {
     if (this.action(this.init).isPending) {
       throw new Error('action execution conflict')
     }

     await this.api.patch(dto)
     if (dto.name) this._name = dto.name
     if (dto.email) this._email = dto.email
  }
}
```

### 2. Create API

```typescript
export const fetchUser = async (): Promise<UserDto> => {
  const response = await fetch('/api/users/me')
  return response.json()
}

export const patchUser = async (dto: PatchDto): Promise<void> => {
  await fetch('/api/users/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(dto)
  })
}
```

### 3. Create model provider

Using `@vue-modeler/dc` (recommended):

```typescript
import { provider } from '@vue-modeler/dc'
import { User } from './user-model'
import { fetchUser, patchUser } from './api'

export const useUser = provider(() => User.model({
  fetchUser,
  patch: patchUser
}))
```

Or without dependency container:

```typescript
export const useUser = () => User.model({
  fetchUser,
  patch: patchUser
})
```

### 4. Using Models in Vue Components

```html
<template>
  <div>
    <div v-if="user.init.isPending">Loading...</div>
    <div v-else-if="user.init.error">Error: {{ user.init.error.message }}</div>
    <div v-else>
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      
      <form @submit.prevent="saveUser" class="user-form">
        <div class="form-group">
          <label for="name">Name:</label>
          <input 
            id="name"
            v-model="formData.name" 
            type="text" 
            :disabled="user.init.isPending || user.patch.isPending"
            required
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email:</label>
          <input 
            id="email"
            v-model="formData.email" 
            type="email" 
            :disabled="user.init.isPending || user.patch.isPending"
            required
          />
        </div>
        
        <div class="form-actions">
          <button type="button" 
            :disabled="user.init.isPending || user.patch.isPending"
            @click="user.init.exec()"
          >
            Reload User
          </button>
          
          <button type="submit" :disabled="user.init.isPending || user.patch.isPending">
            {{ user.patch.isPending ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useUser } from './user-model'

const user = useUser()

// Form data for editing
const formData = ref({
  name: user.name,
  email: user.email
})

// Update form data when user data changes
watch(() => user.name, (newName) => {
  formData.value.name = newName
})

watch(() => user.email, (newEmail) => {
  formData.value.email = newEmail
})

const saveUser = () => {
  user.patch.exec({
    name: formData.value.name,
    email: formData.value.email
  })
}
</script>
```

