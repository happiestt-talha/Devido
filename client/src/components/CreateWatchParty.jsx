import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { watchPartyAPI } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import Button from './Button'
import Input from './Input'

export default function CreateWatchParty({ videoId, onClose }) {
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        name: 'Watch Party',
        description: '',
        maxParticipants: 50,
    })

    const createMutation = useMutation({
        mutationFn: () => watchPartyAPI.create({ ...formData, videoId }),
        onSuccess: (response) => {
            const party = response.data.data
            toast.success(`Party created! Code: ${party.code}`)
            navigate(`/watch-party/${party._id}`)
        },
        onError: () => {
            toast.error('Failed to create watch party')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        createMutation.mutate()
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="card max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold">Create Watch Party</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Party Name</label>
                        <Input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                            className="input resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Max Participants</label>
                        <Input
                            type="number"
                            min="2"
                            max="100"
                            value={formData.maxParticipants}
                            onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="submit"
                            variant="primary"
                            className="flex-1"
                            isLoading={createMutation.isPending}
                        >
                            Create Party
                        </Button>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}