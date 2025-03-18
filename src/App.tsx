import { Link, Outlet } from '@tanstack/react-router'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-blue-600">HSR Relic Manager</h1>
            <nav className="flex space-x-4">
              <Link
                to="/"
                activeProps={{ className: 'text-blue-600 font-medium' }}
                inactiveProps={{ className: 'text-gray-600 hover:text-blue-500' }}
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/characters"
                activeProps={{ className: 'text-blue-600 font-medium' }}
                inactiveProps={{ className: 'text-gray-600 hover:text-blue-500' }}
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Characters
              </Link>
              <Link
                to="/relics"
                activeProps={{ className: 'text-blue-600 font-medium' }}
                inactiveProps={{ className: 'text-gray-600 hover:text-blue-500' }}
                className="px-3 py-2 rounded-md text-sm font-medium"
              >
                Relics
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="py-6">
        <Outlet />
      </main>
    </div>
  )
}

export default App
