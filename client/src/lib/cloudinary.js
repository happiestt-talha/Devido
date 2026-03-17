const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const uploadToCloudinary = async (file, resourceType = 'auto', onProgress) => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

    if (!cloudName || !uploadPreset) {
        throw new Error('Cloudinary configuration missing')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', uploadPreset)

    if (resourceType === 'video') {
        formData.append('folder', 'devido/videos')
    } else if (resourceType === 'image') {
        formData.append('folder', 'devido/thumbnails')
    }

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
            {
                method: 'POST',
                body: formData,
            }
        )

        if (!response.ok) {
            throw new Error('Upload failed')
        }

        // Track upload progress using XHR instead
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest()

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable && onProgress) {
                    const percentComplete = Math.round((e.loaded / e.total) * 100)
                    onProgress(percentComplete)
                }
            })

            xhr.addEventListener('load', () => {
                if (xhr.status === 200) {
                    const data = JSON.parse(xhr.responseText)
                    resolve(data.secure_url)
                } else {
                    reject(new Error('Upload failed'))
                }
            })

            xhr.addEventListener('error', () => reject(new Error('Upload failed')))

            xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`)
            xhr.send(formData)
        })
    } catch (error) {
        console.error('Cloudinary upload error:', error)
        throw error
    }
}

export function getOptimizedImageUrl(url, width = 800) {
    if (!url || !url.includes('cloudinary.com')) return url

    // Insert transformation parameters
    const parts = url.split('/upload/')
    if (parts.length !== 2) return url

    return `${parts[0]}/upload/w_${width},c_fill,q_auto,f_auto/${parts[1]}`
}