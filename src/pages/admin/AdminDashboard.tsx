import React, { useEffect, useState } from 'react';
import { Users, FileText, IndianRupee, Activity, ArrowUpRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';

const revenueData = [
  { name: 'Mon', revenue: 4000 },
  { name: 'Tue', revenue: 3000 },
  { name: 'Wed', revenue: 5000 },
  { name: 'Thu', revenue: 2780 },
  { name: 'Fri', revenue: 8890 },
  { name: 'Sat', revenue: 1390 },
  { name: 'Sun', revenue: 3490 },
];

const serviceUsageData = [
  { name: 'Income', count: 450 },
  { name: 'Community', count: 320 },
  { name: 'Nativity', count: 180 },
  { name: 'Graduate', count: 90 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  
  // Real implementation would fetch these from Firestore, we'll implement a state to mock loading state
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    users: '1,245',
    pending: '48',
    revenue: '₹12,400',
    activeServices: '12'
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">Hello, {user?.name}. Here's the performance overview 📊.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Users 👥', count: stats.users, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { label: 'Pending Apps ⏳', count: stats.pending, icon: FileText, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Revenue (7 Days) 💰', count: stats.revenue, icon: IndianRupee, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Active Services 🚀', count: stats.activeServices, icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        ].map((stat, i) => (
          <div key={i} className="glass p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${stat.bg} ${stat.color}`}>
              <stat.icon size={28} />
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.count}</div>
              <div className="text-sm text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="glass rounded-2xl p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Revenue Overview</h2>
              <p className="text-sm text-muted-foreground">Past 7 days revenue collection</p>
            </div>
            <a href="/admin/applications" className="text-sm text-primary hover:underline flex items-center gap-1 font-medium bg-primary/10 px-3 py-1.5 rounded-lg">
              Manage Applications <ArrowUpRight size={16} />
            </a>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs font-medium" />
                <YAxis axisLine={false} tickLine={false} className="text-xs font-medium" tickFormatter={(value) => `₹${value}`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}
                  itemStyle={{ color: '#10b981', fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Most Used Services Chart */}
        <div className="glass rounded-2xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold mb-6">Top Services Availed</h2>
          
          <div className="flex-1 min-h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serviceUsageData} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="opacity-10 dark:opacity-20" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-medium" />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.1)', backdropFilter: 'blur(8px)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
