import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { watchPartyAPI, videoAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import {
    Users,
    Send,
    LogOut,
    Copy,
    Play,
    Pause,
    Volume2
} from 'lucide-react'
import Button from '@/components/Button'
import VideoPlayer from '@/components/VideoPlayer'
import { motion, AnimatePresence } from 'framer-motion'

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '🔥', '👏', '🎉']

export default function WatchParty() {
    const { id } = useParams()
    const navigate = useNavigate()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const [message, setMessage] = useState('')
    const [videoElement, setVideoElement] = useState(null)
    const [isHost, setIsHost] = useState(false)
    const [floatingReactions, setFloatingReactions] = useState([])

    const messagesEndRef = useRef(null)
    const syncIntervalRef = useRef(null)

    // Fetch party
    const { data: party, refetch } = useQuery({
        queryKey: ['watch-party', id],
        queryFn: () => watchPartyAPI.get(id).then(res => res.data.data),
        enabled: !!id,
        refetchInterval: 2000, // Poll every 2 seconds
    })

    // Fetch video
    const { data: video } = useQuery({
        queryKey: ['video', party?.videoId],
        queryFn: () => videoAPI.getVideo(party.videoId).then(res => res.data.data || res.data),
        enabled: !!party?.videoId,
    })

    useEffect(() => {
        if (party && user) {
            setIsHost(party.hostId === user._id)
        }
    }, [party, user])

    // Sync playback state
    useEffect(() => {
        if (videoElement && party && !isHost) {
            // Sync time if difference > 2 seconds
            if (Math.abs(videoElement.currentTime - party.currentTime) > 2) {
                videoElement.currentTime = party.currentTime
            }

            // Sync play/pause state
            if (party.isPlaying && videoElement.paused) {
                videoElement.play().catch(() => { })
            } else if (!party.isPlaying && !videoElement.paused) {
                videoElement.pause()
            }
        }
    }, [party?.currentTime, party?.isPlaying, videoElement, isHost])

    // Host sync playback
    useEffect(() => {
        if (isHost && videoElement) {
            syncIntervalRef.current = setInterval(() => {
                syncMutation.mutate({
                    currentTime: videoElement.currentTime,
                    isPlaying: !videoElement.paused,
                })
            }, 3000)

            return () => {
                if (syncIntervalRef.current) {
                    clearInterval(syncIntervalRef.current)
                }
            }
        }
    }, [isHost, videoElement])

    // Auto-scroll messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [party?.messages])

    // Sync mutation
    const syncMutation = useMutation({
        mutationFn: ({ currentTime, isPlaying }) =>
            watchPartyAPI.syncPlayback(id, currentTime, isPlaying),
    })

    // Send message mutation
    const sendMessageMutation = useMutation({
        mutationFn: (msg) => watchPartyAPI.sendMessage(id, msg),
        onSuccess: () => {
            setMessage('')
            refetch()
        },
    })

    // Send reaction mutation
    const sendReactionMutation = useMutation({
        mutationFn: (emoji) => watchPartyAPI.sendReaction(id, emoji),
        onSuccess: (response) => {
            const reaction = response.data
            // Add floating reaction
            setFloatingReactions(prev => [
                ...prev,
                { id: Date.now(), emoji: reaction.emoji }
            ])
            setTimeout(() => {
                setFloatingReactions(prev => prev.filter(r => r.id !== Date.now()))
            }, 3000)
            refetch()
        },
    })

    // Leave mutation
    const leaveMutation = useMutation({
        mutationFn: () => watchPartyAPI.leave(id),
        onSuccess: () => {
            toast.success('Left watch party')
            navigate('/')
        },
    })

    const handleSendMessage = (e) => {
        e.preventDefault()
        if (message.trim()) {
            sendMessageMutation.mutate(message)
        }
    }

    const handleReaction = (emoji) => {
        sendReactionMutation.mutate(emoji)
    }

    const copyPartyCode = () => {
        navigator.clipboard.writeText(party.code)
        toast.success('Party code copied!')
    }

    if (!party || !video) {
        return <div className="text-center py-12">Loading party...</div>
    }

    return (
        <div className="h-[calc(100vh-5rem)] flex gap-4 text-gray-700 dark:text-gray-200">
            {/* Main video area */}
            <div className="flex-1 flex flex-col">
                {/* Party header */}
                <div className="card p-4 mb-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">{party.name}</h1>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {party.participants.length} watching • Code: {party.code}
                            </p>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={copyPartyCode}>
                                <Copy className="w-4 h-4" />
                                Copy Code
                            </Button>
                            <Button variant="danger" onClick={() => leaveMutation.mutate()}>
                                <LogOut className="w-4 h-4" />
                                Leave
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Video player */}
                <div className="relative flex-1">
                    <VideoPlayer
                        url={video.videoUrl}
                        title={video.title}
                        onVideoReady={setVideoElement}
                    />

                    {/* Floating reactions */}
                    <div className="absolute bottom-20 right-4 pointer-events-none">
                        <AnimatePresence>
                            {floatingReactions.map((reaction) => (
                                <motion.div
                                    key={reaction.id}
                                    initial={{ y: 0, opacity: 1, scale: 1 }}
                                    animate={{ y: -100, opacity: 0, scale: 1.5 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 3 }}
                                    className="text-4xl absolute"
                                    style={{ right: Math.random() * 50 }}
                                >
                                    {reaction.emoji}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Reaction buttons */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                        {REACTION_EMOJIS.map((emoji) => (
                            <button
                                key={emoji}
                                onClick={() => handleReaction(emoji)}
                                className="text-2xl hover:scale-125 transition-transform"
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>

                    {/* Host indicator */}
                    {isHost && (
                        <div className="absolute top-4 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                            You're the host
                        </div>
                    )}
                </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 card flex flex-col">
                {/* Participants */}
                <div className="p-4 border-b border-gray-200 dark:border-dark-700">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Participants ({party.participants.length})
                    </h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {party.participants.map((participant) => (
                            <div key={participant.userId} className="flex items-center gap-2">
                                <img
                                    src={participant.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={participant.username}
                                    className="w-8 h-8 rounded-full"
                                />
                                <span className="text-sm">
                                    {participant.username}
                                    {participant.userId === party.hostId && (
                                        <span className="ml-2 text-xs bg-primary text-white px-2 py-0.5 rounded">
                                            Host
                                        </span>
                                    )}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {party.messages.map((msg, index) => (
                            <div key={index} className="space-y-1">
                                <p className="text-xs text-gray-500">{msg.username}</p>
                                <p className="text-sm bg-gray-100 dark:bg-dark-700 rounded-lg px-3 py-2">
                                    {msg.message}
                                </p>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message input */}
                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200 dark:border-dark-700">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="input flex-1"
                            />
                            <Button type="submit" disabled={!message.trim()}>
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}