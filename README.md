# Introduction

## What is @vue-modeler/model

A state management library based on models for [VUE.js.](VUE.js.) The extremely simple API serves one purpose — creating models. It preserves types, supports OOP, DRY, and SOLID principles.

Try it out! Level up your development process.

---

### Key Features
- **No global state store**. No store means no problems. State is encapsulated within the model and is reactive. Outside the model, it's only accessible for reading and observation.
- **Extremely simple API**: A model prototype is a standard class, actions are defined as standard methods with decorators. Create a model by calling a factory method—nothing more needed. Reactive properties and behavior are defined using the standard Vue API.
- **Supports shared models**. A built-in model container ensures that a model remains in memory while being used. Unused models are automatically removed from the container.
- **Follows DRY principle**. Actions have their own state. There's no need to write additional code to track action states. Focus instead on designing architecture and business logic.
- **Embraces OOP**. Model prototypes are classes, supporting inheritance, encapsulation, polymorphism, and destructors.
- **Complies with SOLID principles**. Encourages clean coding practices like composition of models, dependency injection via constructors, separation of interfaces, single responsibility, etc.
- **Maintains type safety**. All code completion hints will work both inside and outside the context of the class.

---

### Simple Example
%%Check how it's done here: [https://pinia.vuejs.org/introduction.html#Basic-example%%](https://pinia.vuejs.org/introduction.html#Basic-example%%)

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
Both VUEX and Pinia employ custom approaches for managing stores and reusing common code. I wanted to use standard classes, interfaces, getters, and protected properties. That's why my models are built upon classes and support OOP patterns.

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

This library promises to simplify state management in [Vue.js](Vue.js) applications while promoting clean, scalable, and maintainable code.