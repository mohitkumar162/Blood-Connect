import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Droplets, MapPin, Bell, Shield, Clock, Heart, CheckCircle2, ChevronRight } from 'lucide-react'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

const COMPATIBILITY = {
  'O-': {
    give: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receive: ['O-']
  },
  'O+': {
    give: ['O+', 'A+', 'B+', 'AB+'],
    receive: ['O-', 'O+']
  },
  'A-': {
    give: ['A-', 'A+', 'AB-', 'AB+'],
    receive: ['O-', 'A-']
  },
  'A+': {
    give: ['A+', 'AB+'],
    receive: ['O-', 'O+', 'A-', 'A+']
  },
  'B-': {
    give: ['B-', 'B+', 'AB-', 'AB+'],
    receive: ['O-', 'B-']
  },
  'B+': {
    give: ['B+', 'AB+'],
    receive: ['O-', 'O+', 'B-', 'B+']
  },
  'AB-': {
    give: ['AB-', 'AB+'],
    receive: ['O-', 'A-', 'B-', 'AB-']
  },
  'AB+': {
    give: ['AB+'],
    receive: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
  }
}

function BloodCompatibilityChart() {
  const [activeGroup, setActiveGroup] = useState('O-')

  return (
    <div className="card border-blood-100 shadow-md bg-gradient-to-br from-white to-red-50/10 p-6 rounded-2xl relative overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blood-500/5 rounded-full blur-2xl pointer-events-none" />
      
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blood-100 rounded-lg flex items-center justify-center">
          <Droplets size={16} className="text-blood-600 animate-pulse" />
        </div>
        <h3 className="font-bold text-gray-900 text-base">Blood Compatibility Chart</h3>
      </div>
      
      <p className="text-xs text-gray-500 mb-5 leading-relaxed">
        Click a blood group to see donor and recipient compatibility details instantly.
      </p>

      {/* Grid of blood types */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {BLOOD_GROUPS.map((group) => {
          const isActive = activeGroup === group
          return (
            <button
              key={group}
              onClick={() => setActiveGroup(group)}
              className={`h-11 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center border ${
                isActive
                  ? 'bg-blood-600 text-white border-blood-600 shadow-md shadow-blood-100 scale-105'
                  : 'bg-white text-gray-700 border-gray-150 hover:border-blood-200 hover:bg-blood-50/10'
              }`}
            >
              {group}
            </button>
          )
        })}
      </div>

      {/* Details Container */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-green-700 mb-2">
            <CheckCircle2 size={13} className="text-green-500" />
            <span>Can Receive From ({COMPATIBILITY[activeGroup].receive.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMPATIBILITY[activeGroup].receive.map(group => (
              <span key={group} className="bg-green-50 text-green-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-green-100">
                {group}
              </span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-blood-700 mb-2">
            <Droplets size={13} className="text-blood-500" />
            <span>Can Donate To ({COMPATIBILITY[activeGroup].give.length})</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {COMPATIBILITY[activeGroup].give.map(group => (
              <span key={group} className="bg-blood-50 text-blood-700 font-bold text-xs px-2.5 py-1 rounded-lg border border-blood-100 animate-fade-in">
                {group}
              </span>
            ))}
          </div>
        </div>
      </div>
      
      {activeGroup === 'O-' && (
        <div className="mt-4 p-2.5 bg-blood-50/50 rounded-xl border border-blood-100/50 text-[11px] text-blood-800 leading-tight">
          💡 <strong>Universal Donor:</strong> O- blood can be given to patients of any blood group in emergencies!
        </div>
      )}
      {activeGroup === 'AB+' && (
        <div className="mt-4 p-2.5 bg-green-50/50 rounded-xl border border-green-100/50 text-[11px] text-green-800 leading-tight">
          💡 <strong>Universal Recipient:</strong> AB+ individuals can safely receive red blood cells from any blood type!
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const [searchGroup, setSearchGroup] = useState('')
  const [searchCity, setSearchCity] = useState('')

  const handleFindDonors = () => {
    navigate(`/donors?bloodGroup=${encodeURIComponent(searchGroup)}&city=${encodeURIComponent(searchCity)}`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-blood-600 rounded-xl flex items-center justify-center">
            <Droplets size={18} className="text-white" />
          </div>
          <span className="font-bold text-xl text-gray-900">BloodConnect</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="btn-secondary text-sm">Sign in</button>
          <button onClick={() => navigate('/register')} className="btn-primary text-sm">Register</button>
        </div>
      </nav>

      {/* Hero with Two-Column Layout */}
      <section className="px-8 py-16 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Interactive Blood Compatibility Chart */}
          <div className="lg:col-span-5 order-2 lg:order-1 animate-fade-in">
            <BloodCompatibilityChart />
          </div>

          {/* Right Column - Hero Headline & Actions */}
          <div className="lg:col-span-7 order-1 lg:order-2 space-y-8 text-left">
            <div>
              <div className="inline-flex items-center gap-2 bg-blood-50 text-blood-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
                <Heart size={14} fill="currentColor" className="animate-pulse text-blood-600" />
                Real-time Blood Donor Finder
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
                Find Blood Donors<br />
                <span className="text-blood-600">Near You in Minutes</span>
              </h1>
              <p className="text-lg text-gray-500">
                Connect with verified blood donors instantly. Every second counts in an emergency.
                BloodConnect matches you with the right donor, right now.
              </p>
            </div>
            
            <div className="flex gap-4">
              <button onClick={() => navigate('/register')} className="btn-primary px-8 py-3 text-base flex items-center gap-2">
                Register as Donor <ChevronRight size={16} />
              </button>
              <button onClick={() => navigate('/requests')} className="btn-secondary px-8 py-3 text-base">
                Request Blood
              </button>
            </div>

            {/* Quick search inside Hero */}
            <div className="card bg-white border border-gray-150 p-5 rounded-2xl shadow-sm">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm">Quick Donor Search</h3>
              <div className="flex flex-col sm:flex-row gap-3">
                <select 
                  className="input flex-1"
                  value={searchGroup}
                  onChange={(e) => setSearchGroup(e.target.value)}
                >
                  <option value="">Select Blood Group</option>
                  {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
                <input 
                  className="input flex-1" 
                  placeholder="Enter City or Area" 
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                />
                <button 
                  onClick={handleFindDonors} 
                  className="btn-primary whitespace-nowrap px-6"
                >
                  Find Donors
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-8 py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why BloodConnect?</h2>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: MapPin, title: 'Geo-location Matching', desc: 'Find donors within your radius using live GPS location matching.' },
              { icon: Bell, title: 'Instant Notifications', desc: 'Donors are notified instantly via push, SMS and email when you post a request.' },
              { icon: Clock, title: 'Real-time Status', desc: 'Track your blood request live — see who accepted and their ETA.' },
              { icon: Shield, title: 'Verified Donors', desc: 'All donors are verified by admins for authenticity and eligibility.' },
              { icon: Droplets, title: 'All Blood Groups', desc: 'Find donors for any blood type including rare groups like AB- and O-.' },
              { icon: Heart, title: 'Save a Life Today', desc: 'Join thousands of donors who have already saved lives across the country.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card">
                <div className="w-10 h-10 bg-blood-100 rounded-lg flex items-center justify-center mb-4">
                  <Icon size={20} className="text-blood-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-8 py-16">
        <div className="max-w-4xl mx-auto grid grid-cols-4 gap-8 text-center">
          {[['10,000+', 'Registered Donors'], ['5,000+', 'Lives Saved'], ['50+', 'Cities Covered'], ['< 5 min', 'Avg Response Time']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold text-blood-600 mb-1">{val}</div>
              <div className="text-sm text-gray-500">{label}</div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-8 py-8 text-center text-sm text-gray-400">
        © 2025 BloodConnect. Built with React + Spring Boot.
      </footer>
    </div>
  )
}
