import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { userAPI, commentAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/lib/utils'
import { toast } from 'sonner'
import { Trash2, Edit2, Check, X } from 'lucide-react'
import Button from './Button'
import CommentReactions from './CommentReactions'

export default function Comment({ comment, videoId }) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [isEditing, setIsEditing] = useState(false)
    const [editedText, setEditedText] = useState(comment.desc)

    // Fetch comment author
    const { data: author } = useQuery({
        queryKey: ['user', comment.userId],
        queryFn: () => userAPI.getUser(comment.userId).then(res => res.data.data),
        enabled: !!comment.userId,
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: () => commentAPI.deleteComment(comment._id),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', videoId])
            toast.success('Comment deleted')
        },
        onError: () => {
            toast.error('Failed to delete comment')
        },
    })

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (desc) => commentAPI.updateComment(comment._id, { desc }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', videoId])
            setIsEditing(false)
            toast.success('Comment updated')
        },
        onError: () => {
            toast.error('Failed to update comment')
        },
    })

    const handleUpdate = () => {
        if (editedText.trim() && editedText !== comment.desc) {
            updateMutation.mutate(editedText)
        } else {
            setIsEditing(false)
        }
    }

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this comment?')) {
            deleteMutation.mutate()
        }
    }

    const isOwner = user?._id === comment.userId

    return (
        <div className="flex gap-3">
            <img
                src={author?.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={author?.name}
                className="w-10 h-10 rounded-full object-cover flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{author?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-500">
                        {formatDate(comment.createdAt)}
                    </span>
                </div>

                {isEditing ? (
                    <div className="space-y-2">
                        <textarea
                            value={editedText}
                            onChange={(e) => setEditedText(e.target.value)}
                            className="input resize-none"
                            rows={3}
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={handleUpdate}
                                isLoading={updateMutation.isPending}
                            >
                                <Check className="w-4 h-4" />
                                Save
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsEditing(false)
                                    setEditedText(comment.desc)
                                }}
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-2">
                            {comment.desc}
                        </p>

                        {/* Reactions */}
                        <CommentReactions
                            commentId={comment._id}
                            reactions={comment.reactions || {}}
                            videoId={videoId}
                        />

                        {isOwner && (
                            <div className="flex gap-2 mt-2">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1"
                                >
                                    <Edit2 className="w-3 h-3" />
                                    Edit
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="text-xs text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1"
                                >
                                    <Trash2 className="w-3 h-3" />
                                    Delete
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}