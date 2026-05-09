import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Bell, Save } from 'lucide-react';

export default function CustomerSettings() {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account information and preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass p-6 rounded-2xl flex flex-col items-center text-center border border-border/50">
            <div className="w-24 h-24 rounded-full bg-primary/20 text-primary flex items-center justify-center text-3xl font-bold mb-4 shadow-inner">
              {user.name.charAt(0)}
            </div>
            <h2 className="font-bold text-lg">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-4 px-3 py-1 bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 capitalize text-xs font-bold rounded-full">
              {user.role} Verified
            </div>
          </div>

          <div className="glass p-4 rounded-2xl space-y-2 border border-border/50">
            <button className="w-full flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary font-medium rounded-lg transition-colors">
              <User size={18} /> Personal Info
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground font-medium rounded-lg transition-colors">
              <Shield size={18} /> Security
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2 text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5 hover:text-foreground font-medium rounded-lg transition-colors">
              <Bell size={18} /> Notifications
            </button>
          </div>
        </div>

        {/* Main form */}
        <div className="md:col-span-2 glass p-6 rounded-2xl border border-border/50">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <User size={20} className="text-primary" /> Personal Information
          </h3>
          
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={user.name}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <input 
                    type="email" 
                    defaultValue={user.email}
                    disabled
                    className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg pl-10 pr-4 py-2 text-sm text-foreground opacity-70 cursor-not-allowed"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Phone Number</label>
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-muted-foreground">Aadhaar Last 4 Digits</label>
                <input 
                  type="text" 
                  placeholder="XXXX XXXX 1234"
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-border/50 mt-6 flex justify-end">
              <button type="submit" className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm">
                <Save size={18} /> Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
