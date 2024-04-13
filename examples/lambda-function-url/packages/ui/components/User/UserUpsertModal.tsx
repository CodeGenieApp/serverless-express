'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { UploadOutlined } from '@ant-design/icons'
import {
  Button,
  Form,
  Modal,
  Input,
  Upload,
} from 'antd'
import { useCreateUserMutation, useUpdateUserMutation } from './userHooks'
import { beforeUpload, customRequest, handleUploadChange } from '@/ui/lib/upload'

const DEFAULT_VALUES = {
}

interface UserUpsertModalParams {
  isOpen: boolean
  user?: any
  setIsOpen: any
}

export default function UserUpsertModal({
  isOpen,
  user,
  setIsOpen,
}: UserUpsertModalParams) {
  const userMutation = user ? useUpdateUserMutation() : useCreateUserMutation()

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title='User'
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button
          key='cancel'
          disabled={userMutation.isLoading}
          onClick={onCancel}
        >
          Cancel
        </Button>,
        <Button
          type='primary'
          form='user'
          key='submit'
          htmlType='submit'
          loading={userMutation.isLoading}
        >
          {user ? 'Update User' : 'Create User'}
        </Button>,
      ]}
    >
      <UserUpsertForm
        user={user}
        onEdit={() => setIsOpen(false)}
        userMutation={userMutation}
      />
    </Modal>
  )
}

function UserUpsertForm({
  user,
  onEdit,
  userMutation,
  shouldNavigateToDetailsPageOnCreate = true,
}) {
  const router = useRouter()
  const [userForm] = Form.useForm()
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
    userForm.resetFields()

    if (user) {
      setLogoBase64Encoded(user.profilePicture)
    }
  }, [user])

  async function submitForm() {
    const formValues = await userForm.validateFields()
    formValues.profilePicture = logoBase64Encoded
    let { userId } = user || {}

    const response = user ? await userMutation.mutateAsync({
      userId,
      data: formValues,
    }) : await userMutation.mutateAsync({
      data: {
        ...formValues,
      },
    })

    if (response) {
      if (!user && shouldNavigateToDetailsPageOnCreate) {
        userId = response.data.data.userId
        router.push(`/users/${userId}`)
      } else {
        onEdit()
      }
    }
  }

  const initialValues = user ? {
    ...user,
    profilePicture: user.profilePicture ? {
      uid: '1',
      status: 'done',
      url: user.profilePicture,
    } : undefined,
  } : DEFAULT_VALUES

  return (
    <Form
      name='user'
      preserve={false}
      initialValues={initialValues}
      form={userForm}
      onFinish={submitForm}
      layout='vertical'
      disabled={userMutation.isLoading}
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
      <Form.Item
        label='Email'
        name='email'
        rules={[
          {
            required: true,
            message: 'Please enter email.',
          },
        ]}
      >
        <Input type='email' />
      </Form.Item>
      <Form.Item
        label='Profile picture'
        name='profilePicture'
        valuePropName='filesList'
      >
        <Upload
          name='profilePicture'
          listType='picture-circle'
          accept='.png, .jpg'
          showUploadList={{showPreviewIcon: false}}
          customRequest={customRequest}
          beforeUpload={beforeUpload}
          onChange={(info) => handleUploadChange({ info, setLogoBase64Encoded })}
          defaultFileList={initialValues?.profilePicture ? [initialValues.profilePicture] : undefined}
        >
          {!logoBase64Encoded && uploadButton}
        </Upload>
      </Form.Item>
    </Form>
  )
}
