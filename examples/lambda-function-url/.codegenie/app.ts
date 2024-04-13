import type { AppDefinition } from '@codegenie/cli/dist/input/types'

const codeGenieAppDefinition: AppDefinition = {
  name: 'Todo',
  description: 'Todo App',
  region: 'us-west-2',
  theme: {
    primaryColor: '#579ddd'
  },
  permissionModel: 'Global',
  defaultAuthRouteEntity: 'TodoList',
  entities: {
    TodoList: {
      properties: {
        listId: {
          type: 'string',
          isIdProperty: true
        },
        name: {
          type: 'string',
          isNameProperty: true,
          isRequired: true
        }
      }
    },
    TodoItem: {
      parentEntity: 'TodoList',
      properties: {
        itemId: {
          type: 'string',
          isIdProperty: true
        },
        listId: {
          type: 'string',
          relatedEntity: 'TodoList'
        },
        title: {
          type: 'string',
          isNameProperty: true,
          isRequired: true
        },
        description: {
          type: 'string',
          format: 'multiline',
          minLength: 10,
          maxLength: 100
        },
        completed: {
          type: 'boolean'
        },
        dueDate: {
          type: 'date'
        },
        image: {
          type: 'image',
          isImageProperty: true
        }
      },
      ui: {
        remainOnCurrentPageOnCreate: true,
        generateDetailsPage: false
      }
    }
  }
}

export default codeGenieAppDefinition
