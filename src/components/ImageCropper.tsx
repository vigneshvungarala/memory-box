import React, { useState, useRef, useEffect } from 'react'
import ReactCrop, { type Crop, centerCrop, makeAspectCrop, PixelCrop } from 'react-image-crop'
import 'react-image-crop/dist/ReactCrop.css'

interface ImageCropperProps {
  imageSrc: string
  onCropComplete: (croppedFile: File) => void
  onCancel: () => void
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export default function ImageCropper({ imageSrc, onCropComplete, onCancel }: ImageCropperProps) {
  const [crop, setCrop] = useState<Crop>()
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>()
  const imgRef = useRef<HTMLImageElement>(null)
  const [isCropping, setIsCropping] = useState(false)

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget
    setCrop(centerAspectCrop(width, height, 4 / 5))
  }

  const handleSave = async () => {
    if (!completedCrop || !imgRef.current) return
    try {
      setIsCropping(true)
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop, 'cropped.jpeg')
      onCropComplete(croppedFile)
    } catch (e) {
      console.error(e)
      alert('Error cropping image')
    } finally {
      setIsCropping(false)
    }
  }

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.8)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative', flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#333', overflow: 'hidden', padding: '20px' }}>
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={4 / 5}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imageSrc}
            onLoad={onImageLoad}
            crossOrigin="anonymous"
            style={{ maxHeight: 'calc(100vh - 120px)', maxWidth: '100%', objectFit: 'contain' }}
          />
        </ReactCrop>
      </div>
      <div style={{ padding: '20px', backgroundColor: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} className="solid-input" style={{ width: 'auto', padding: '8px 16px', background: '#e4e4e7', cursor: 'pointer' }}>Cancel</button>
          <button onClick={handleSave} disabled={isCropping || !completedCrop} className="glass-button" style={{ padding: '8px 16px' }}>{isCropping ? 'Cropping...' : 'Crop & Save'}</button>
        </div>
      </div>
    </div>
  )
}

function getCroppedImg(image: HTMLImageElement, crop: PixelCrop, fileName: string): Promise<File> {
  const canvas = document.createElement('canvas')
  const scaleX = image.naturalWidth / image.width
  const scaleY = image.naturalHeight / image.height
  const ctx = canvas.getContext('2d')
  
  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = crop.width * scaleX
  canvas.height = crop.height * scaleY

  ctx.imageSmoothingQuality = 'high'
  
  const cropX = crop.x * scaleX
  const cropY = crop.y * scaleY
  const cropWidth = crop.width * scaleX
  const cropHeight = crop.height * scaleY

  ctx.drawImage(
    image,
    cropX,
    cropY,
    cropWidth,
    cropHeight,
    0,
    0,
    cropWidth,
    cropHeight,
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'))
        return
      }
      const file = new File([blob], fileName, { type: 'image/jpeg' })
      resolve(file)
    }, 'image/jpeg', 1)
  })
}
