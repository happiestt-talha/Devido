import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { authAPI } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import Input from '@/components/Input'
import Button from '@/components/Button'
import { Video } from 'lucide-react'

export default function SignIn() {
    const navigate = useNavigate()
    const { login } = useAuthStore()
    const [isSignUp, setIsSignUp] = useState(false)

    const [signInData, setSignInData] = useState({ name: '', password: '' })
    const [signUpData, setSignUpData] = useState({ name: '', email: '', password: '' })

    // Sign in mutation
    const signInMutation = useMutation({
        mutationFn: (data) => authAPI.login(data),
        onSuccess: (response) => {
            login(response.data.data)
            toast.success('Signed in successfully')
            navigate('/')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to sign in')
        },
    })

    // Sign up mutation
    const signUpMutation = useMutation({
        mutationFn: (data) => authAPI.signup(data),
        onSuccess: (response) => {
            login(response.data.data)
            toast.success('Account created successfully')
            navigate('/')
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || 'Failed to create account')
        },
    })

    const handleSignIn = (e) => {
        e.preventDefault()
        signInMutation.mutate(signInData)
    }

    const handleSignUp = (e) => {
        e.preventDefault()
        if (signUpData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }
        signUpMutation.mutate(signUpData)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-transparent to-primary/5 dark:from-primary/10 dark:to-transparent flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <Video className="w-10 h-10 text-primary" />
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary to-red-600 bg-clip-text text-transparent">
                            Devido
                        </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                        Share and watch amazing videos
                    </p>
                </div>

                {/* Form card */}
                <div className="card p-8 shadow-xl">
                    <div className="flex gap-4 mb-6">
                        <button
                            onClick={() => setIsSignUp(false)}
                            className={`flex-1 py-2 font-medium transition-colors ${!isSignUp
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => setIsSignUp(true)}
                            className={`flex-1 py-2 font-medium transition-colors ${isSignUp
                                ? 'text-primary border-b-2 border-primary'
                                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {!isSignUp ? (
                        // Sign In Form
                        <form onSubmit={handleSignIn} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={signInData.name}
                                onChange={(e) => setSignInData({ ...signInData, name: e.target.value })}
                                required
                                className="text-gray-700 dark:text-gray-200"
                            />
                            <Input
                                type="password"
                                placeholder="Password"
                                value={signInData.password}
                                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                                required
                                className="text-gray-700 dark:text-gray-200"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={signInMutation.isPending}
                            >
                                Sign In
                            </Button>
                        </form>
                    ) : (
                        // Sign Up Form
                        <form onSubmit={handleSignUp} className="space-y-4">
                            <Input
                                type="text"
                                placeholder="Username"
                                value={signUpData.name}
                                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                                required
                                className="text-gray-700 dark:text-gray-200"
                            />
                            <Input
                                type="email"
                                placeholder="Email"
                                value={signUpData.email}
                                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                                required
                                className="text-gray-700 dark:text-gray-200"
                            />
                            <Input
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={signUpData.password}
                                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                                required
                                className="text-gray-700 dark:text-gray-200"
                            />
                            <Button
                                type="submit"
                                variant="primary"
                                className="w-full"
                                isLoading={signUpMutation.isPending}
                            >
                                Create Account
                            </Button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}