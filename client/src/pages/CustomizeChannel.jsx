import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { userAPI } from '@/services/api'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'
import { useNavigate } from 'react-router-dom'
import Input from '@/components/Input'
import Button from '@/components/Button'
import {
    Palette,
    Image as ImageIcon,
    Upload as UploadIcon,
    Twitter,
    Instagram,
    Globe,
    X
} from 'lucide-react'

const THEME_COLORS = [
    '#FF0000', // YouTube Red
    '#3B82F6', // Blue
    '#10B981', // Green
    '#F59E0B', // Orange
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#6366F1', // Indigo
    '#14B8A6', // Teal
]

export default function CustomizeChannel() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()

    const [formData, setFormData] = useState({
        channelDescription: user?.channelDescription || '',
        channelTheme: {
            primaryColor: user?.channelTheme?.primaryColor || '#FF0000',
            bannerPosition: user?.channelTheme?.bannerPosition || 'center',
        },
        socialLinks: {
            twitter: user?.socialLinks?.twitter || '',
            instagram: user?.socialLinks?.instagram || '',
            website: user?.socialLinks?.website || '',
        },
    })

    const [bannerFile, setBannerFile] = useState(null)
    const [bannerPreview, setBannerPreview] = useState(user?.channelBanner || '')
    const [isUploading, setIsUploading] = useState(false)

    const updateThemeMutation = useMutation({
        mutationFn: (data) => userAPI.updateUser(user._id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['user', user._id])
            toast.success('Channel customized successfully!')
            navigate('/profile')
        },
        onError: () => {
            toast.error('Failed to update channel')
        },
    })

    const handleBannerSelect = (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file')
            return
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error('Banner must be less than 5MB')
            return
        }

        setBannerFile(file)
        setBannerPreview(URL.createObjectURL(file))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsUploading(true)

        try {
            let bannerUrl = user?.channelBanner || ''

            // Upload banner if changed
            if (bannerFile) {
                toast.info('Uploading banner...')
                bannerUrl = await uploadToCloudinary(bannerFile, 'image')
            }

            await updateThemeMutation.mutateAsync({
                channelBanner: bannerUrl,
                ...formData,
            })
        } catch (error) {
            toast.error('Upload failed')
        } finally {
            setIsUploading(false)
        }
    }

    const handleChange = (field, value) => {
        setFormData({ ...formData, [field]: value })
    }

    const handleThemeChange = (field, value) => {
        setFormData({
            ...formData,
            channelTheme: { ...formData.channelTheme, [field]: value },
        })
    }

    const handleSocialChange = (platform, value) => {
        setFormData({
            ...formData,
            socialLinks: { ...formData.socialLinks, [platform]: value },
        })
    }

    if (!user) {
        return null
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="flex items-center gap-3">
                <Palette className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Customize Your Channel</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Banner Upload */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <ImageIcon className="w-6 h-6" />
                        Channel Banner
                    </h2>

                    {bannerPreview ? (
                        <div className="relative">
                            <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className="w-full h-48 object-cover rounded-lg"
                                style={{ objectPosition: formData.channelTheme.bannerPosition }}
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    setBannerFile(null)
                                    setBannerPreview('')
                                }}
                                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ) : (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-700">
                            <UploadIcon className="w-12 h-12 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Upload channel banner
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                Recommended: 2560x1440px (max 5MB)
                            </p>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleBannerSelect}
                                className="hidden"
                                disabled={isUploading}
                            />
                        </label>
                    )}

                    {/* Banner Position */}
                    {bannerPreview && (
                        <div className="mt-4">
                            <label className="block text-sm font-medium mb-2">
                                Banner Position
                            </label>
                            <div className="flex gap-2">
                                {['top', 'center', 'bottom'].map((pos) => (
                                    <button
                                        key={pos}
                                        type="button"
                                        onClick={() => handleThemeChange('bannerPosition', pos)}
                                        className={`px-4 py-2 rounded-lg capitalize transition-colors ${formData.channelTheme.bannerPosition === pos
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-200 dark:bg-dark-700'
                                            }`}
                                    >
                                        {pos}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Channel Description */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Channel Description</h2>
                    <textarea
                        value={formData.channelDescription}
                        onChange={(e) => handleChange('channelDescription', e.target.value)}
                        placeholder="Tell viewers about your channel..."
                        rows={6}
                        className="input resize-none"
                        disabled={isUploading}
                    />
                </div>

                {/* Theme Color */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <Palette className="w-6 h-6" />
                        Primary Color
                    </h2>
                    <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                        {THEME_COLORS.map((color) => (
                            <button
                                key={color}
                                type="button"
                                onClick={() => handleThemeChange('primaryColor', color)}
                                className={`w-12 h-12 rounded-lg transition-transform hover:scale-110 ${formData.channelTheme.primaryColor === color
                                    ? 'ring-4 ring-offset-2 ring-primary dark:ring-offset-dark-900'
                                    : ''
                                    }`}
                                style={{ backgroundColor: color }}
                            />
                        ))}
                    </div>
                    <Input
                        type="color"
                        value={formData.channelTheme.primaryColor}
                        onChange={(e) => handleThemeChange('primaryColor', e.target.value)}
                        className="mt-4 w-full h-12"
                    />
                </div>

                {/* Social Links */}
                <div className="card p-6">
                    <h2 className="text-xl font-bold mb-4">Social Links</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Twitter className="w-4 h-4" />
                                Twitter
                            </label>
                            <Input
                                type="url"
                                placeholder="https://twitter.com/yourusername"
                                value={formData.socialLinks.twitter}
                                onChange={(e) => handleSocialChange('twitter', e.target.value)}
                                disabled={isUploading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Instagram className="w-4 h-4" />
                                Instagram
                            </label>
                            <Input
                                type="url"
                                placeholder="https://instagram.com/yourusername"
                                value={formData.socialLinks.instagram}
                                onChange={(e) => handleSocialChange('instagram', e.target.value)}
                                disabled={isUploading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                <Globe className="w-4 h-4" />
                                Website
                            </label>
                            <Input
                                type="url"
                                placeholder="https://yourwebsite.com"
                                value={formData.socialLinks.website}
                                onChange={(e) => handleSocialChange('website', e.target.value)}
                                disabled={isUploading}
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <Button
                        type="submit"
                        variant="primary"
                        className="flex-1"
                        isLoading={isUploading || updateThemeMutation.isPending}
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