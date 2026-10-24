import { Outlet, Link } from 'react-router-dom'

export default function Layout() {
    return (
        <div className="min-h-screen bg-stone-50 text-stone-900">
            <header className="border-b border-stone-200 bg-white">
                <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
                    <span className="text-lg font-semibold tracking-tight">Stray Dog Platform</span>
                    <nav className="flex items-center gap-4 text-sm font-medium text-stone-600">
                        <Link to="/report" className="hover:text-amber-600">Report</Link>
                        <Link to="/map" className="hover:text-amber-600">Map</Link>
                    </nav>
                </div>
            </header>
            <main className="mx-auto max-w-3xl px-4 py-6">
                <Outlet />
            </main>
        </div>
    )
}