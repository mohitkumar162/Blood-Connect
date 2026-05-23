import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  LayoutDashboard, Map, Users, FileHeart, PlusCircle,
  User, ShieldCheck, LogOut, Droplets
} from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/map', icon: Map, label: 'Live Map' },
  { to: '/donors', icon: Users, label: 'Donors' },
  { to: '/requests', icon: FileHeart, label: 'Requests' },
  { to: '/requests/new', icon: PlusCircle, label: 'New Request' },
  { to: '/profile', icon: User, label: 'My Profile' },
]

export default function Layout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    toast.success('Signed out successfully!')
    navigate('/')
  }

  const isItemActive = (itemTo) => {
    const path = location.pathname
    if (itemTo === '/requests') {
      return path.startsWith('/requests') && path !== '/requests/new'
    }
    return path === itemTo
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blood-600 rounded-lg flex items-center justify-center">
              <Droplets size={16} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">BloodConnect</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems
            .filter(item => user || ['/map', '/donors', '/requests'].includes(item.to))
            .map(({ to, icon: Icon, label }) => {
              const active = isItemActive(to)
              return (
                <NavLink key={to} to={to}
                  className={clsx(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    active
                      ? 'bg-blood-50 text-blood-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}>
                  <Icon size={18} />
                  {label}
                </NavLink>
              )
            })}
          {user?.role === 'ADMIN' && (
            <NavLink to="/admin"
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive ? 'bg-blood-50 text-blood-700' : 'text-gray-600 hover:bg-gray-50'
              )}>
              <ShieldCheck size={18} />
              Admin Panel
            </NavLink>
          )}
        </nav>

        <div className="p-4 border-t border-gray-100">
          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-8 h-8 bg-blood-100 rounded-full flex items-center justify-center">
                  <span className="text-blood-700 font-bold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user?.bloodGroup} • {user?.role}</p>
                </div>
              </div>
              <button onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                <LogOut size={16} />
                Sign out
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 rounded-xl border border-gray-100">
                <div className="w-8.5 h-8.5 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-gray-500 font-semibold text-xs">G</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800">Browsing as Guest</p>
                  <p className="text-[10px] text-gray-400">Sign in to save lives</p>
                </div>
              </div>
              <button onClick={() => navigate('/login')}
                className="w-full flex items-center justify-center gap-2 py-2 text-sm font-medium text-white bg-blood-600 hover:bg-blood-700 rounded-lg transition-colors shadow-sm shadow-blood-100">
                Sign In
              </button>
            </>
          )}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
