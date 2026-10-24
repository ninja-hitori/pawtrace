import { Outlet } from 'react-router-dom'

export default function Layout() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <span className="text-lg font-semibold">Stray Dog Reporting</span>
          <span className="text-sm text-stone-500">Resident report</span>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
