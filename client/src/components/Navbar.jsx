import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, User, Menu } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'

export default function Navbar({ onMenuClick }) {
    const [searchQuery, setSearchQuery] = useState('')
    const navigate = useNavigate()
    const { user } = useAuthStore()

    const handleSearch = (e) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            navigate(`/search?q=${searchQuery}`)
            setSearchQuery('')
        }
    }

    return (
        <nav className="sticky top-0 z-50 bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700">
            <div className="px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                    {/* Menu button (mobile) */}
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex-1 max-w-2xl">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full input pr-12 text-gray-700 dark:text-gray-200"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <Search className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </form>

                    {/* User section */}
                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link
                                to="/profile"
                                className="flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-dark-700 rounded-lg transition-colors"
                            >
                                <img
                                    src={user.img || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                                <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {user.name}
                                </span>
                            </Link>
                        ) : (
                            <Link to="/signin" className="btn-outline flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span className="hidden sm:inline text-gray-700 dark:text-gray-200">Sign In</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}