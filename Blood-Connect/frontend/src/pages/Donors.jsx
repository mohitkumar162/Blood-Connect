import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { donorApi } from '../services/api'
import { useGeolocation } from '../hooks/useGeolocation'
import { MapPin, Phone, Droplets, Search, Filter } from 'lucide-react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export default function Donors() {
  const { location } = useGeolocation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { token } = useAuthStore()

  const queryGroup = searchParams.get('bloodGroup') || ''
  const queryCity = searchParams.get('city') || ''

  const [filters, setFilters] = useState({ 
    bloodGroup: queryGroup, 
    radius: 10, 
    city: queryCity 
  })
  
  const [search, setSearch] = useState({
    bloodGroup: queryGroup,
    radius: 10,
    city: queryCity
  })

  const { data: donors, isLoading } = useQuery({
    queryKey: ['donors', search],
    queryFn: () => donorApi.getAll({
      ...search,
      lat: location?.lat,
      lng: location?.lng
    }).then(r => r.data)
  })

  const handleSearch = () => setSearch({ ...filters })
  const set = (k) => (e) => setFilters(f => ({ ...f, [k]: e.target.value }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Find Donors</h1>
        <p className="text-gray-500 mt-1">Search verified blood donors in your area</p>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
            <select className="input" value={filters.bloodGroup} onChange={set('bloodGroup')}>
              {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g || 'All Groups'}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            <input className="input" placeholder="e.g. Ludhiana" value={filters.city} onChange={set('city')} />
          </div>
          <div className="w-36">
            <label className="block text-sm font-medium text-gray-700 mb-1">Radius (km)</label>
            <select className="input" value={filters.radius} onChange={set('radius')}>
              {[5, 10, 25, 50, 100].map(r => <option key={r} value={r}>{r} km</option>)}
            </select>
          </div>
          <button onClick={handleSearch} className="btn-primary flex items-center gap-2">
            <Search size={16} /> Search
          </button>
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">{donors?.length || 0} donors found</p>
          <div className="grid grid-cols-3 gap-4">
            {donors?.map(donor => (
              <div key={donor.id} className="card hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 bg-blood-100 rounded-xl flex items-center justify-center">
                    <span className="text-blood-700 font-bold text-sm">{donor.bloodGroup}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{donor.name}</h3>
                    <div className="flex items-center gap-1 text-gray-500 text-xs mt-0.5">
                      <MapPin size={11} />
                      <span>{donor.city}{donor.distance ? ` · ${donor.distance.toFixed(1)} km` : ''}</span>
                    </div>
                  </div>
                  <span className={donor.available ? 'badge-available' : 'badge-unavailable'}>
                    <span className={`w-1.5 h-1.5 rounded-full ${donor.available ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {donor.available ? 'Available' : 'Busy'}
                  </span>
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Droplets size={13} className="text-blood-500" />
                    <span>Blood group: <span className="font-semibold text-blood-700">{donor.bloodGroup}</span></span>
                  </div>
                  {donor.lastDonationDate && (
                    <div className="text-xs text-gray-400">
                      Last donated: {new Date(donor.lastDonationDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
                {donor.available && (
                  token ? (
                    <a href={`tel:${donor.phone}`}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blood-50 text-blood-700 hover:bg-blood-100 text-sm font-medium transition-colors">
                      <Phone size={14} /> Call Donor
                    </a>
                  ) : (
                    <button onClick={() => navigate('/login')}
                      className="mt-4 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-blood-600 text-white hover:bg-blood-700 text-sm font-medium transition-colors">
                      <Phone size={14} /> Login to Contact
                    </button>
                  )
                )}
              </div>
            ))}
          </div>
          {donors?.length === 0 && (
            <div className="text-center py-16 text-gray-400">
              <Droplets size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium">No donors found</p>
              <p className="text-sm mt-1">Try expanding the search radius or changing the blood group</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
