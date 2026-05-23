import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { requestApi } from '../services/api'
import { useAuthStore } from '../store/authStore'
import { PlusCircle, Clock, Droplets } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const URGENCY_COLORS = { HIGH: 'badge-urgent', MEDIUM: 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full', LOW: 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full' }
const STATUS_COLORS = { PENDING: 'bg-orange-100 text-orange-700', ACCEPTED: 'bg-green-100 text-green-700', CLOSED: 'bg-gray-100 text-gray-500', FULFILLED: 'bg-blue-100 text-blue-700' }

export default function Requests() {
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const [tab, setTab] = useState('active')
  const [bloodGroup, setBloodGroup] = useState('')

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests', tab, bloodGroup],
    queryFn: () => {
      if (tab === 'mine') {
        return requestApi.getMyRequests().then(r => r.data)
      }
      return requestApi.getAll({
        status: tab === 'active' ? 'PENDING' : undefined,
        bloodGroup: bloodGroup || undefined,
      }).then(r => r.data)
    },
    refetchInterval: 15000,
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blood Requests</h1>
          <p className="text-gray-500 mt-1">Active and recent requests in your area</p>
        </div>
        {token ? (
          <button onClick={() => navigate('/requests/new')} className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> New Request
          </button>
        ) : (
          <button onClick={() => navigate('/login')} className="btn-primary flex items-center gap-2">
            <PlusCircle size={16} /> Login or Register to Request Blood
          </button>
        )}
      </div>

      {/* Tabs & Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {[
            ['active', 'Active'],
            ['all', 'All'],
            ...(token ? [['mine', 'My Requests']] : [])
          ].map(([val, label]) => (
            <button key={val} onClick={() => setTab(val)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === val ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {label}
            </button>
          ))}
        </div>
        {tab !== 'mine' && (
          <select className="input w-40 text-sm" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g || 'All Groups'}</option>)}
          </select>
        )}
      </div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array(4).fill(0).map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
        </div>
      ) : requests?.length === 0 ? (
        <div className="card text-center py-16">
          <Droplets size={40} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No requests found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => (
            <div key={req.id} onClick={() => navigate(`/requests/${req.id}`)}
              className="card hover:shadow-md transition-shadow cursor-pointer flex items-center gap-4">
              <div className="w-14 h-14 bg-blood-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="font-bold text-blood-700 text-lg">{req.bloodGroup}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{req.patientName}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[req.status]}`}>{req.status}</span>
                </div>
                <p className="text-sm text-gray-500 truncate">{req.hospital} · {req.city}</p>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Clock size={10} />
                  {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                  · {req.units} unit{req.units > 1 ? 's' : ''}
                  · {req.responses?.length || 0} response{(req.responses?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className={URGENCY_COLORS[req.urgency]}>{req.urgency}</span>
                {req.requiredBy && (
                  <p className="text-xs text-gray-400">By {new Date(req.requiredBy).toLocaleDateString()}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
