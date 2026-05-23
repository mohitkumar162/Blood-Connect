import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { adminApi } from '../services/api'
import toast from 'react-hot-toast'
import { Users, FileHeart, CheckCircle, TrendingUp } from 'lucide-react'

export default function AdminPanel() {
  const qc = useQueryClient()
  const { data: stats } = useQuery({ queryKey: ['admin-stats'], queryFn: () => adminApi.getDashboard().then(r => r.data) })
  const { data: users, isLoading } = useQuery({ queryKey: ['admin-users'], queryFn: () => adminApi.getUsers().then(r => r.data) })

  const verifyMutation = useMutation({
    mutationFn: (id) => adminApi.verifyDonor(id),
    onSuccess: () => { qc.invalidateQueries(['admin-users']); toast.success('Donor verified!') }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-500 mt-1">Manage donors, requests and platform health</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50' },
          { label: 'Active Donors', value: stats?.activeDonors || 0, icon: CheckCircle, color: 'text-green-600 bg-green-50' },
          { label: 'Total Requests', value: stats?.totalRequests || 0, icon: FileHeart, color: 'text-blood-600 bg-blood-50' },
          { label: 'Lives Saved', value: stats?.fulfilled || 0, icon: TrendingUp, color: 'text-purple-600 bg-purple-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}><Icon size={18} /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* User management */}
      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">User Management</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {['Name', 'Email', 'Role', 'Blood Group', 'City', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 pb-3 pr-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading
                ? Array(5).fill(0).map((_, i) => (
                  <tr key={i}><td colSpan={7} className="py-3"><div className="h-4 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
                : users?.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-4 font-medium text-gray-900">{u.name}</td>
                    <td className="py-3 pr-4 text-gray-500">{u.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === 'DONOR' ? 'bg-blood-100 text-blood-700' : u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="font-bold text-blood-700">{u.bloodGroup}</span>
                    </td>
                    <td className="py-3 pr-4 text-gray-500">{u.city}</td>
                    <td className="py-3 pr-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {u.verified ? 'Verified' : 'Pending'}
                      </span>
                    </td>
                    <td className="py-3">
                      {!u.verified && u.role === 'DONOR' && (
                        <button onClick={() => verifyMutation.mutate(u.id)}
                          disabled={verifyMutation.isPending}
                          className="text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors">
                          Verify
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
