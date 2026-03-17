import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playlistAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import {
    Plus,
    ListVideo,
    Lock,
    Unlock,
    Clock,
    Trash2,
    Edit2,
    Play
} from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { formatDate } from '@/lib/utils'

export default function Playlists() {
    const { user } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [newPlaylist, setNewPlaylist] = useState({
        name: '',
        description: '',
        isPublic: true,
    })

    const { data: playlists, isLoading } = useQuery({
        queryKey: ['playlists', user?._id],
        queryFn: () => playlistAPI.getUserPlaylists(user._id).then(res => res.data.data),
        enabled: !!user,
    })

    const createMutation = useMutation({
        mutationFn: (data) => playlistAPI.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['playlists'])
            toast.success('Playlist created!')
            setShowCreateModal(false)
            setNewPlaylist({ name: '', description: '', isPublic: true })
        },
        onError: () => {
            toast.error('Failed to create playlist')
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (id) => playlistAPI.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['playlists'])
            toast.success('Playlist deleted')
        },
        onError: () => {
            toast.error('Failed to delete playlist')
        },
    })

    const handleCreate = (e) => {
        e.preventDefault()
        if (!newPlaylist.name.trim()) {
            toast.error('Playlist name is required')
            return
        }
        createMutation.mutate(newPlaylist)
    }

    const handleDelete = (id, name) => {
        if (window.confirm(`Delete "${name}"?`)) {
            deleteMutation.mutate(id)
        }
    }

    if (!user) {
        navigate('/signin')
        return null
    }

    return (
        <div className="space-y-6 text-black dark:text-white">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Your Playlists</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Organize your favorite videos
                    </p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-5 h-5" />
                    New Playlist
                </Button>
            </div>

            {/* Playlists Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="skeleton h-48 rounded-xl" />
                    ))}
                </div>
            ) : playlists && playlists.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {playlists.map((playlist) => (
                        <PlaylistCard
                            key={playlist._id}
                            playlist={playlist}
                            onDelete={handleDelete}
                            onEdit={() => navigate(`/playlist/${playlist._id}`)}
                        />
                    ))}
                </div>
            ) : (
                <div className="card p-12 text-center">
                    <ListVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">No playlists yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Create your first playlist to organize videos
                    </p>
                    <Button onClick={() => setShowCreateModal(true)} className="mx-auto">
                        Create Playlist
                    </Button>
                </div>
            )}

            {/* Create Playlist Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="card max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">Create Playlist</h2>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    placeholder="My Awesome Playlist"
                                    value={newPlaylist.name}
                                    onChange={(e) =>
                                        setNewPlaylist({ ...newPlaylist, name: e.target.value })
                                    }
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Description
                                </label>
                                <textarea
                                    placeholder="What's this playlist about?"
                                    value={newPlaylist.description}
                                    onChange={(e) =>
                                        setNewPlaylist({ ...newPlaylist, description: e.target.value })
                                    }
                                    rows={3}
                                    className="input resize-none"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="isPublic"
                                    checked={newPlaylist.isPublic}
                                    onChange={(e) =>
                                        setNewPlaylist({ ...newPlaylist, isPublic: e.target.checked })
                                    }
                                    className="w-4 h-4"
                                />
                                <label htmlFor="isPublic" className="text-sm">
                                    Make this playlist public
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="submit"
                                    variant="primary"
                                    className="flex-1"
                                    isLoading={createMutation.isPending}
                                >
                                    Create
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

function PlaylistCard({ playlist, onDelete, onEdit }) {
    return (
        <div className="card overflow-hidden group cursor-pointer" onClick={onEdit}>
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center">
                <ListVideo className="w-16 h-16 text-primary opacity-50" />
                <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                    {playlist.videos.length} videos
                </div>
                {playlist.isWatchLater && (
                    <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Watch Later
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                        {playlist.name}
                    </h3>
                    {playlist.isPublic ? (
                        <Unlock className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                        <Lock className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                </div>

                {playlist.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {playlist.description}
                    </p>
                )}

                <p className="text-xs text-gray-500">
                    {formatDate(playlist.createdAt)}
                </p>

                {/* Actions */}
                {!playlist.isWatchLater && (
                    <div className="flex gap-2 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onEdit()
                            }}
                            className="flex-1"
                        >
                            <Edit2 className="w-4 h-4" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                                e.stopPropagation()
                                onDelete(playlist._id, playlist.name)
                            }}
                            className="text-red-500 hover:text-red-600"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}