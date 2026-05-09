import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { ShieldCheck, User, Trash2, Plus, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CustomRole {
  id: string;
  name: string;
  permissions: {
    serviceManagement: boolean;
    applicationApproval: boolean;
    userManagement: boolean;
    reportAccess: boolean;
  }
}

export default function AdminStaff() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'staff' | 'roles'>('staff');

  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);

  useEffect(() => {
    if (!user || user.role === 'customer') return;
    
    const unsubscribeUsers = onSnapshot(query(collection(db, 'users')), (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
    });

    const unsubscribeRoles = onSnapshot(query(collection(db, 'roles')), (snapshot) => {
      const rolesData: CustomRole[] = [];
      snapshot.forEach(doc => {
        rolesData.push({ id: doc.id, ...doc.data() } as CustomRole);
      });
      setRoles(rolesData);
      setLoading(false);
    });

    return () => {
      unsubscribeUsers();
      unsubscribeRoles();
    };
  }, [user]);

  const updateUserRole = async (userId: string, newRole: string, customRoleId: string = '') => {
    try {
      if (user?.role !== 'superadmin' && newRole === 'superadmin') {
        alert("Only superadmin can promote to superadmin.");
        return;
      }
      if (user?.role !== 'superadmin') {
         const targetUser = users.find(u => u.id === userId);
         if (targetUser?.role === 'superadmin') {
            alert("Cannot modify superadmin role.");
            return;
         }
      }

      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        customRoleId: customRoleId
      });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Ensure you have the required permissions.");
    }
  };

  const saveRole = async () => {
    if(!editingRole) return;
    try {
      if (editingRole.id) {
        const { id, ...data } = editingRole;
        await updateDoc(doc(db, 'roles', id), data);
      } else {
        const { id, ...data } = editingRole;
        await setDoc(doc(collection(db, 'roles')), data);
      }
      setRoleModalOpen(false);
    } catch (error) {
      console.error("Error saving role:", error);
      alert("Failed to save role.");
    }
  };

  const deleteRole = async (id: string) => {
    if(confirm("Are you sure you want to delete this role? Any admins assigned this role will keep their 'admin' status but lose specific custom permissions until reassigned.")) {
      try {
        await deleteDoc(doc(db, 'roles', id));
      } catch (error) {
        console.error("Error deleting role:", error);
      }
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch(role) {
      case 'superadmin': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-400';
      case 'admin': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:text-blue-400';
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-500/20 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-foreground to-accent-foreground">
            Staff Management
          </h1>
          <p className="text-muted-foreground mt-1">Manage administrators and staff permissions</p>
        </div>
      </div>

      {user?.role === 'superadmin' && (
        <div className="flex gap-2 border-b border-border/50 pb-2">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === 'staff' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Staff List
          </button>
          <button 
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors border-b-2 ${activeTab === 'roles' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            Role Definitions
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground">Loading...</div>
      ) : activeTab === 'staff' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((u, index) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              key={u.id}
              className="glass rounded-2xl p-6 flex flex-col justify-between gap-4 border border-border/50"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <User size={24} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-semibold text-lg truncate">{u.name || 'Unknown User'}</h3>
                  <p className="text-sm text-muted-foreground truncate">{u.email}</p>
                  <div className="mt-2 text-xs flex gap-2">
                    <span className={`px-2 py-1 rounded-md border font-medium uppercase ${getRoleBadgeColor(u.role)}`}>
                      {u.role || 'customer'}
                    </span>
                    {u.role === 'admin' && u.customRoleId && (
                      <span className="px-2 py-1 rounded-md border font-medium bg-secondary text-secondary-foreground">
                        {roles.find(r => r.id === u.customRoleId)?.name || 'Custom Role'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {(user?.role === 'superadmin' || user?.role === 'admin') && u.email !== 'niranjanns1925@gmail.com' && u.id !== user?.uid && (
                <div className="pt-4 border-t border-border/50 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateUserRole(u.id, 'admin')}
                      disabled={u.role === 'admin' && !u.customRoleId}
                      className="py-1.5 px-3 text-[10px] font-bold uppercase rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Make Admin
                    </button>
                    <button 
                      onClick={() => updateUserRole(u.id, 'customer')}
                      disabled={u.role === 'customer' || !u.role}
                      className="py-1.5 px-3 text-[10px] font-bold uppercase rounded-lg bg-gray-500/10 text-gray-600 hover:bg-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Revoke Admin
                    </button>
                  </div>
                  
                  {user?.role === 'superadmin' && (
                    <select 
                      className="w-full text-xs p-1.5 rounded bg-background border border-border"
                      value={u.customRoleId || ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          updateUserRole(u.id, 'admin', e.target.value);
                        } else {
                          updateUserRole(u.id, u.role, '');
                        }
                      }}
                    >
                      <option value="">No Custom Role</option>
                      {roles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-end">
             <button 
               onClick={() => {
                 setEditingRole({
                   id: '', name: 'New Role', 
                   permissions: { serviceManagement: false, applicationApproval: false, userManagement: false, reportAccess: false }
                 });
                 setRoleModalOpen(true);
               }}
               className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-sm"
             >
               <Plus size={18} /> Create New Role
             </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((r, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                key={r.id}
                className="glass rounded-2xl p-6 flex flex-col justify-between gap-4 border border-border/50"
              >
                <div>
                  <h3 className="font-semibold text-lg flex items-center gap-2">
                    <Shield size={20} className="text-primary" /> {r.name}
                  </h3>
                  <div className="space-y-1 mt-4">
                    {Object.entries(r.permissions).map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs">
                        <span className="capitalize text-muted-foreground">{k.replace(/([A-Z])/g, ' $1')}</span>
                        <span className={`font-semibold ${v ? 'text-emerald-500' : 'text-red-500'}`}>{v ? 'Yes' : 'No'}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="pt-4 border-t border-border/50 flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingRole(r);
                      setRoleModalOpen(true);
                    }}
                    className="flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white transition-all"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => deleteRole(r.id)}
                    className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      <AnimatePresence>
        {roleModalOpen && editingRole && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setRoleModalOpen(false)}></div>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md glass rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="p-6 pb-4 border-b border-border/50 bg-background/50">
                <h2 className="text-xl font-bold">{editingRole.id ? 'Edit Role' : 'Create Role'}</h2>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">Role Name</label>
                  <input 
                    type="text" 
                    value={editingRole.name} 
                    onChange={e => setEditingRole({...editingRole, name: e.target.value})}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                </div>
                
                <div className="space-y-3 pt-2">
                  <label className="text-sm font-medium block">Permissions</label>
                  {Object.entries(editingRole.permissions).map(([k, v]) => (
                    <label key={k} className="flex items-center justify-between cursor-pointer p-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                      <span className="capitalize text-sm">{k.replace(/([A-Z])/g, ' $1')}</span>
                      <input 
                        type="checkbox"
                        checked={v}
                        onChange={e => setEditingRole({
                          ...editingRole,
                          permissions: { ...editingRole.permissions, [k]: e.target.checked }
                        })}
                        className="rounded w-4 h-4 text-primary focus:ring-primary/50"
                      />
                    </label>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-background/50 border-t border-border/50 flex justify-end gap-2">
                <button onClick={() => setRoleModalOpen(false)} className="px-4 py-2 rounded-lg font-medium text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5">Cancel</button>
                <button onClick={saveRole} disabled={!editingRole.name.trim()} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50">Save Role</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
