import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merge Tailwind classes without conflicts
export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

// Format view count (1000 -> 1K, 1000000 -> 1M)
export function formatViews(views) {
    if (!views) return '0'

    if (views >= 1000000) {
        return `${(views / 1000000).toFixed(1)}M`
    }
    if (views >= 1000) {
        return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
}

// Format date (e.g., "2 days ago")
export function formatDate(date) {
    if (!date) return ''

    const now = new Date()
    const past = new Date(date)
    const diffInSeconds = Math.floor((now - past) / 1000)

    if (diffInSeconds < 60) return 'just now'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`
    return `${Math.floor(diffInSeconds / 31536000)} years ago`
}

// Truncate text
export function truncate(text, length = 50) {
    if (!text) return ''
    if (text.length <= length) return text
    return text.substring(0, length) + '...'
}

// Format duration (seconds to MM:SS)
export function formatDuration(seconds) {
    if (!seconds) return '0:00'

    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
}