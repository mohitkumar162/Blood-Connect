import { useState, useEffect } from 'react'

export function useGeolocation() {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported')
      setLoading(false)
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
        setLoading(false)
      },
      async (err) => {
        // Fallback to IP-based geolocation if GPS fails, times out or is blocked
        try {
          const res = await fetch('https://ipapi.co/json/')
          const data = await res.json()
          if (data.latitude && data.longitude) {
            setLocation({ lat: data.latitude, lng: data.longitude })
          } else {
            // Try secondary IP fallback
            const res2 = await fetch('https://ipwho.is/')
            const data2 = await res2.json()
            if (data2.success && data2.latitude && data2.longitude) {
              setLocation({ lat: data2.latitude, lng: data2.longitude })
            } else {
              setError(err.message)
            }
          }
        } catch (e) {
          try {
            const res2 = await fetch('https://ipwho.is/')
            const data2 = await res2.json()
            if (data2.success && data2.latitude && data2.longitude) {
              setLocation({ lat: data2.latitude, lng: data2.longitude })
            } else {
              setError(err.message)
            }
          } catch (e2) {
            setError(err.message)
          }
        }
        setLoading(false)
      },
      { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity }
    )
  }, [])

  return { location, error, loading }
}
