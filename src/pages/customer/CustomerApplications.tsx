import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'Processing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'Under Review': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'Submitted': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
    default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'Completed': return <CheckCircle size={16} />;
    case 'Rejected': return <XCircle size={16} />;
    default: return <Clock size={16} />;
  }
};

export default function CustomerApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    // Real-time listener for current user's applications
    const q = query(collection(db, 'applications'), where('userId', '==', user.uid));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appsData: any[] = [];
      snapshot.forEach(doc => {
        appsData.push({ id: doc.id, ...doc.data() });
      });
      // Sort by date manually or keep as is. Usually order by timestamp.
      // Doing simple local mock sorting fallback
      setApplications(appsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Initial mockup fallback if no apps exist
  const displayApps = applications.length > 0 ? applications : [
    { id: 'APP1023', service: 'Community Certificate', date: 'Oct 24, 2023', status: 'Completed', daysLeft: 0, timeline: ['Submitted', 'Under Review', 'Processing', 'Completed'] },
    { id: 'APP1024', service: 'Income Certificate', date: 'Oct 26, 2023', status: 'Processing', daysLeft: 3, timeline: ['Submitted', 'Under Review', 'Processing'] }
  ];

  if (loading && applications.length === 0) {
    return <div className="text-muted-foreground p-4">Loading your applications...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
          My Applications
        </h1>
        <p className="text-muted-foreground mt-1">Track the status of your submitted requests</p>
      </div>

      <div className="space-y-4">
        {displayApps.map((app, index) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            key={app.id} 
            className="glass rounded-2xl p-6 relative overflow-hidden group"
          >
            {/* Highlight pulse if recently updated */}
            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-colors"></div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">{app.serviceName || app.service}</h3>
                  <div className="text-sm text-muted-foreground space-x-2">
                    <span>{app.id}</span>
                    <span>•</span>
                    <span>Submitted on {app.date || new Date(app.createdAt?.seconds * 1000).toLocaleDateString() || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:items-end gap-2">
                <div className={`px-3 py-1.5 rounded-full border text-sm font-medium flex items-center gap-1.5 ${getStatusColor(app.status)}`}>
                  {getStatusIcon(app.status)}
                  {app.status}
                </div>
                {app.status === 'Processing' && (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-md dark:bg-amber-900/30 dark:text-amber-400">
                    Est. {app.daysLeft || 3} days remaining
                  </span>
                )}
              </div>
            </div>

            {app.status === 'Rejected' && app.adminNotes && (
               <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
                 <span className="font-semibold">Admin Note:</span> {app.adminNotes}
               </div>
            )}

            {/* Timeline UI */}
            <div className="relative pt-4">
              <div className="absolute top-[28px] left-6 right-6 h-0.5 bg-border -z-10 hidden sm:block"></div>
              <div className="flex flex-col sm:flex-row justify-between gap-4">
                {['Submitted', 'Under Review', 'Processing', 'Completed'].map((step, i) => {
                  
                  const timeline = app.timeline || ['Submitted'];
                  let isCompleted = timeline.includes(step) && step !== app.status && app.status !== 'Rejected';
                  if (app.status === 'Completed' || (app.status === 'Processing' && (step === 'Submitted' || step === 'Under Review')) || (app.status === 'Under Review' && step === 'Submitted')) {
                    isCompleted = true;
                  }
                  
                  const isCurrent = app.status === step || (app.timeline && app.timeline[app.timeline.length - 1] === step);
                  const isRejected = step === 'Completed' && app.status === 'Rejected';

                  return (
                    <div key={i} className="flex sm:flex-col items-center gap-3 w-full max-w-[200px]">
                      <div className={`
                        w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300
                        ${isCompleted ? 'bg-primary border-primary text-primary-foreground' : 
                          isCurrent ? 'bg-background border-primary text-primary ring-4 ring-primary/20' : 
                          isRejected ? 'bg-background border-red-300 text-red-300' :
                          'bg-background border-border text-muted-foreground'}
                      `}>
                        {isCompleted ? <CheckCircle size={16} /> : 
                         isRejected ? <XCircle size={16} /> : 
                         <span className="text-xs font-bold">{i + 1}</span>}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap hidden sm:block">
                        {isRejected ? 'Declined' : step}
                      </div>
                      <div className="text-sm font-medium whitespace-nowrap sm:hidden">
                        {isRejected ? 'Declined' : step}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 border-t border-border/50 pt-4 flex justify-between items-center">
              {app.documentUrl ? (
                <a href={app.documentUrl} target="_blank" rel="noreferrer" className="text-sm font-medium text-emerald-600 hover:underline bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                  <FileText size={16} /> Preview Document
                </a>
              ) : (
                <div />
              )}
              <button className="text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg transition-colors flex items-center gap-1">
                View Details <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
