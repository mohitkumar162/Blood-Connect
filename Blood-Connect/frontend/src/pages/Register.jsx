import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { authApi } from '../services/api'
import toast from 'react-hot-toast'
import { Droplets } from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '',
    bloodGroup: '', role: 'DONOR', city: '', latitude: '', longitude: ''
  })
  const [coordsInput, setCoordsInput] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCoordsChange = (val) => {
    setCoordsInput(val)
    if (!val.trim()) {
      setForm(f => ({ ...f, latitude: '', longitude: '' }))
      return
    }
    const parts = val.split(',')
    if (parts.length === 2) {
      const lat = parseFloat(parts[0].trim())
      const lng = parseFloat(parts[1].trim())
      if (!isNaN(lat) && !isNaN(lng)) {
        setForm(f => ({ ...f, latitude: lat, longitude: lng }))
      } else {
        setForm(f => ({ ...f, latitude: '', longitude: '' }))
      }
    } else {
      setForm(f => ({ ...f, latitude: '', longitude: '' }))
    }
  }

  const detectLocation = (showFeedback = false) => {
    let toastId = null
    if (showFeedback) {
      toastId = toast.loading('Detecting location...')
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setForm(f => ({ ...f, latitude: lat, longitude: lng }))
        setCoordsInput(`${lat.toFixed(4)}, ${lng.toFixed(4)}`)
        if (showFeedback) {
          toast.success('GPS location captured!', { id: toastId })
        }
      },
      async () => {
        // Fallback 1: Try ipapi.co
        try {
          const res = await fetch('https://ipapi.co/json/')
          const data = await res.json()
          if (data.latitude && data.longitude) {
            setForm(f => ({
              ...f,
              latitude: data.latitude,
              longitude: data.longitude,
              city: f.city || data.city || ''
            }))
            setCoordsInput(`${parseFloat(data.latitude).toFixed(4)}, ${parseFloat(data.longitude).toFixed(4)}`)
            if (showFeedback) {
              toast.success('Approximate location captured via IP!', { id: toastId })
            }
            return
          }
        } catch (err) {
          // silent error, try next fallback
        }

        // Fallback 2: Try ipwho.is
        try {
          const res = await fetch('https://ipwho.is/')
          const data = await res.json()
          if (data.success && data.latitude && data.longitude) {
            setForm(f => ({
              ...f,
              latitude: data.latitude,
              longitude: data.longitude,
              city: f.city || data.city || ''
            }))
            setCoordsInput(`${parseFloat(data.latitude).toFixed(4)}, ${parseFloat(data.longitude).toFixed(4)}`)
            if (showFeedback) {
              toast.success('Approximate location captured via IP!', { id: toastId })
            }
            return
          }
        } catch (err) {
          // silent error
        }

        if (showFeedback) {
          toast.error('Could not detect location. Either fill manually or proceed without it.', { id: toastId })
        }
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
    )
  }

  useEffect(() => {
    // Silently capture location and pre-fill city on load
    detectLocation(false)
  }, [])

  const getLocation = () => detectLocation(true)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        latitude: form.latitude === '' || form.latitude === null || form.latitude === undefined ? null : parseFloat(form.latitude),
        longitude: form.longitude === '' || form.longitude === null || form.longitude === undefined ? null : parseFloat(form.longitude)
      }
      const { data } = await authApi.register(payload)
      setAuth(data.user, data.token)
      toast.success('Account created! Welcome to BloodConnect.')
      navigate('/dashboard')
    } catch (err) {
      const errorData = err.response?.data
      if (errorData?.errors) {
        const errorMessages = Object.entries(errorData.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ')
        toast.error(errorMessages || 'Registration failed')
      } else {
        toast.error(errorData?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blood-600 rounded-xl flex items-center justify-center">
              <Droplets size={20} className="text-white" />
            </div>
            <span className="font-bold text-xl">BloodConnect</span>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-gray-500 mt-2">Already registered? <Link to="/login" className="text-blood-600 hover:underline">Sign in</Link></p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required className="input" value={form.name} onChange={set('name')} placeholder="Arjun Singh" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input required className="input" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input type="email" className="input" value={form.email} onChange={set('email')} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input type="password" required minLength={8} className="input" value={form.password} onChange={set('password')} placeholder="Min 8 characters" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select required className="input" value={form.bloodGroup} onChange={set('bloodGroup')}>
                  <option value="">Select group</option>
                  {BLOOD_GROUPS.map(g => <option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input required className="input" value={form.city} onChange={set('city')} placeholder="Ludhiana" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Location (Coordinates)</label>
              <div className="flex gap-2">
                <input className="input flex-1" placeholder="e.g. 31.2212, 75.7678 (or leave blank)"
                  value={coordsInput}
                  onChange={(e) => handleCoordsChange(e.target.value)} />
                <button type="button" onClick={getLocation} className="btn-secondary whitespace-nowrap text-sm px-3">
                  📍 Detect
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
