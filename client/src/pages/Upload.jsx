import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { videoAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'
import Input from '@/components/Input'
import Button from '@/components/Button'
import ScreenRecorder from '@/components/ScreenRecorder'
import { Upload as UploadIcon, AlertCircle, X, FileVideo, Image as ImageIcon } from 'lucide-react'

export default function Upload() {
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const [formData, setFormData] = useState({
        title: '',
        desc: '',
        tags: '',
    })

    const [videoFile, setVideoFile] = useState(null)
    const [thumbnailFile, setThumbnailFile] = useState(null)
    const [videoPreview, setVideoPreview] = useState(null)
    const [thumbnailPreview, setThumbnailPreview] = useState(null)
    const [recordedVideo, setRecordedVideo] = useState(null)

    const [uploadProgress, setUploadProgress] = useState({
        video: 0,
        thumbnail: 0,
    })
    const [isUploading, setIsUploading] = useState(false)

    const uploadMutation = useMutation({
        mutationFn: (data) => videoAPI.createVideo(data),
        onSuccess: (response) => {
            toast.success('Video uploaded successfully!')
            navigate(`/video/${response.data.data._id}`)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to upload video')
        },
    })

    const handleRecordingComplete = async (blob) => {
        setRecordedVideo(blob)
        toast.success('Recording ready! Now uploading...')

        try {
            const videoUrl = await uploadToCloudinary(
                new File([blob], `recording-${Date.now()}.webm`, { type: 'video/webm' }),
                'video'
            )
            setFormData({ ...formData, videoUrl })
            toast.success('Recording uploaded!')
        } catch (error) {
            toast.error('Failed to upload recording')
        }
    }

    const handleVideoSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('video/')) {
            toast.error('Please select a valid video file')
            return
        }

        // Validate file size (max 100MB)
        if (file.size > 100 * 1024 * 1024) {
            toast.error('Video must be less than 100MB')
            return
        }

        setVideoFile(file)
        setVideoPreview(URL.createObjectURL(file))
    }

    const handleThumbnailSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file')
            return
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Thumbnail must be less than 5MB')
            return
        }

        setThumbnailFile(file)
        setThumbnailPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!videoFile || !thumbnailFile) {
            toast.error('Please select both video and thumbnail')
            return
        }

        setIsUploading(true)

        try {
            // Upload video with progress
            toast.info('Uploading video...')
            const videoUrl = await uploadToCloudinary(videoFile, 'video', (progress) => {
                setUploadProgress(prev => ({ ...prev, video: progress }))
            })

            // Upload thumbnail with progress
            toast.info('Uploading thumbnail...')
            const imgUrl = await uploadToCloudinary(thumbnailFile, 'image', (progress) => {
                setUploadProgress(prev => ({ ...prev, thumbnail: progress }))
            })

            const tagsArray = formData.tags
                ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
                : []
            // Create video
            await uploadMutation.mutateAsync({
                ...formData,
                tags: tagsArray,
                videoUrl,
                imgUrl,
            })

            // Reset progress
            setUploadProgress({ video: 0, thumbnail: 0 })
        } catch (error) {
            toast.error('Upload failed')
            setIsUploading(false)
            setUploadProgress({ video: 0, thumbnail: 0 })
        } finally {
            setIsUploading(false)
            setUploadProgress({ video: 0, thumbnail: 0 })
        }
    }


    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        })
    }

    const removeVideo = () => {
        setVideoFile(null)
        setVideoPreview(null)
        setUploadProgress({ ...uploadProgress, video: 0 })
    }

    const removeThumbnail = () => {
        setThumbnailFile(null)
        setThumbnailPreview(null)
        setUploadProgress({ ...uploadProgress, thumbnail: 0 })
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-bold mb-2">Sign in required</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    You need to be signed in to upload videos
                </p>
                <button
                    onClick={() => navigate('/signin')}
                    className="btn-primary"
                >
                    Sign In
                </button>
            </div>
        )
    }

    return (
        <div className="max-w-3xl mx-auto text-gray-700 dark:text-gray-200">
            <ScreenRecorder onRecordingComplete={handleRecordingComplete} />
            <div className="card p-8">
                <div className="flex items-center gap-3 mb-6">
                    <UploadIcon className="w-8 h-8 text-primary" />
                    <h1 className="text-3xl font-bold">Upload Video</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Video File <span className="text-red-500">*</span>
                        </label>

                        {!videoFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                                <FileVideo className="w-12 h-12 text-gray-400 mb-3" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to upload video
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    MP4, WebM, or MOV (max 100MB)
                                </p>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={handleVideoSelect}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <video
                                    src={videoPreview}
                                    controls
                                    className="w-full max-h-64 rounded-lg bg-black"
                                />
                                <button
                                    type="button"
                                    onClick={removeVideo}
                                    disabled={isUploading}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)
                                </p>
                                {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                                    <div className="mt-2">
                                        <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-primary transition-all duration-300"
                                                style={{ width: `${uploadProgress.video}%` }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Uploading video... {uploadProgress.video}%
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            name="title"
                            placeholder="Enter video title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            disabled={isUploading}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Description
                        </label>
                        <textarea
                            name="desc"
                            placeholder="Tell viewers about your video"
                            value={formData.desc}
                            onChange={handleChange}
                            rows={6}
                            className="input resize-none"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Thumbnail Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Thumbnail (Optional)
                        </label>

                        {!thumbnailFile ? (
                            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700 transition-colors">
                                <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Click to upload thumbnail
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    JPG, PNG, or WebP (max 5MB)
                                </p>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleThumbnailSelect}
                                    className="hidden"
                                    disabled={isUploading}
                                />
                            </label>
                        ) : (
                            <div className="relative">
                                <img
                                    src={thumbnailPreview}
                                    alt="Thumbnail preview"
                                    className="w-full max-w-md rounded-lg object-cover"
                                />
                                <button
                                    type="button"
                                    onClick={removeThumbnail}
                                    disabled={isUploading}
                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                    {thumbnailFile.name} ({(thumbnailFile.size / 1024 / 1024).toFixed(2)} MB)
                                </p>
                            </div>
                        )}
                    </div>


                    {isUploading && (
                        <div className="space-y-4 mt-4">
                            {/* Video Progress */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Uploading Video</span>
                                    <span className="text-sm text-gray-500">{uploadProgress.video}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary transition-all duration-300"
                                        style={{ width: `${uploadProgress.video}%` }}
                                    />
                                </div>
                            </div>

                            {/* Thumbnail Progress */}
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">Uploading Thumbnail</span>
                                    <span className="text-sm text-gray-500">{uploadProgress.thumbnail}%</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-dark-700 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-green-500 transition-all duration-300"
                                        style={{ width: `${uploadProgress.thumbnail}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Tags
                        </label>
                        <Input
                            type="text"
                            name="tags"
                            placeholder="javascript, tutorial, coding"
                            value={formData.tags}
                            onChange={handleChange}
                            disabled={isUploading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Separate tags with commas
                        </p>
                    </div>

                    {/* Submit */}
                    <div className="flex gap-4 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={isUploading || uploadMutation.isPending}
                            disabled={!videoFile}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Video'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/')}
                            disabled={isUploading}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}