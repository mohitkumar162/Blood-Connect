import { useState, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { donorApi, requestApi } from '../services/api'
import { useGeolocation } from '../hooks/useGeolocation'
import { MapPin, Droplets, RefreshCw } from 'lucide-react'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

export default function DonorMap() {
  const { location, loading: geoLoading } = useGeolocation()
  const [bloodGroup, setBloodGroup] = useState('')
  const [selected, setSelected] = useState(null)
  const [radius, setRadius] = useState(10)

  const { data: donors, isLoading, refetch } = useQuery({
    queryKey: ['nearby-donors', location, bloodGroup, radius],
    queryFn: () => donorApi.getNearby({
      lat: location?.lat,
      lng: location?.lng,
      radius,
      bloodGroup: bloodGroup || undefined,
    }).then(r => r.data),
    enabled: !!location,
  })

  const mapSrc = location
    ? `https://www.google.com/maps/embed/v1/search?key=${GOOGLE_MAPS_KEY}&q=blood+donors+near+${location.lat},${location.lng}&zoom=12`
    : null

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Live Donor Map</h1>
          <p className="text-gray-500 mt-1">Donors available near your location</p>
        </div>
        <button onClick={() => refetch()} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="card flex gap-4 items-end py-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Blood Group</label>
          <select className="input w-40" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
            {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g || 'All'}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Search Radius</label>
          <select className="input w-32" value={radius} onChange={e => setRadius(Number(e.target.value))}>
            {[5, 10, 20, 50].map(r => <option key={r} value={r}>{r} km</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2 text-sm text-green-600">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          {donors?.filter(d => d.available).length || 0} available now
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Map */}
        <div className="col-span-2">
          <div className="card p-0 overflow-hidden" style={{ height: 500 }}>
            {geoLoading ? (
              <div className="h-full flex items-center justify-center bg-gray-100">
                <p className="text-gray-500">Getting your location...</p>
              </div>
            ) : GOOGLE_MAPS_KEY && GOOGLE_MAPS_KEY !== 'YOUR_GOOGLE_MAPS_API_KEY' && mapSrc ? (
              <iframe src={mapSrc} width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen />
            ) : (
              <div className="h-full flex flex-col items-center justify-center bg-gray-50 p-8 text-center">
                <MapPin size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-600 font-medium mb-2">Google Maps Preview</p>
                <p className="text-gray-400 text-sm mb-4">
                  Add your <code className="bg-gray-100 px-1 rounded">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-gray-100 px-1 rounded">.env</code> to see the live map.
                </p>
                {location && (
                  <p className="text-xs text-gray-400">Your location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Donor list sidebar */}
        <div className="card overflow-auto" style={{ height: 500 }}>
          <h3 className="font-semibold text-gray-900 mb-3">
            Nearby Donors <span className="text-gray-400 font-normal text-sm">({donors?.length || 0})</span>
          </h3>
          {isLoading ? (
            <div className="space-y-3">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse p-3 rounded-lg border border-gray-100">
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-2 bg-gray-100 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : donors?.length === 0 ? (
            <div className="text-center py-8">
              <Droplets size={32} className="text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-400">No donors in this area</p>
            </div>
          ) : (
            <div className="space-y-2">
              {(donors || []).map(donor => (
                <div key={donor.id}
                  onClick={() => setSelected(selected?.id === donor.id ? null : donor)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${selected?.id === donor.id ? 'border-blood-300 bg-blood-50' : 'border-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blood-100 rounded-lg flex items-center justify-center">
                        <span className="text-xs font-bold text-blood-700">{donor.bloodGroup}</span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{donor.name}</p>
                        <p className="text-xs text-gray-500">{donor.distanceKm?.toFixed(1)} km</p>
                      </div>
                    </div>
                    <span className={`w-2 h-2 rounded-full ${donor.available ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </div>
                  {selected?.id === donor.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                      <p className="text-xs text-gray-600">📍 {donor.city}</p>
                      <p className="text-xs text-gray-600">🩸 {donor.totalDonations || 0} donations</p>
                      {donor.available && (
                        <a href={`tel:${donor.phone}`}
                          className="mt-2 flex items-center justify-center gap-1 w-full py-1.5 bg-blood-600 text-white rounded-lg text-xs font-medium hover:bg-blood-700 transition-colors">
                          📞 Call Donor
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
