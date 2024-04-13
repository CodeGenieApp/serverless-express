'use client'

import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { UploadOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Modal,
  DatePicker,
  Input,
  Switch,
  Upload,
} from 'antd'
import { useCreateTodoItemMutation, useUpdateTodoItemMutation } from './todoItemHooks'
import { beforeUpload, customRequest, handleUploadChange } from '@/ui/lib/upload'

const DEFAULT_VALUES = {
}

interface TodoItemUpsertModalParams {
  isOpen: boolean
  todoItem?: any
  listId: any
  setIsOpen: any
}

export default function TodoItemUpsertModal({
  isOpen,
  todoItem,
  listId,
  setIsOpen,
}: TodoItemUpsertModalParams) {
  const todoItemMutation = todoItem ? useUpdateTodoItemMutation() : useCreateTodoItemMutation()

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title='Todo item'
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button
          key='cancel'
          disabled={todoItemMutation.isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>,
        <Button
          type='primary'
          form='todoItem'
          key='submit'
          htmlType='submit'
          loading={todoItemMutation.isLoading}
        >
          {todoItem ? 'Update Todo item' : 'Create Todo item'}
        </Button>,
      ]}
    >
      <TodoItemUpsertForm
        todoItem={todoItem}
        listId={listId}
        onEdit={() => setIsOpen(false)}
        todoItemMutation={todoItemMutation}
      />
    </Modal>
  )
}

function TodoItemUpsertForm({
  todoItem,
  listId,
  onEdit,
  todoItemMutation,
}) {
  const router = useRouter()
  const [todoItemForm] = Form.useForm()
  const [logoBase64Encoded, setLogoBase64Encoded] = useState<string>()

  const uploadButton = (
    <div>
      <UploadOutlined style={{fontSize: 24}} />
    </div>
  )

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    todoItemForm.resetFields()

    if (todoItem) {
      setLogoBase64Encoded(todoItem.image)
    }
  }, [todoItem])

  async function submitForm() {
    const formValues = await todoItemForm.validateFields()
    formValues.image = logoBase64Encoded
    const { itemId } = todoItem || {}

    const response = todoItem ? await todoItemMutation.mutateAsync({
      listId,
      itemId,
      data: formValues,
    }) : await todoItemMutation.mutateAsync({
      listId,
      data: {
        ...formValues,
        listId,
      },
    })

    if (response) {
      onEdit()
    }
  }

  const initialValues = todoItem ? {
    ...todoItem,
    dueDate: todoItem.dueDate ? dayjs(new Date(todoItem.dueDate)) : undefined,
    image: todoItem.image ? {
      uid: '1',
      status: 'done',
      url: todoItem.image,
    } : undefined,
  } : DEFAULT_VALUES

  return (
    <Form
      name='todoItem'
      preserve={false}
      initialValues={initialValues}
      form={todoItemForm}
      onFinish={submitForm}
      layout='vertical'
      disabled={todoItemMutation.isLoading}
    >
      <Form.Item
        label='Title'
        name='title'
        rules={[
          {
            required: true,
            message: 'Please enter title.',
          },
        ]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        label='Description'
        name='description'
      >
        <Input.TextArea showCount autoSize={{ minRows: 2 }} maxLength={100} />
      </Form.Item>
      <Form.Item
        label='Completed'
        name='completed'
        valuePropName='checked'
      >
        <Switch />
      </Form.Item>
      <Form.Item
        label='Due date'
        name='dueDate'
      >
        <DatePicker />
      </Form.Item>
      <Form.Item
        label='Image'
        name='image'
        valuePropName='filesList'
      >
        <Upload
          name='image'
          listType='picture-circle'
          accept='.png, .jpg'
          showUploadList={{showPreviewIcon: false}}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          onChange={(info) => handleUploadChange({ info, setLogoBase64Encoded })}
          defaultFileList={initialValues?.image ? [initialValues.image] : undefined}
        >
          {!logoBase64Encoded && uploadButton}
        </Upload>
      </Form.Item>
    </Form>
  )
}
