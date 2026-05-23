import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { requestApi } from '../services/api'
import { useGeolocation } from '../hooks/useGeolocation'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function NewRequest() {
  const navigate = useNavigate()
  const { location } = useGeolocation()
  const [form, setForm] = useState({
    patientName: '', bloodGroup: '', units: 1,
    hospital: '', city: '', urgency: 'HIGH',
    requiredBy: '', notes: '',
    latitude: '', longitude: ''
  })

  const mutation = useMutation({
    mutationFn: (data) => requestApi.create(data),
    onSuccess: (res) => {
      toast.success('Blood request posted! Donors are being notified.')
      navigate(`/requests/${res.data.id}`)
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create request')
  })

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate({
      ...form,
      latitude: location?.lat,
      longitude: location?.lng,
      units: Number(form.units)
    })
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create Blood Request</h1>
        <p className="text-gray-500 mt-1">Fill in the details — we'll notify matching donors instantly</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100 mb-6">
          <AlertCircle size={18} className="text-red-600 flex-shrink-0" />
          <p className="text-sm text-red-700">For emergencies, please also contact your local hospital blood bank directly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name *</label>
              <input required className="input" value={form.patientName} onChange={set('patientName')} placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group Required *</label>
              <select required className="input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                <option value="">Select group</option>
                {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Units Required *</label>
              <input type="number" required min={1} max={10} className="input" value={form.units} onChange={set('units')} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgency *</label>
              <select required className="input" value={form.urgency} onChange={set('urgency')}>
                <option value="HIGH">🔴 High — Emergency</option>
                <option value="MEDIUM">🟡 Medium — Within 24 hrs</option>
                <option value="LOW">🟢 Low — Scheduled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hospital Name *</label>
              <input required className="input" value={form.hospital} onChange={set('hospital')} placeholder="e.g. Civil Hospital" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
              <input required className="input" value={form.city} onChange={set('city')} placeholder="e.g. Ludhiana" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Required By</label>
            <input type="datetime-local" className="input" value={form.requiredBy} onChange={set('requiredBy')} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea rows={3} className="input resize-none" value={form.notes}
              onChange={set('notes')} placeholder="Any special requirements, contact info, ward number etc." />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => navigate(-1)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1 py-2.5">
              {mutation.isPending ? 'Posting...' : '🩸 Post Blood Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
