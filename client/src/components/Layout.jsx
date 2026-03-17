import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(true)

    return (
        <div className="flex h-screen overflow-hidden bg-light-100 dark:bg-dark-900">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

                <main className="flex-1 overflow-y-auto">
                    <div className="container mx-auto px-4 py-6 max-w-[2000px]">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    )
}