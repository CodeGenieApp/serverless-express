'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/router'
import {
  Button,
  Form,
  Modal,
  Input,
} from 'antd'
import { useCreateTodoListMutation, useUpdateTodoListMutation } from './todoListHooks'

const DEFAULT_VALUES = {
}

interface TodoListUpsertModalParams {
  isOpen: boolean
  todoList?: any
  setIsOpen: any
}

export default function TodoListUpsertModal({
  isOpen,
  todoList,
  setIsOpen,
}: TodoListUpsertModalParams) {
  const todoListMutation = todoList ? useUpdateTodoListMutation() : useCreateTodoListMutation()

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title='Todo list'
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button
          key='cancel'
          disabled={todoListMutation.isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>,
        <Button
          type='primary'
          form='todoList'
          key='submit'
          htmlType='submit'
          loading={todoListMutation.isLoading}
        >
          {todoList ? 'Update Todo list' : 'Create Todo list'}
        </Button>,
      ]}
    >
      <TodoListUpsertForm
        todoList={todoList}
        onEdit={() => setIsOpen(false)}
        todoListMutation={todoListMutation}
      />
    </Modal>
  )
}

function TodoListUpsertForm({
  todoList,
  onEdit,
  todoListMutation,
  shouldNavigateToDetailsPageOnCreate = true,
}) {
  const router = useRouter()
  const [todoListForm] = Form.useForm()

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    todoListForm.resetFields()
  }, [todoList])

  async function submitForm() {
    const formValues = await todoListForm.validateFields()
    let { listId } = todoList || {}

    const response = todoList ? await todoListMutation.mutateAsync({
      listId,
      data: formValues,
    }) : await todoListMutation.mutateAsync({
      data: {
        ...formValues,
      },
    })

    if (response) {
      if (!todoList && shouldNavigateToDetailsPageOnCreate) {
        listId = response.data.data.listId
        router.push(`/todo-lists/${listId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues = todoList ? {
    ...todoList,
  } : DEFAULT_VALUES

  return (
    <Form
      name='todoList'
      preserve={false}
      initialValues={initialValues}
      form={todoListForm}
      onFinish={submitForm}
      layout='vertical'
      disabled={todoListMutation.isLoading}
    >
      <Form.Item
        label='Name'
        name='name'
        rules={[
          {
            required: true,
            message: 'Please enter name.',
          },
        ]}
      >
        <Input />
      </Form.Item>
    </Form>
  )
}
