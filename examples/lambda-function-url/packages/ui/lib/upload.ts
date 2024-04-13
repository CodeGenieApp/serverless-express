import {
  Upload,
  message,
} from 'antd'
import type { UploadChangeParam } from 'antd/es/upload'
import type { RcFile, UploadFile } from 'antd/es/upload/interface'

const DEFAULT_MAX_FILE_SIZE = 65536 //64kb
const DEFAULT_MAX_WIDTH = 1920
const DEFAULT_MAX_HEIGHT = 1080

export function getCompressedBase64 ({
  file,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxWidth = DEFAULT_MAX_WIDTH,
  maxHeight = DEFAULT_MAX_HEIGHT,
}: {
  file: RcFile
  maxFileSize?: number
  maxWidth?: number | null
  maxHeight?: number | null
}): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = function (e) {
      if (!e.target) return

      const img = new Image()
      img.src = e.target.result as string

      img.onload = function () {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        // Flip max values based on orientation
        if (maxWidth && maxHeight && img.width > img.height) {
          maxWidth = 1080
          maxHeight = 1920
        }

        // Calculate new dimensions while maintaining aspect ratio
        let newWidth = img.width
        let newHeight = img.height

        if (maxWidth && newWidth > maxWidth) {
          newHeight = (maxWidth / newWidth) * newHeight
          newWidth = maxWidth
        }

        if (maxHeight && newHeight > maxHeight) {
          newWidth = (maxHeight / newHeight) * newWidth
          newHeight = maxHeight
        }

        // draw image to canvas using max dimensions
        canvas.width = newWidth
        canvas.height = newHeight
        ctx!.drawImage(img, 0, 0, newWidth, newHeight)

        // Use int instead of float so we don't have floating point numbers when doing -0.1
        let qualityInt = 10
        let base64Image = canvas.toDataURL(file.type, qualityInt)
        const imageSupportsCompression = ['image/jpeg', 'image/webp'].includes(file.type)

        if (imageSupportsCompression) {
          // Reduce image quality until it's less than 64kb or quality hits 1
          while (base64Image.length > maxFileSize && qualityInt > 1) {
            qualityInt -= 1
            base64Image = canvas.toDataURL(file.type, qualityInt/10)
          }
        }

        // If image is still > 64kb after reducing quality: reduce dimensions until < 64kb.
        // Images that don't support compression (e.g. png) go straight to reducing dimensions.
        while (base64Image.length > maxFileSize) {
          newWidth *= 0.9
          newHeight *= 0.9
          canvas.width = newWidth
          canvas.height = newHeight
          ctx!.drawImage(img, 0, 0, newWidth, newHeight)
          base64Image = canvas.toDataURL(file.type, qualityInt/10)
        }

        resolve(base64Image)
      }
    }

    reader.readAsDataURL(file)
    reader.onerror = (error) => reject(error)
  })
}

export function customRequest({ onSuccess }: any) {
  // Don't upload
  onSuccess()
}

export function beforeUpload (file: RcFile) {
  const isJpgOrPng = ['image/jpeg', 'image/png'].includes(file.type)

  if (!isJpgOrPng) {
    message.error('Only JPG and PNG are supported.', 3)
    return Upload.LIST_IGNORE
  }

  return true
}

interface HandleUploadChangeParams {
  info: UploadChangeParam<UploadFile>
  setLogoBase64Encoded: any
}

export async function handleUploadChange ({ info, setLogoBase64Encoded }: HandleUploadChangeParams) {
  const { file } = info

  if (!file.originFileObj || !file.size || file.status === 'removed') {
    setLogoBase64Encoded('')
    return
  }

  if (file.status !== 'done') return
  
  const url = await getCompressedBase64({
    file: file.originFileObj as RcFile,
  })

  setLogoBase64Encoded(url)
}
