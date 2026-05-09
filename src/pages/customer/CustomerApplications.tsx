import React, { useEffect, useState } from 'react';
import { Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Completed': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    case 'Processing': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    case 'Under Review': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    case 'Submitted': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
    case 'Pending Payment': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    // Handle payment success callback
    const handlePaymentSuccess = async () => {
      const paymentSuccess = searchParams.get('payment_success');
      const appId = searchParams.get('application_id');
      
      if (paymentSuccess === 'true' && appId && user) {
        setShowPaymentSuccess(true);
        try {
          await updateDoc(doc(db, 'applications', appId), {
            status: 'Under Review',
            timeline: ['Submitted', 'Under Review'] // Updates timeline removing pending
          });
          // Remove query params to prevent re-triggering
          setSearchParams({}, { replace: true });
          setTimeout(() => setShowPaymentSuccess(false), 5000);
        } catch (error) {
          console.error("Error updating paid application:", error);
        }
      }
    };
    handlePaymentSuccess();
  }, [searchParams, user, setSearchParams]);

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

      {showPaymentSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-500/10 border border-emerald-500/50 text-emerald-600 rounded-lg p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <CheckCircle size={20} />
            <span className="font-medium">Payment Successful! Your application is now Under Review.</span>
          </div>
          <button onClick={() => setShowPaymentSuccess(false)}>
            <XCircle size={18} className="opacity-50 hover:opacity-100" />
          </button>
        </motion.div>
      )}

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
                {app.status === 'Pending Payment' && (
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/create-checkout-session', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            applicationId: app.id,
                            serviceName: app.serviceName,
                            fee: app.fee,
                            userId: user?.uid,
                            email: user?.email,
                            phone: app.phone
                          })
                        });
                        const data = await response.json();
                        
                        if (data.mockUrl) {
                          window.location.href = data.mockUrl;
                        } else if (data.payment_session_id) {
                          const { load } = await import('@cashfreepayments/cashfree-js');
                          const cashfree = await load({
                            mode: data.environment === 'PRODUCTION' ? "production" : "sandbox",
                          });
                          cashfree.checkout({
                            paymentSessionId: data.payment_session_id,
                            redirectTarget: "_self"
                          });
                        } else {
                          alert('Payment failed: ' + data.error);
                        }
                      } catch (e) {
                        alert('Payment initiation failed.');
                      }
                    }}
                    className="px-4 py-1.5 text-sm font-bold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    Pay Now (₹{app.fee})
                  </button>
                )}
              </div>
            </div>

            {app.status === 'Rejected' && app.adminNotes && (
               <div className="mb-6 p-3 rounded-xl bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400 text-sm border border-red-100 dark:border-red-500/20">
                 <span className="font-semibold">Admin Note:</span> {app.adminNotes}
               </div>
            )}

            {/* Timeline UI */}
            <div className="relative pt-6 pb-2">
              <div className="absolute top-[38px] left-[10%] right-[10%] h-1 bg-secondary rounded-full hidden sm:block overflow-hidden">
                <motion.div 
                  className={`h-full ${app.status === 'Rejected' ? 'bg-red-500' : 'bg-primary'}`}
                  initial={{ width: 0 }}
                  animate={{ 
                    width: app.status === 'Completed' ? '100%' : 
                           app.status === 'Processing' ? '66%' : 
                           app.status === 'Under Review' ? '33%' : 
                           app.status === 'Rejected' ? '100%' : '0%' 
                  }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-6 sm:gap-0">
                {['Submitted', 'Under Review', 'Processing', 'Completed'].map((step, i) => {
                  
                  const isCompleted = app.status === 'Completed' || 
                    (app.status === 'Processing' && i < 2) || 
                    (app.status === 'Under Review' && i < 1);
                  const isCurrent = app.status === step;
                  const isRejected = app.status === 'Rejected' && step === 'Completed';

                  return (
                    <div key={i} className="flex sm:flex-col items-center gap-4 sm:gap-2 w-full sm:w-[120px] mx-auto text-center group">
                      <motion.div 
                        initial={{ scale: 0.8 }}
                        animate={{ scale: isCurrent ? 1.1 : 1 }}
                        className={`
                          w-10 h-10 rounded-full flex items-center justify-center border-4 transition-colors duration-500 relative bg-background z-10
                          ${isCompleted ? 'border-primary text-primary' : 
                            isCurrent ? 'border-primary text-primary shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 
                            isRejected ? 'border-red-500 text-red-500' :
                            'border-secondary text-muted-foreground'}
                        `}
                      >
                        {isCompleted ? <CheckCircle size={20} className="text-primary" /> : 
                         isRejected ? <XCircle size={20} /> : 
                         isCurrent ? <Clock size={20} className="animate-pulse" /> :
                         <span className="text-sm font-bold">{i + 1}</span>}
                      </motion.div>
                      <div className="flex flex-col items-start sm:items-center">
                        <div className={`text-sm font-bold whitespace-nowrap transition-colors duration-300
                          ${isCurrent || isCompleted ? 'text-foreground' : isRejected ? 'text-red-500' : 'text-muted-foreground'}
                        `}>
                          {isRejected ? 'Declined' : step}
                        </div>
                        {isCurrent && (
                          <div className="text-[10px] uppercase tracking-wider text-primary font-bold animate-pulse mt-0.5 hidden sm:block">
                            Current
                          </div>
                        )}
                        {!isCurrent && isCompleted && (
                          <div className="text-[10px] text-muted-foreground mt-0.5 hidden sm:block">
                            Done
                          </div>
                        )}
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
