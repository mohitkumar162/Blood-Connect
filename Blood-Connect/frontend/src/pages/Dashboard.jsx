import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '../store/authStore'
import { donorApi, requestApi } from '../services/api'
import { useNavigate } from 'react-router-dom'
import { useWebSocket } from '../hooks/useWebSocket'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { Droplets, MapPin, Clock, CheckCircle, XCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const URGENCY_COLOR = { HIGH: 'badge-urgent', MEDIUM: 'bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full', LOW: 'bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full' }
const STATUS_ICON = { PENDING: AlertCircle, ACCEPTED: CheckCircle, CLOSED: XCircle }

export default function Dashboard() {
  const { user, updateUser } = useAuthStore()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [liveRequests, setLiveRequests] = useState([])

  useWebSocket([
    {
      topic: '/topic/requests',
      callback: (req) => {
        setLiveRequests(prev => [req, ...prev].slice(0, 5))
        if (req.bloodGroup === user?.bloodGroup) toast.success(`New ${req.bloodGroup} blood needed at ${req.hospital}!`)
      }
    }
  ])

  const { data: activeRequests } = useQuery({ queryKey: ['active-requests'], queryFn: () => requestApi.getActive().then(r => r.data) })
  const { data: myRequests } = useQuery({ queryKey: ['my-requests'], queryFn: () => requestApi.getMyRequests().then(r => r.data) })
  const { data: history } = useQuery({ queryKey: ['donation-history'], queryFn: () => donorApi.getDonationHistory().then(r => r.data) })

  const toggleMutation = useMutation({
    mutationFn: () => donorApi.toggleAvailability(),
    onSuccess: (res) => {
      updateUser({ ...user, available: res.data.available })
      qc.invalidateQueries(['active-requests'])
      toast.success(res.data.available ? 'You are now available for donations' : 'You are now unavailable')
    }
  })

  const isDonor = user?.role === 'DONOR'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hello, {user?.name?.split(' ')[0]} 👋</h1>
          <p className="text-gray-500 mt-1">{user?.city} · {user?.bloodGroup} · {user?.role}</p>
        </div>
        {isDonor && (
          <button onClick={() => toggleMutation.mutate()}
            disabled={toggleMutation.isPending}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user?.available ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
            {user?.available ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            {user?.available ? 'Available' : 'Unavailable'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
  {(isDonor ? [
    { label: 'Total Donations', value: history?.length || 0, icon: Droplets, color: 'text-blood-600 bg-blood-50' },
    { label: 'Active Requests', value: activeRequests?.length || 0, icon: AlertCircle, color: 'text-orange-600 bg-orange-50' },
    { label: 'Status', value: user?.available ? 'Available' : 'Off', icon: CheckCircle, color: user?.available ? 'text-green-600 bg-green-50' : 'text-gray-500 bg-gray-100' },
    { label: 'Blood Group', value: user?.bloodGroup, icon: Droplets, color: 'text-blood-600 bg-blood-50' },
  ] : [
    { label: 'My Requests', value: myRequests?.length || 0, icon: AlertCircle, color: 'text-blood-600 bg-blood-50' },
    { label: 'Active Requests', value: activeRequests?.length || 0, icon: Clock, color: 'text-orange-600 bg-orange-50' },
    { label: 'Blood Group', value: user?.bloodGroup, icon: Droplets, color: 'text-blood-600 bg-blood-50' },
    { label: 'City', value: user?.city, icon: MapPin, color: 'text-blue-600 bg-blue-50' },
  ]).map(({ label, value, icon: Icon, color }) => (
    <div key={label} className="card flex items-center gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500">{label}</p>
      </div>
    </div>
  ))}
</div>

      <div className="grid grid-cols-2 gap-6">
        {/* Live requests feed */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Live Blood Requests</h2>
            <span className="flex items-center gap-1 text-xs text-green-600">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Live
            </span>
          </div>
          <div className="space-y-3">
            {[...(liveRequests), ...(activeRequests || [])].slice(0, 6).map((req) => (
              <div key={req.id} onClick={() => navigate(`/requests/${req.id}`)}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors border border-gray-100">
                <div className="w-10 h-10 bg-blood-100 rounded-lg flex items-center justify-center font-bold text-blood-700 text-sm">
                  {req.bloodGroup}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{req.hospital}</p>
                  <p className="text-xs text-gray-500 truncate">{req.city} · {req.patientName}</p>
                </div>
                <div className="text-right">
                  <span className={URGENCY_COLOR[req.urgency]}>{req.urgency}</span>
                  <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                </div>
              </div>
            ))}
            {(!activeRequests?.length && !liveRequests.length) && (
              <p className="text-sm text-gray-400 text-center py-6">No active requests right now</p>
            )}
          </div>
        </div>

        {/* Quick actions */}
        <div className="space-y-4">
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <button onClick={() => navigate('/requests/new')}
                className="w-full flex items-center gap-3 p-3 bg-blood-50 hover:bg-blood-100 rounded-lg text-left transition-colors">
                <div className="w-8 h-8 bg-blood-600 rounded-lg flex items-center justify-center">
                  <AlertCircle size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blood-800">Create Blood Request</p>
                  <p className="text-xs text-blood-600">Post an urgent need</p>
                </div>
              </button>
              <button onClick={() => navigate('/map')}
                className="w-full flex items-center gap-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <MapPin size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-800">View Live Map</p>
                  <p className="text-xs text-blue-600">See donors near you</p>
                </div>
              </button>
              <button onClick={() => navigate('/donors')}
                className="w-full flex items-center gap-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
                <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                  <Droplets size={16} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-800">Browse Donors</p>
                  <p className="text-xs text-green-600">Filter by blood group & city</p>
                </div>
              </button>
            </div>
          </div>

          {myRequests?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 mb-3">My Recent Requests</h2>
              {myRequests.slice(0, 3).map(req => {
                const Icon = STATUS_ICON[req.status] || AlertCircle
                return (
                  <div key={req.id} onClick={() => navigate(`/requests/${req.id}`)}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <Icon size={16} className={req.status === 'ACCEPTED' ? 'text-green-500' : req.status === 'CLOSED' ? 'text-gray-400' : 'text-orange-500'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">{req.bloodGroup} · {req.hospital}</p>
                      <p className="text-xs text-gray-500">{req.status}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
