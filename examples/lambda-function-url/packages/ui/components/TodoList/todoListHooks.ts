'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notification } from 'antd'
import axios from 'axios'
import type { Filter } from '@/common/filter'

interface ListTodoListsParams {
  lastEvaluatedKey?: string
  filter?: Filter
}

const api = {
  listTodoLists: ({ lastEvaluatedKey, filter }: ListTodoListsParams = {}) => axios.get('/todo-lists', {
    params: {
      lastEvaluatedKey,
      filter,
    },
  }),
  getTodoList: ({ listId }) => axios.get(`/todo-lists/${listId}`),
  createTodoList: ({ data }) => axios.post('/todo-lists', { todoList: data }),
  updateTodoList: ({ listId, data }) => axios.put(`/todo-lists/${listId}`, { todoList: data }),
  deleteTodoList: ({ listId }) => axios.delete(`/todo-lists/${listId}`),
}

interface UseListTodoListsQueryParams {
  page?: number
  lastEvaluatedKey?: string
}

interface ListTodoListsApiResponse {
  data: TodoListData[]
  lastEvaluatedKey: string
}

export interface TodoListData {
  [k: string]: any
}

export function useListTodoListsQuery({ page, lastEvaluatedKey }: UseListTodoListsQueryParams) {
  const listTodoListsQuery = useQuery<ListTodoListsApiResponse>(['todoLists', page], async () => {
    const apiResponse = await api.listTodoLists({ lastEvaluatedKey })
    return apiResponse.data
  }, {
    keepPreviousData: true,
  })

  return listTodoListsQuery
}

interface UseSearchTodoListsQueryParams {
  name?: string
  lastEvaluatedKey?: string
}

export function useSearchTodoListsQuery({ name, lastEvaluatedKey }: UseSearchTodoListsQueryParams) {
  const searchTodoListsQuery = useQuery(['searchTodoLists', name, lastEvaluatedKey], async () => {
    const filter = name ? {
      filters: [{
        property: 'name',
        value: name,
      }],
    } : undefined
    const apiResponse = await api.listTodoLists({ lastEvaluatedKey, filter })
    return apiResponse.data
  },
  {
    keepPreviousData: true,
    staleTime: 30000, // 30s
  })

  return searchTodoListsQuery
}

export function useGetTodoListQuery({ listId }) {
  const getTodoListQuery = useQuery(['todoLists', listId], async () => {
    const apiResponse = await api.getTodoList({ listId })
    return apiResponse.data
  }, {
    enabled: Boolean(listId),
  })

  return getTodoListQuery
}

export function useCreateTodoListMutation() {
  const queryClient = useQueryClient()
  const createTodoListMutation = useMutation<any, any, any>(async ({ data }) => {
    try {
      const response = await api.createTodoList({ data })

      await queryClient.invalidateQueries(['todoLists'])
      return response
    } catch (error: any) {
      notification.error({
        message: 'Create failed',
        description: error?.response?.data?.message || error?.message || 'Unknown error',
        placement: 'topRight',
      })
    }
  })

  return createTodoListMutation
}

export function useUpdateTodoListMutation() {
  const queryClient = useQueryClient()
  const updateTodoListMutation = useMutation<any, any, any>(async ({ listId, data }) => {
    try {
      const response = await api.updateTodoList({ listId, data })

      await Promise.all([
        queryClient.invalidateQueries(['todoLists']),
        queryClient.invalidateQueries(['todoLists', listId]),
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

  return updateTodoListMutation
}

export function useDeleteTodoListMutation() {
  const queryClient = useQueryClient()
  const deleteTodoListMutation = useMutation<any, any, any>(async ({ listId }) => {
    try {
      const response = await api.deleteTodoList({ listId })

      await Promise.all([
        queryClient.invalidateQueries(['todoLists']),
        queryClient.invalidateQueries(['todoLists', listId]),
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

  return deleteTodoListMutation
}
