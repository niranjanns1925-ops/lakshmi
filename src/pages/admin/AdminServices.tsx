import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, setDoc, deleteDoc, updateDoc, addDoc } from 'firebase/firestore';
import { FileText, Plus, Trash2, Edit2, Check, X, Shield, Settings2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DocumentRule {
  id: string;
  name: string;
  formats: string[];
  maxSizeMB: number;
}

interface Service {
  id: string;
  name: string;
  emoji: string;
  fee: number;
  days: number;
  popular: boolean;
  documentRules: DocumentRule[];
}

export default function AdminServices() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return;
    
    const q = query(collection(db, 'services'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data: Service[] = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() } as Service);
      });
      setServices(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSaveService = async (service: Service) => {
    try {
      if (service.id) {
        // Update
        const { id, ...data } = service;
        await updateDoc(doc(db, 'services', id), data as any);
      } else {
        // Create
        const { id, ...data } = service;
        await addDoc(collection(db, 'services'), data);
      }
      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error("Error saving service:", error);
      alert("Failed to save service. Check permissions.");
    }
  };

  const handleDeleteService = async (id: string) => {
    if (confirm('Are you sure you want to delete this service?')) {
      try {
        await deleteDoc(doc(db, 'services', id));
      } catch (error) {
        console.error("Error deleting service:", error);
        alert("Failed to delete service.");
      }
    }
  };

  const openNewServiceModal = () => {
    setEditingService({
      id: '',
      name: '',
      emoji: '📄',
      fee: 0,
      days: 0,
      popular: false,
      documentRules: []
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground flex items-center gap-2">
            <Settings2 size={24} /> Document Rules Engine & Services
          </h1>
          <p className="text-muted-foreground mt-1">Configure service parameters and document upload requirements</p>
        </div>
        <button 
          onClick={openNewServiceModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
        >
          <Plus size={18} /> Add New Service
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
           <div className="text-muted-foreground p-8 text-center glass rounded-2xl">Loading configuration...</div>
        ) : services.length === 0 ? (
          <div className="text-center p-12 glass rounded-2xl border border-border/50">
            <FileText size={48} className="mx-auto text-muted-foreground opacity-50 mb-4" />
            <h3 className="text-lg font-medium">No Services Configured</h3>
            <p className="text-muted-foreground max-w-md mx-auto mt-2">Create your first service and define document upload rules using the Document Rules Engine.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {services.map((service) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={service.id}
                className="glass rounded-2xl p-6 border border-border/50 flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shadow-sm border border-primary/20">
                      {service.emoji}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{service.name}</h3>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                        <span className="font-medium px-2 py-0.5 rounded-full bg-background/50 border">₹{service.fee}</span>
                        <span className="font-medium px-2 py-0.5 rounded-full bg-background/50 border">{service.days} Days TAT</span>
                        {service.popular && <span className="font-medium text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-400/20">Popular</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingService(service);
                        setIsModalOpen(true);
                      }}
                      className="p-2 text-muted-foreground hover:text-primary bg-background/50 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border/50"
                      title="Edit Rules & Service"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteService(service.id)}
                      className="p-2 text-muted-foreground hover:text-red-500 bg-background/50 hover:bg-background rounded-lg transition-colors border border-transparent hover:border-border/50"
                      title="Delete Service"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="mt-2 bg-background/40 rounded-xl p-4 border border-border/50 flex-1">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Shield size={14} /> Document Rules 
                    <span className="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[10px] ml-1">{service.documentRules?.length || 0}</span>
                  </h4>
                  
                  {(!service.documentRules || service.documentRules.length === 0) ? (
                    <p className="text-sm text-muted-foreground italic text-center py-2">No document rules defined.</p>
                  ) : (
                    <div className="space-y-2">
                      {service.documentRules.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between bg-background rounded-lg px-3 py-2 border border-border/50 text-sm">
                          <span className="font-medium truncate max-w-[150px]" title={rule.name}>{rule.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex gap-1">
                              {rule.formats.map(f => <span key={f} className="uppercase bg-black/5 dark:bg-white/5 px-1 rounded">{f}</span>)}
                            </span>
                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded whitespace-nowrap">
                              {rule.maxSizeMB} MB
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && editingService && (
          <ServiceModal 
            service={editingService} 
            onChange={setEditingService}
            onClose={() => setIsModalOpen(false)} 
            onSave={() => handleSaveService(editingService)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ServiceModal({ service, onChange, onClose, onSave }: { 
  service: Service, 
  onChange: (s: Service) => void,
  onClose: () => void, 
  onSave: () => void 
}) {
  const addDocumentRule = () => {
    onChange({
      ...service,
      documentRules: [
        ...(service.documentRules || []),
        { id: Date.now().toString(), name: '', formats: ['pdf', 'jpg'], maxSizeMB: 2 }
      ]
    });
  };

  const updateDocumentRule = (id: string, updates: Partial<DocumentRule>) => {
    onChange({
      ...service,
      documentRules: service.documentRules.map(rule => 
        rule.id === id ? { ...rule, ...updates } : rule
      )
    });
  };

  const removeDocumentRule = (id: string) => {
    onChange({
      ...service,
      documentRules: service.documentRules.filter(rule => rule.id !== id)
    });
  };

  const toggleFormat = (ruleId: string, format: string) => {
    const rule = service.documentRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    let newFormats = [...rule.formats];
    if (newFormats.includes(format)) {
      newFormats = newFormats.filter(f => f !== format);
      if (newFormats.length === 0) newFormats = ['pdf']; // keep at least one
    } else {
      newFormats.push(format);
    }
    updateDocumentRule(ruleId, { formats: newFormats });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }} 
        animate={{ scale: 1, y: 0 }} 
        exit={{ scale: 0.95, y: 20 }}
        className="glass w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-border/50 flex flex-col"
      >
        <div className="sticky top-0 z-10 glass border-b border-border/50 p-6 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings2 size={20} className="text-primary"/> 
            {service.id ? 'Edit Service & Rules' : 'New Service & Rules'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:bg-background p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-8">
          {/* Basic Service Info */}
          <div>
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4 border-b border-border/50 pb-2">Service Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-sm font-medium">Service Name</label>
                <input 
                  type="text" 
                  value={service.name} 
                  onChange={e => onChange({...service, name: e.target.value})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="e.g., Income Certificate"
                />
              </div>
              
              <div className="space-y-1.5 select-none">
                <label className="text-sm font-medium">Emoji Icon</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={service.emoji} 
                    onChange={e => onChange({...service, emoji: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                    placeholder="📄"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 empty:hidden">{service.emoji}</div>
                </div>
              </div>
              
              <div className="space-y-1.5 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2 text-sm font-medium">
                  <input 
                    type="checkbox" 
                    checked={service.popular} 
                    onChange={e => onChange({...service, popular: e.target.checked})}
                    className="rounded text-primary focus:ring-primary/50 w-4 h-4"
                  />
                  Mark as Popular highlight
                </label>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Fee (₹)</label>
                <input 
                  type="number" 
                  value={service.fee} 
                  onChange={e => onChange({...service, fee: parseFloat(e.target.value) || 0})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium">Turnaround Time (Days)</label>
                <input 
                  type="number" 
                  value={service.days} 
                  onChange={e => onChange({...service, days: parseInt(e.target.value) || 0})}
                  className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          {/* Document Rules Engine */}
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border/50 pb-2">
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Shield size={16} /> Document Rules Engine
              </h3>
              <button 
                onClick={addDocumentRule}
                className="text-xs font-semibold bg-primary/10 text-primary px-3 py-1.5 rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
              >
                <Plus size={14} /> Add Rule
              </button>
            </div>
            
            <div className="space-y-4">
              {(!service.documentRules || service.documentRules.length === 0) ? (
                <div className="text-center py-8 bg-background/50 rounded-xl border border-dashed border-border/50">
                  <p className="text-sm text-muted-foreground">No document upload rules defined.</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">Users will not be restricted or required to upload specific files.</p>
                </div>
              ) : (
                service.documentRules.map((rule, idx) => (
                  <div key={rule.id} className="bg-background rounded-xl p-4 border border-border/50 flex flex-col sm:flex-row gap-4 items-start sm:items-center relative group">
                    <span className="absolute -left-2 -top-2 bg-primary text-primary-foreground text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm">
                      {idx + 1}
                    </span>
                    
                    <div className="flex-1 space-y-1.5 w-full">
                      <label className="text-xs font-medium text-muted-foreground">Document Name (e.g. Aadhar Card)</label>
                      <input 
                        type="text" 
                        value={rule.name} 
                        onChange={e => updateDocumentRule(rule.id, { name: e.target.value })}
                        className="w-full bg-black/5 dark:bg-white/5 border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        placeholder="Required document name"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground block">Allowed Formats</label>
                      <div className="flex gap-2">
                        {['pdf', 'jpg', 'png'].map(fmt => {
                          const isActive = rule.formats.includes(fmt);
                          return (
                            <button
                              key={fmt}
                              onClick={() => toggleFormat(rule.id, fmt)}
                              className={`uppercase text-[10px] font-bold px-2 py-1 rounded transition-colors border
                                ${isActive ? 'bg-primary text-primary-foreground border-primary' : 'bg-transparent text-muted-foreground border-border hover:border-primary/50'}
                              `}
                            >
                              {fmt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground block text-right">Max Size</label>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={rule.maxSizeMB} 
                          onChange={e => updateDocumentRule(rule.id, { maxSizeMB: parseInt(e.target.value) || 1 })}
                          className="w-16 bg-black/5 dark:bg-white/5 border border-border rounded-lg pl-2 pr-6 py-1.5 text-sm text-right focus:outline-none focus:ring-2 focus:ring-primary/30"
                          min="1" max="20"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">MB</span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => removeDocumentRule(rule.id)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border border-transparent hover:border-red-200 mt-5 sm:mt-0"
                      title="Remove Rule"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 flex gap-3 text-sm text-blue-800 dark:text-blue-300">
              <Shield className="shrink-0 mt-0.5" size={16} />
              <div>
                <strong>Rules Engine Enabled</strong>
                <p className="mt-1 opacity-90 text-xs leading-relaxed">
                  When a customer applies for this service, the system will dynamically validate their uploads against these rules before submission. They must upload exactly the number of required documents matching size and format criteria.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="sticky bottom-0 z-10 glass border-t border-border/50 p-4 px-6 flex justify-end gap-3 mt-auto">
          <button 
            onClick={onClose}
            className="px-5 py-2 rounded-lg font-medium hover:bg-background transition-colors text-muted-foreground"
          >
            Cancel
          </button>
          <button 
            onClick={onSave}
            disabled={!service.name.trim()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Check size={18} /> Save Configuration
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
