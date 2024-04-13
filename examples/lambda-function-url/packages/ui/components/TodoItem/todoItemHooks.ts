'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListTodoItemsParams {
  listId: string
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listTodoItems: ({ listId, lastEvaluatedKey, filter }: ListTodoItemsParams) => axios.get(`/todo-lists/${listId}/todo-items`, {
    params: {
      lastEvaluatedKey,
      filter,
    },
  }),
  getTodoItem: ({ listId, itemId }) => axios.get(`/todo-lists/${listId}/todo-items/${itemId}`),
  createTodoItem: ({ listId, data }) => axios.post(`/todo-lists/${listId}/todo-items`, { todoItem: data }),
  updateTodoItem: ({ listId, itemId, data }) => axios.put(`/todo-lists/${listId}/todo-items/${itemId}`, { todoItem: data }),
  deleteTodoItem: ({ listId, itemId }) => axios.delete(`/todo-lists/${listId}/todo-items/${itemId}`),
}

interface UseListTodoItemsQueryParams {
  page?: number
  lastEvaluatedKey?: string
  listId: string
}

interface ListTodoItemsApiResponse {
  data: TodoItemData[]
  lastEvaluatedKey: string
}

export interface TodoItemData {
  [k: string]: any
}

export function useListTodoItemsQuery({ page, lastEvaluatedKey, listId }: UseListTodoItemsQueryParams) {
  const listTodoItemsQuery = useQuery<ListTodoItemsApiResponse>(['todoItems', listId, page], async () => {
    const apiResponse = await api.listTodoItems({ lastEvaluatedKey, listId })
    return apiResponse.data
  }, {
    keepPreviousData: true,
  })

  return listTodoItemsQuery
}

interface UseSearchTodoItemsQueryParams {
  listId: string
  title?: string
  lastEvaluatedKey?: string
}

export function useSearchTodoItemsQuery({ listId, title, lastEvaluatedKey }: UseSearchTodoItemsQueryParams) {
  const searchTodoItemsQuery = useQuery(['searchTodoItems', listId, title, lastEvaluatedKey], async () => {
    const filter = title ? {
      filters: [{
        property: 'title',
        value: title,
      }],
    } : undefined
    const apiResponse = await api.listTodoItems({ listId, lastEvaluatedKey, filter })
    return apiResponse.data
  },
  {
    keepPreviousData: true,
    staleTime: 30000, // 30s
  })

  return searchTodoItemsQuery
}

export function useGetTodoItemQuery({ listId, itemId }) {
  const getTodoItemQuery = useQuery(['todoItems', listId, itemId], async () => {
    const apiResponse = await api.getTodoItem({ listId, itemId })
    return apiResponse.data
  }, {
    enabled: Boolean(listId && itemId),
  })

  return getTodoItemQuery
}

export function useCreateTodoItemMutation() {
  const queryClient = useQueryClient()
  const createTodoItemMutation = useMutation<any, any, any>(async ({ listId, data }) => {
    try {
      const response = await api.createTodoItem({ listId, data })

      await queryClient.invalidateQueries(['todoItems', listId])
      return response
    } catch (error: any) {
      notification.error({
        message: 'Create failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return createTodoItemMutation
}

export function useUpdateTodoItemMutation() {
  const queryClient = useQueryClient()
  const updateTodoItemMutation = useMutation<any, any, any>(async ({ listId, itemId, data }) => {
    try {
      const response = await api.updateTodoItem({ listId, itemId, data })

      await Promise.all([
        queryClient.invalidateQueries(['todoItems', listId]),
        queryClient.invalidateQueries(['todoItems', listId, itemId]),
      ])

      return response
    } catch (error: any) {
      notification.error({
        message: 'Update failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return updateTodoItemMutation
}

export function useDeleteTodoItemMutation() {
  const queryClient = useQueryClient()
  const deleteTodoItemMutation = useMutation<any, any, any>(async ({ listId, itemId }) => {
    try {
      const response = await api.deleteTodoItem({ listId, itemId })

      await Promise.all([
        queryClient.invalidateQueries(['todoItems', listId]),
        queryClient.invalidateQueries(['todoItems', listId, itemId]),
      ])

      return response
    } catch (error: any) {
      notification.error({
        message: 'Delete failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return deleteTodoItemMutation
}
