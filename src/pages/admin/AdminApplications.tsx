import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy } from 'firebase/firestore';
import { CheckCircle, XCircle, FileText, Search, Clock, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    if (!user) return;
    
    // Fetch all applications
    const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData: any[] = [];
      snapshot.forEach(document => {
        appsData.push({ id: document.id, ...document.data() });
      });
      setApplications(appsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateStatus = async (appId: string, status: string) => {
    try {
      const appRef = doc(db, 'applications', appId);
      
      // Get current app to update timeline
      const currentApp = applications.find(a => a.id === appId);
      const newTimeline = [...(currentApp?.timeline || ['Submitted']), status];
      
      await updateDoc(appRef, {
        status,
        timeline: newTimeline
      });
    } catch (e) {
      console.error("Error updating status: ", e);
      alert("Failed to update status.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'text-emerald-500 bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20';
      case 'Processing': return 'text-amber-500 bg-amber-500/10 border-amber-200 dark:border-amber-500/20';
      case 'Under Review': return 'text-blue-500 bg-blue-500/10 border-blue-200 dark:border-blue-500/20';
      case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-200 dark:border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-200 dark:border-gray-500/20';
    }
  };

  const filteredApps = filter === 'All' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
            Manage Applications
          </h1>
          <p className="text-muted-foreground mt-1">Review and process user certificates</p>
        </div>
        
        <div className="flex gap-2">
          {['All', 'Under Review', 'Processing', 'Approved', 'Rejected'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === status ? 'bg-primary text-primary-foreground' : 'bg-secondary hover:bg-secondary/80'}`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-muted-foreground">Loading applications...</div>
        ) : filteredApps.length === 0 ? (
           <div className="glass p-8 text-center rounded-2xl text-muted-foreground">No applications found.</div>
        ) : (
          filteredApps.map((app, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={app.id} 
              className="glass rounded-2xl p-6 flex flex-col xl:flex-row justify-between gap-6 hover:shadow-lg transition-all"
            >
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{app.serviceName || 'Unknown Service'}</h3>
                  <div className="text-sm font-medium mt-1">Applicant: {app.userName || 'N/A'} ({app.userEmail || 'N/A'})</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    ID: {app.id} • Submitted: {app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleString() : 'N/A'}
                  </div>
                  {app.description && (
                    <div className="mt-3 text-sm bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border/50">
                      <span className="font-semibold">Note: </span> {app.description}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end gap-3 justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>

                {app.documentUrl && (
                  <a href={app.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline bg-primary/10 px-3 py-1.5 rounded-lg transition-colors">
                    <ExternalLink size={16} /> View Document
                  </a>
                )}

                <div className="flex gap-2 w-full sm:w-auto xl:mt-2">
                  {app.status !== 'Approved' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Approved')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <CheckCircle size={16} /> Approve
                    </button>
                  )}
                  {app.status !== 'Processing' && app.status !== 'Approved' && app.status !== 'Rejected' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Processing')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <Clock size={16} /> Processing
                    </button>
                  )}
                  {app.status !== 'Rejected' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Rejected')}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <XCircle size={16} /> Reject
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
