import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, orderBy, addDoc, Timestamp } from 'firebase/firestore';
import { CheckCircle, XCircle, FileText, Search, Clock, ExternalLink, MessageSquare, Download } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [noteInputs, setNoteInputs] = useState<Record<string, string>>({});

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

  const updateStatus = async (appId: string, status: string, userId: string, serviceName: string) => {
    try {
      const appRef = doc(db, 'applications', appId);
      
      const currentApp = applications.find(a => a.id === appId);
      const newTimeline = [...(currentApp?.timeline || ['Submitted']), status];
      
      await updateDoc(appRef, {
        status,
        timeline: newTimeline,
        updatedAt: Timestamp.now()
      });

      // Push real-time notification
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: 'Status Updated',
        desc: `Your application for ${serviceName || 'a service'} is now: ${status}.`,
        read: false,
        createdAt: Timestamp.now(),
        applicationId: appId
      });

    } catch (e) {
      console.error("Error updating status: ", e);
      alert("Failed to update status.");
    }
  };

  const handleAddNote = async (appId: string, userId: string, serviceName: string) => {
    const note = noteInputs[appId];
    if (!note || note.trim() === '') return;
    
    try {
      await updateDoc(doc(db, 'applications', appId), {
        adminNotes: note,
        updatedAt: Timestamp.now()
      });

      // Push real-time notification
      await addDoc(collection(db, 'notifications'), {
        userId,
        title: 'Admin Note Added',
        desc: `An admin left a note on your ${serviceName || 'service'} application: "${note}"`,
        read: false,
        createdAt: Timestamp.now(),
        applicationId: appId
      });

      setNoteInputs(prev => ({...prev, [appId]: ''}));
    } catch (e) {
      console.error("Error adding note: ", e);
      alert("Failed to add note.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'text-emerald-700 bg-emerald-100 border-emerald-200 dark:border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400';
      case 'Processing': return 'text-amber-700 bg-amber-100 border-amber-200 dark:border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400';
      case 'Under Review': return 'text-blue-700 bg-blue-100 border-blue-200 dark:border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400';
      case 'Submitted': return 'text-purple-700 bg-purple-100 border-purple-200 dark:border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400';
      case 'Rejected': return 'text-red-700 bg-red-100 border-red-200 dark:border-red-500/20 dark:bg-red-500/20 dark:text-red-400';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-200 dark:border-gray-500/20';
    }
  };

  const downloadExcel = () => {
    if (applications.length === 0) return;

    const headers = [
      'Application ID',
      'Applicant Name',
      'Contact Info (Email)',
      'Service',
      'Status',
      'Date Submitted',
      'Admin Notes',
      'User Notes',
      'Document Uploaded',
      'Document URL'
    ];

    const csvData = applications.map(app => [
      app.id,
      `"${(app.userName || 'N/A').replace(/"/g, '""')}"`,
      `"${(app.userEmail || 'N/A').replace(/"/g, '""')}"`,
      `"${(app.serviceName || 'Unknown Service').replace(/"/g, '""')}"`,
      app.status,
      app.createdAt ? new Date(app.createdAt.seconds * 1000).toLocaleString() : 'N/A',
      `"${(app.adminNotes || '').replace(/"/g, '""')}"`,
      `"${(app.description || '').replace(/"/g, '""')}"`,
      app.documentUrl ? 'Yes' : 'No',
      app.documentUrl || 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `Applications_Export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredApps = filter === 'All' ? applications : applications.filter(a => a.status === filter);

  return (
    <div className="space-y-6 bg-[#f7fbf8] dark:bg-[#0c120e] min-h-[calc(100vh-80px)] p-6 -mx-6 -mt-6 rounded-tr-3xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-green-900/10 dark:border-green-100/10 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-green-950 dark:text-green-50">
            Service Tracking System 🌿
          </h1>
          <p className="text-green-800/70 dark:text-green-200/70 mt-1">Real-time application tracking and processing dashboard</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={downloadExcel}
            disabled={applications.length === 0}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 font-medium"
          >
            <Download size={18} />
            Export to Excel (CSV)
          </button>
          
          <div className="w-px h-8 bg-border hidden sm:block mx-2"></div>

          <div className="flex flex-wrap gap-2">
            {['All', 'Submitted', 'Under Review', 'Processing', 'Completed', 'Rejected'].map(status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === status ? 'bg-[#4ade80] text-green-950 shadow-md' : 'bg-background hover:bg-[#eef8f2] border border-border/50 text-foreground'}`}
              >
                {status}
              </button>
            ))}
          </div>
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
              className="bg-white dark:bg-black/20 rounded-2xl p-6 flex flex-col xl:flex-row justify-between gap-6 hover:shadow-xl hover:shadow-green-900/5 transition-all border border-green-900/5 dark:border-green-100/5"
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
                  {app.adminNotes && (
                    <div className="mt-3 text-sm bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border/50">
                      <span className="font-semibold text-primary">Admin Note: </span> {app.adminNotes}
                    </div>
                  )}
                  {app.description && (
                    <div className="mt-3 text-sm bg-black/5 dark:bg-white/5 p-3 rounded-lg border border-border/50">
                      <span className="font-semibold text-muted-foreground">User Note: </span> {app.description}
                    </div>
                  )}

                  {/* Add Note Input */}
                  <div className="mt-4 flex gap-2 w-full max-w-md">
                    <input 
                      type="text" 
                      value={noteInputs[app.id] || ''}
                      onChange={(e) => setNoteInputs({...noteInputs, [app.id]: e.target.value})}
                      placeholder="Add an admin note..."
                      className="flex-1 bg-background border border-border rounded-lg px-3 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
                    />
                    <button 
                      onClick={() => handleAddNote(app.id, app.userId, app.serviceName)}
                      className="bg-primary/10 text-primary hover:bg-primary hover:text-white p-1.5 rounded-lg transition-colors flex items-center justify-center"
                    >
                      <MessageSquare size={16} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row xl:flex-col items-start sm:items-center xl:items-end gap-3 justify-between shrink-0">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusColor(app.status)}`}>
                  {app.status}
                </span>

                {app.documentUrl && (
                  <a href={app.documentUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-colors w-full justify-center">
                    <ExternalLink size={16} /> Review Document
                  </a>
                )}

                <div className="flex gap-2 w-full sm:w-auto xl:mt-2 flex-wrap">
                  {app.status !== 'Submitted' && app.status !== 'Rejected' && app.status !== 'Completed' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Submitted', app.userId, app.serviceName)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-500/20 dark:text-purple-400 dark:hover:bg-purple-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <Clock size={16} /> Submitted
                    </button>
                  )}
                  {app.status !== 'Under Review' && app.status !== 'Rejected' && app.status !== 'Completed' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Under Review', app.userId, app.serviceName)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <Search size={16} /> Review
                    </button>
                  )}
                  {app.status !== 'Processing' && app.status !== 'Rejected' && app.status !== 'Completed' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Processing', app.userId, app.serviceName)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <Clock size={16} /> Process
                    </button>
                  )}
                  {app.status !== 'Completed' && app.status !== 'Rejected' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Completed', app.userId, app.serviceName)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                      <CheckCircle size={16} /> Complete
                    </button>
                  )}
                  {app.status !== 'Rejected' && app.status !== 'Completed' && (
                    <button 
                      onClick={() => updateStatus(app.id, 'Rejected', app.userId, app.serviceName)}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30 px-3 py-2 rounded-lg text-sm font-medium transition-all"
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
