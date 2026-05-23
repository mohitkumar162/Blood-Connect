import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { donorApi } from '../services/api'
import toast from 'react-hot-toast'
import { Droplets, Award, Calendar } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Profile() {
  const { user, updateUser } = useAuthStore()
  const qc = useQueryClient()
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', city: user?.city || '', bloodGroup: user?.bloodGroup || '' })
  const [editing, setEditing] = useState(false)

  const { data: history } = useQuery({
    queryKey: ['donation-history'],
    queryFn: () => donorApi.getDonationHistory().then(r => r.data)
  })

  const updateMutation = useMutation({
    mutationFn: (data) => donorApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data)
      qc.invalidateQueries(['donation-history'])
      setEditing(false)
      toast.success('Profile updated!')
    },
    onError: () => toast.error('Update failed')
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const nextEligibleDate = () => {
    if (!history?.length) return null
    const last = new Date(history[0].donatedAt)
    last.setDate(last.getDate() + 90)
    return last
  }

  const eligible = nextEligibleDate()
  const isEligible = !eligible || eligible <= new Date()

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>

      {/* Donor status card */}
      {user?.role === 'DONOR' && (
        <div className={`card border-2 ${isEligible ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isEligible ? 'bg-green-100' : 'bg-orange-100'}`}>
              <Droplets size={22} className={isEligible ? 'text-green-700' : 'text-orange-700'} />
            </div>
            <div>
              <p className={`font-semibold ${isEligible ? 'text-green-800' : 'text-orange-800'}`}>
                {isEligible ? 'Eligible to Donate' : 'Not Yet Eligible'}
              </p>
              <p className={`text-sm ${isEligible ? 'text-green-600' : 'text-orange-600'}`}>
                {isEligible
                  ? `You can donate blood today. You have donated ${history?.length || 0} times.`
                  : `Next eligible: ${eligible?.toLocaleDateString()}`}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-2xl font-bold text-gray-900">{history?.length || 0}</p>
              <p className="text-xs text-gray-500">Total donations</p>
            </div>
          </div>
        </div>
      )}

      {/* Profile form */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-gray-900">Personal Information</h2>
          <button onClick={() => setEditing(!editing)} className="btn-secondary text-sm px-3 py-1.5">
            {editing ? 'Cancel' : 'Edit'}
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Full Name</label>
              {editing ? <input className="input" value={form.name} onChange={set('name')} />
                : <p className="text-sm text-gray-900 font-medium">{user?.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
              {editing ? <input className="input" value={form.phone} onChange={set('phone')} />
                : <p className="text-sm text-gray-900">{user?.phone}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
              <p className="text-sm text-gray-900">{user?.email}</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">City</label>
              {editing ? <input className="input" value={form.city} onChange={set('city')} />
                : <p className="text-sm text-gray-900">{user?.city}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Blood Group</label>
              {editing
                ? <select className="input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
                : <span className="inline-block bg-blood-100 text-blood-800 font-bold text-sm px-3 py-1 rounded-lg">{user?.bloodGroup}</span>}
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Role</label>
              <p className="text-sm text-gray-900 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>

          {editing && (
            <button onClick={() => updateMutation.mutate(form)}
              disabled={updateMutation.isPending}
              className="btn-primary w-full py-2.5 mt-2">
              {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>
      </div>

      {/* Donation history */}
      {user?.role === 'DONOR' && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Donation History</h2>
          {history?.length === 0 ? (
            <div className="text-center py-8">
              <Award size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No donations yet. Accept a request to start!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history?.map(d => (
                <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blood-100 rounded-lg flex items-center justify-center">
                    <Droplets size={14} className="text-blood-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{d.patientName} · {d.bloodGroup}</p>
                    <p className="text-xs text-gray-500">{d.hospital}, {d.city}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Calendar size={11} />
                    {formatDistanceToNow(new Date(d.donatedAt), { addSuffix: true })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
