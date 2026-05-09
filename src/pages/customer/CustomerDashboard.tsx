import React from 'react';
import { Search, FileText, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_SERVICES = [
  { id: '1', name: 'Community Certificate', emoji: '👥', fee: 100, days: 5 },
  { id: '2', name: 'Income Certificate', emoji: '💰', fee: 150, days: 7 },
  { id: '3', name: 'Nativity Certificate', emoji: '🏠', fee: '100', days: 5 },
  { id: '4', name: 'First Graduate Certificate', emoji: '🎓', fee: 200, days: 10 },
];

export default function CustomerDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
          Service Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Available e-Sevai services for you</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applications', count: 5, icon: FileText, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Processing', count: 2, icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Approved', count: 3, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Rejected', count: 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-4 rounded-2xl flex items-center gap-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="glass p-2 rounded-xl flex items-center gap-3">
        <Search className="text-muted-foreground ml-3" size={20} />
        <input 
          type="text" 
          placeholder="Search for services (e.g. Income Certificate)"
          className="bg-transparent border-none outline-none flex-1 py-2 text-sm"
        />
      </div>

      {/* Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {MOCK_SERVICES.map(service => (
          <div key={service.id} className="glass p-6 rounded-2xl flex flex-col hover:-translate-y-1 transition-transform duration-300">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="text-2xl">{service.emoji}</span> 
              {service.name}
            </h3>
            <div className="flex items-center justify-between mt-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <span className="font-semibold text-foreground">₹{service.fee}</span> Fee
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} /> {service.days} Days
              </div>
            </div>
            <div className="mt-auto">
              <button 
                onClick={() => navigate(`/customer/apply/${service.id}`)}
                className="w-full py-2.5 bg-primary/20 text-primary-foreground font-medium rounded-xl hover:bg-primary/30 transition-colors"
              >
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
