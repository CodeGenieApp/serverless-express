'use client'

import React, { useEffect, useState } from 'react'
import { UploadOutlined } from '@ant-design/icons'
import { Button, Form, Modal, Input, Select, Upload } from 'antd'
import { useMeQuery, useUpdateMeMutation } from './meHooks'
import { beforeUpload, customRequest, handleUploadChange } from '@/ui/lib/upload'

interface MeUpsertModalParams {
  isOpen: boolean
  setIsOpen: any
}

export default function MeUpsertModal({ isOpen, setIsOpen }: MeUpsertModalParams) {
  const meMutation = useUpdateMeMutation()

  function onCancel() {
    setIsOpen(false)
  }

  return (
    <Modal
      centered
      title='Account'
      open={isOpen}
      destroyOnClose
      onCancel={onCancel}
      footer={[
        <Button key='cancel' disabled={meMutation.isLoading} onClick={onCancel}>
          Cancel
        </Button>,
        <Button type='primary' form='me' key='submit' htmlType='submit' loading={meMutation.isLoading}>
          Update
        </Button>,
      ]}
    >
      <MeUpsertForm onEdit={() => setIsOpen(false)} meMutation={meMutation} />
    </Modal>
  )
}

function MeUpsertForm({ onEdit, meMutation }) {
  const meQuery = useMeQuery()
  const me = meQuery.data?.data
  const [meForm] = Form.useForm()
  const [logoBase64Encoded, setLogoBase64Encoded] = useState<string>()

  const uploadButton = (
    <div>
      <UploadOutlined style={{ fontSize: 24 }} />
    </div>
  )

  // When editing multiple records on the same page, we need to call resetFields,
  // otherwise the form lags behind, showing the previously selected record's values.
  // https://github.com/ant-design/ant-design/issues/22372
  useEffect(() => {
    meForm.resetFields()

    if (me) {
      setLogoBase64Encoded(me.profilePicture)
    }
  }, [me])

  async function submitForm() {
    const formValues = await meForm.validateFields()
    formValues.profilePicture = logoBase64Encoded
    const { userId } = me

    const response = await meMutation.mutateAsync({
      userId,
      data: formValues,
    })

    if (response) {
      onEdit()
    }
  }

  const initialValues = {
    ...me,
    profilePicture: me.profilePicture
      ? {
        uid: '1',
        status: 'done',
        url: me.profilePicture,
      }
      : undefined,
  }

  return (
    <Form name='me' preserve={false} initialValues={initialValues} form={meForm} onFinish={submitForm} layout='vertical' disabled={meMutation.isLoading}>
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
      <Form.Item label='Profile Picture' name='profilePicture' valuePropName='filesList'>
        <Upload
          name='profilePicture'
          listType='picture-circle'
          accept='.png, .jpg'
          showUploadList={{ showPreviewIcon: false }}
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
