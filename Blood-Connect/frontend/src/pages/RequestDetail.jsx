import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { requestApi } from '../services/api'
import { useWebSocket } from '../hooks/useWebSocket'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import { CheckCircle, XCircle, Clock, MapPin, Phone, Droplets, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

const URGENCY_COLORS = { HIGH: 'bg-red-100 text-red-800', MEDIUM: 'bg-yellow-100 text-yellow-800', LOW: 'bg-green-100 text-green-800' }
const STATUS_COLORS = { PENDING: 'bg-orange-100 text-orange-800', ACCEPTED: 'bg-green-100 text-green-800', CLOSED: 'bg-gray-100 text-gray-600', FULFILLED: 'bg-blue-100 text-blue-800' }

export default function RequestDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, token } = useAuthStore()
  const qc = useQueryClient()

  const { data: request, isLoading } = useQuery({
    queryKey: ['request', id],
    queryFn: () => requestApi.getById(id).then(r => r.data),
    refetchInterval: 10000,
  })

  useWebSocket([{
    topic: `/topic/requests/${id}`,
    callback: (update) => {
      qc.setQueryData(['request', id], (old) => ({ ...old, ...update }))
      toast.success('Request status updated!')
    }
  }])

  const respondMutation = useMutation({
    mutationFn: (action) => requestApi.respond(id, { action }),
    onSuccess: () => { qc.invalidateQueries(['request', id]); toast.success('Response sent!') },
    onError: () => toast.error('Failed to respond')
  })

  const closeMutation = useMutation({
    mutationFn: () => requestApi.close(id),
    onSuccess: () => { qc.invalidateQueries(['request', id]); toast.success('Request closed') }
  })

  if (isLoading) return (
    <div className="max-w-2xl space-y-4">
      {Array(3).fill(0).map((_, i) => <div key={i} className="card animate-pulse h-24" />)}
    </div>
  )

  if (!request) return <div className="card text-center py-16 text-gray-500">Request not found</div>

  const isDonor = user?.role === 'DONOR'
  const isOwner = request.requesterId === user?.id
  const canRespond = isDonor && request.status === 'PENDING' && request.bloodGroup === user?.bloodGroup

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Blood Request #{id}</h1>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${URGENCY_COLORS[request.urgency]}`}>{request.urgency}</span>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[request.status]}`}>{request.status}</span>
          <span className="flex items-center gap-1 text-xs text-green-600">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>

      {/* Request Info */}
      <div className="card space-y-4">
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 bg-blood-100 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-blood-700">{request.bloodGroup}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{request.patientName}</h2>
            <p className="text-sm text-gray-500">{request.units} unit{request.units > 1 ? 's' : ''} of {request.bloodGroup} required</p>
            <p className="text-xs text-gray-400 mt-1">Posted {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <InfoRow icon={MapPin} label="Hospital" value={request.hospital} />
          <InfoRow icon={MapPin} label="City" value={request.city} />
          <InfoRow icon={Droplets} label="Blood Group" value={request.bloodGroup} />
          <InfoRow icon={User} label="Contact" value={request.requesterPhone || 'Available on acceptance'} />
          {request.requiredBy && <InfoRow icon={Clock} label="Required By" value={new Date(request.requiredBy).toLocaleString()} />}
        </div>

        {request.notes && (
          <div className="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p className="font-medium text-gray-700 mb-1">Notes</p>
            <p>{request.notes}</p>
          </div>
        )}
      </div>

      {/* Donor responses */}
      {request.responses?.length > 0 && (
        <div className="card">
          <h3 className="font-semibold text-gray-900 mb-3">Donor Responses ({request.responses.length})</h3>
          <div className="space-y-3">
            {request.responses.map(resp => (
              <div key={resp.id} className={`flex items-center gap-3 p-3 rounded-lg border ${resp.status === 'ACCEPTED' ? 'border-green-200 bg-green-50' : 'border-gray-100'}`}>
                <div className="w-8 h-8 bg-blood-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-blood-700">{resp.donorName?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{resp.donorName}</p>
                  <p className="text-xs text-gray-500">{resp.donorBloodGroup} · {resp.donorCity}</p>
                </div>
                <div className="flex items-center gap-2">
                  {resp.status === 'ACCEPTED'
                    ? <CheckCircle size={16} className="text-green-600" />
                    : <XCircle size={16} className="text-gray-400" />}
                  <span className={`text-xs font-medium ${resp.status === 'ACCEPTED' ? 'text-green-700' : 'text-gray-500'}`}>{resp.status}</span>
                </div>
                {resp.status === 'ACCEPTED' && isOwner && (
                  <a href={`tel:${resp.donorPhone}`}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blood-600 text-white rounded-lg text-xs font-medium hover:bg-blood-700">
                    <Phone size={12} /> Call
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {canRespond && (
          <>
            <button onClick={() => respondMutation.mutate('ACCEPT')}
              disabled={respondMutation.isPending}
              className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
              <CheckCircle size={16} /> Accept & Donate
            </button>
            <button onClick={() => respondMutation.mutate('DECLINE')}
              disabled={respondMutation.isPending}
              className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3">
              <XCircle size={16} /> Decline
            </button>
          </>
        )}
        {isOwner && request.status === 'PENDING' && (
          <button onClick={() => closeMutation.mutate()}
            disabled={closeMutation.isPending}
            className="btn-secondary flex items-center gap-2 px-6">
            Close Request
          </button>
        )}
      </div>

      {!token && request.status === 'PENDING' && (
        <div className="card bg-blood-50 border border-blood-200 p-5 flex flex-col items-center text-center rounded-2xl mt-4">
          <Droplets size={28} className="text-blood-600 mb-2 animate-bounce" />
          <p className="text-sm font-semibold text-blood-900 mb-1">
            Want to help this patient?
          </p>
          <p className="text-xs text-blood-700/80 mb-4 max-w-md">
            Only registered blood donors can accept requests. Sign in or create a free account to contact the patient's family and donate!
          </p>
          <div className="flex gap-3">
            <button onClick={() => navigate('/login')} className="btn-primary text-xs px-5 py-2">
              Sign In to Donate
            </button>
            <button onClick={() => navigate('/register')} className="btn-secondary text-xs px-5 py-2 bg-white">
              Register as Donor
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={14} className="text-gray-400 mt-0.5 flex-shrink-0" />
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm text-gray-900">{value}</p>
      </div>
    </div>
  )
}
