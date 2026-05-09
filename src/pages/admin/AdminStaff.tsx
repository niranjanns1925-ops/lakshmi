import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot, doc, updateDoc, setDoc } from 'firebase/firestore';
import { ShieldCheck, User, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminStaff() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role === 'customer') return;
    
    const q = query(collection(db, 'users'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const usersData: any[] = [];
      snapshot.forEach(doc => {
        usersData.push({ id: doc.id, ...doc.data() });
      });
      setUsers(usersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const updateUserRole = async (userId: string, newRole: string) => {
    try {
      if (user?.role !== 'superadmin' && newRole === 'superadmin') {
        alert("Only superadmin can promote to superadmin.");
        return;
      }
      // Assuming only superadmin can demote another superadmin or admin
      if (user?.role !== 'superadmin') {
         const targetUser = users.find(u => u.id === userId);
         if (targetUser?.role === 'superadmin') {
            alert("Cannot modify superadmin role.");
            return;
         }
      }

      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update role. Ensure you have the required permissions.");
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

      <div className="space-y-4">
        {loading ? (
           <div className="text-muted-foreground">Loading users...</div>
        ) : (
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
                    <div className="mt-2 text-xs">
                      <span className={`px-2 py-1 rounded-md border font-medium uppercase ${getRoleBadgeColor(u.role)}`}>
                        {u.role || 'customer'}
                      </span>
                    </div>
                  </div>
                </div>

                {(user?.role === 'superadmin' || user?.role === 'admin') && u.email !== 'niranjanns1925@gmail.com' && u.id !== user?.uid && (
                  <div className="pt-4 border-t border-border/50 grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => updateUserRole(u.id, 'admin')}
                      disabled={u.role === 'admin'}
                      className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-600 hover:bg-blue-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Make Admin
                    </button>
                    <button 
                      onClick={() => updateUserRole(u.id, 'customer')}
                      disabled={u.role === 'customer' || !u.role}
                      className="py-1.5 px-3 text-xs font-semibold rounded-lg bg-gray-500/10 text-gray-600 hover:bg-gray-500 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Revoke Admin
                    </button>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
