import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { userAPI } from '@/services/api'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import { User, Upload, X } from 'lucide-react'
import Input from '@/components/Input'
import Button from '@/components/Button'

export default function EditProfile() {
    const { user, setUser } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
    })

    const [avatarFile, setAvatarFile] = useState(null)
    const [avatarPreview, setAvatarPreview] = useState(user?.img || '')
    const [isUploading, setIsUploading] = useState(false)

    const updateMutation = useMutation({
        mutationFn: (data) => userAPI.updateUser(user._id, data),
        onSuccess: (response) => {
            const updatedUser = response.data.data
            setUser(updatedUser)
            queryClient.invalidateQueries(['user', user._id])
            toast.success('Profile updated successfully!')
            navigate('/profile')
        },
        onError: () => {
            toast.error('Failed to update profile')
        },
    })

    const handleAvatarSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Avatar must be less than 5MB')
            return
        }

        setAvatarFile(file)
        setAvatarPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            let avatarUrl = user?.img || ''

            // Upload avatar if changed
            if (avatarFile) {
                toast.info('Uploading avatar...')
                avatarUrl = await uploadToCloudinary(avatarFile, 'image')
            }

            await updateMutation.mutateAsync({
                name: formData.name,
                email: formData.email,
                img: avatarUrl,
            })
        } catch (error) {
            toast.error('Update failed')
        } finally {
            setIsUploading(false)
        }
    }

    if (!user) {
        navigate('/signin')
        return null
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6 text-black dark:text-white">
            {/* Header */}
            <div className="flex items-center gap-3">
                <User className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Edit Profile</h1>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-6">
                {/* Avatar */}
                <div>
                    <label className="block text-sm font-medium mb-3">Profile Picture</label>
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            <img
                                src={avatarPreview || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                alt="Avatar"
                                className="w-24 h-24 rounded-full object-cover"
                            />
                            {avatarFile && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setAvatarFile(null)
                                        setAvatarPreview(user.img)
                                    }}
                                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        <label className="cursor-pointer">
                            <div className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg hover:border-primary transition-colors text-center">
                                <Upload className="w-5 h-5 mx-auto mb-1 text-gray-400" />
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Upload new avatar
                                </p>
                                <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarSelect}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Username <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        disabled={isUploading}
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        disabled={isUploading}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4 pt-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={isUploading || updateMutation.isPending}
                    >
                        Save Changes
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate('/profile')}
                        disabled={isUploading}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    )
}