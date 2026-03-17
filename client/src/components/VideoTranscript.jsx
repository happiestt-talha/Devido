import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import api from '@/services/api'
import { toast } from 'sonner'
import {
    MessageSquare,
    Search,
    Download,
    Copy,
    Loader2,
    ChevronDown,
    ChevronUp
} from 'lucide-react'
import Button from './Button'
import Input from './Input'

export default function VideoTranscript({ videoId, isOwner, onSeek }) {
    const { user } = useAuthStore()
    const [searchQuery, setSearchQuery] = useState('')
    const [isExpanded, setIsExpanded] = useState(false)

    const { data: transcript, isLoading } = useQuery({
        queryKey: ['transcript', videoId],
        queryFn: () => api.get(`/transcripts/${videoId}`).then(res => res.data.data),
        enabled: !!videoId,
        retry: false,
    })

    const { data: searchResults } = useQuery({
        queryKey: ['transcript-search', videoId, searchQuery],
        queryFn: () =>
            api.get(`/transcripts/${videoId}/search?query=${searchQuery}`).then(res => res.data.data),
        enabled: !!videoId && searchQuery.length > 2,
    })

    const generateMutation = useMutation({
        mutationFn: () =>
            api.post('/transcripts/generate', { videoId }),
        onSuccess: () => {
            toast.success('Transcript generation started! This may take a few minutes.')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to generate transcript')
        },
    })

    const copyTranscript = () => {
        if (transcript?.text) {
            navigator.clipboard.writeText(transcript.text)
            toast.success('Transcript copied to clipboard')
        }
    }

    const downloadTranscript = () => {
        if (transcript?.text) {
            const blob = new Blob([transcript.text], { type: 'text/plain' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `transcript-${videoId}.txt`
            a.click()
            toast.success('Transcript downloaded')
        }
    }

    const handleWordClick = (start) => {
        onSeek?.(start)
    }

    if (isLoading) {
        return (
            <div className="card p-6">
                <div className="flex items-center gap-3 text-gray-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading transcript...</span>
                </div>
            </div>
        )
    }

    if (!transcript && !isOwner) {
        return null
    }

    if (!transcript && isOwner) {
        return (
            <div className="card p-6">
                <div className="flex items-start gap-4">
                    <MessageSquare className="w-6 h-6 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                        <h3 className="font-semibold mb-2">No Transcript Available</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Generate an AI-powered transcript to make your video searchable and accessible.
                        </p>
                        <Button
                            onClick={() => generateMutation.mutate()}
                            isLoading={generateMutation.isPending}
                        >
                            Generate Transcript
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="card text-black dark:text-white">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center gap-2 font-semibold hover:text-primary transition-colors"
                    >
                        <MessageSquare className="w-5 h-5" />
                        Transcript
                        {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                        ) : (
                            <ChevronDown className="w-4 h-4" />
                        )}
                    </button>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={copyTranscript}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                            title="Copy transcript"
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                        <button
                            onClick={downloadTranscript}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                            title="Download transcript"
                        >
                            <Download className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Search */}
                {isExpanded && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="Search in transcript..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                )}
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4 max-h-96 overflow-y-auto">
                    {searchResults && searchResults.length > 0 ? (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-500 mb-3">
                                {searchResults.length} results found
                            </p>
                            {searchResults.map((result, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleWordClick(result.start)}
                                    className="block w-full text-left p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors"
                                >
                                    <p className="text-sm mb-1">
                                        <span className="text-primary font-medium">{result.text}</span>
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {result.context}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {formatTime(result.start)}
                                    </p>
                                </button>
                            ))}
                        </div>
                    ) : searchQuery.length > 0 ? (
                        <p className="text-sm text-gray-500 text-center py-6">
                            No results found for "{searchQuery}"
                        </p>
                    ) : transcript.chapters && transcript.chapters.length > 0 ? (
                        <div className="space-y-4">
                            {transcript.chapters.map((chapter, index) => (
                                <div key={index} className="space-y-2">
                                    <button
                                        onClick={() => handleWordClick(chapter.start)}
                                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-700 transition-colors w-full text-left"
                                    >
                                        <span className="text-xs text-gray-500 mt-1 flex-shrink-0">
                                            {formatTime(chapter.start)}
                                        </span>
                                        <div className="flex-1">
                                            <h4 className="font-medium mb-1">{chapter.headline}</h4>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                {chapter.summary}
                                            </p>
                                        </div>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {transcript.text}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
}