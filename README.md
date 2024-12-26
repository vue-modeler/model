# State manager for Vue

## Overview

This library is a state manager for Vue based on OOP principles.

Each state is a class with methods and reactive properties.
Method for update state called action. In class definition it looks like async method with decorator `@action` which returns Promise<void>.

