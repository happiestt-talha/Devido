import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { watchPartyAPI } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Users, Play } from 'lucide-react'
import Button from '@/components/Button'
import Input from '@/components/Input'

export default function JoinWatchParty() {
    const navigate = useNavigate()
    const [code, setCode] = useState('')

    const joinMutation = useMutation({
        mutationFn: () => watchPartyAPI.join(code.toUpperCase()),
        onSuccess: (response) => {
            const party = response.data.data
            toast.success('Joined watch party!')
            navigate(`/watch-party/${party._id}`)
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to join watch party')
        },
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (code.length === 8) {
            joinMutation.mutate()
        }
    }

    return (
        <div className="min-h-[60vh] flex items-center justify-center text-gray-700 dark:text-gray-200">
            <div className="card p-8 max-w-md w-full">
                <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                        <Users className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-3xl font-bold mb-2">Join Watch Party</h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Enter the party code to watch together
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Party Code</label>
                        <Input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="ABCD1234"
                            maxLength={8}
                            className="text-center text-2xl tracking-widest font-mono"
                            autoFocus
                        />
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        className="w-full"
                        disabled={code.length !== 8}
                        isLoading={joinMutation.isPending}
                    >
                        <Play className="w-5 h-5" />
                        Join Party
                    </Button>
                </form>
            </div>
        </div>
    )
}