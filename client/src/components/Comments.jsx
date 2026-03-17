import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { commentAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import Comment from './Comment'
import { CommentSkeleton } from './Skeleton'
import Button from './Button'
import { MessageSquare } from 'lucide-react'

export default function Comments({ videoId }) {
    const { user } = useAuthStore()
    const queryClient = useQueryClient()
    const [newComment, setNewComment] = useState('')

    // Fetch comments
    const { data: comments, isLoading } = useQuery({
        queryKey: ['comments', videoId],
        queryFn: () => commentAPI.getComments(videoId).then(res => res.data.data),
        enabled: !!videoId,
    })

    // Add comment mutation
    const addCommentMutation = useMutation({
        mutationFn: (desc) => commentAPI.addComment({ desc, videoId }),
        onSuccess: () => {
            queryClient.invalidateQueries(['comments', videoId])
            setNewComment('')
            toast.success('Comment added')
        },
        onError: () => {
            toast.error('Failed to add comment')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!user) {
            toast.error('Please sign in to comment')
            return
        }
        if (newComment.trim()) {
            addCommentMutation.mutate(newComment)
        }
    }

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
                <MessageSquare className="w-6 h-6" />
                {comments?.length || 0} Comments
            </h2>

            {/* Add comment */}
            {user && (
                <form onSubmit={handleSubmit} className="flex gap-3">
                    <img
                        src={user.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                        alt={user.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="Add a comment..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="input mb-2"
                        />
                        <div className="flex gap-2 justify-end">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => setNewComment('')}
                                disabled={!newComment}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="primary"
                                disabled={!newComment.trim()}
                                isLoading={addCommentMutation.isPending}
                            >
                                Comment
                            </Button>
                        </div>
                    </div>
                </form>
            )}

            {/* Comments list */}
            <div className="space-y-6">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <CommentSkeleton key={i} />
                    ))
                ) : comments && comments.length > 0 ? (
                    comments.map((comment) => (
                        <Comment key={comment._id} comment={comment} videoId={videoId} />
                    ))
                ) : (
                    <div className="text-center py-12 text-gray-500">
                        No comments yet. Be the first to comment!
                    </div>
                )}
            </div>
        </div>
    )
}