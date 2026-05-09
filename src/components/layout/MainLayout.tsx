import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, Home, FileText, Settings, CreditCard, LayoutDashboard, Menu, X, Users, Activity, Bell, Sun, Moon } from 'lucide-react';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { collection, query, where, onSnapshot, writeBatch, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import Logo from '../Logo';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user || user.role === 'superadmin') return; 

    // Listen to real-time notifications for the current user
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      notifs.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
    });

    return () => unsubscribe();
  }, [user]);

  const markAllAsRead = async () => {
    if (unreadCount === 0) return;
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  if (!user) {
    return <div className="min-h-screen bg-background">{children}</div>;
  }

  const customerLinks = [
    { name: 'Dashboard', path: '/customer/dashboard', icon: Home },
    { name: 'My Applications', path: '/customer/applications', icon: FileText },
    { name: 'Settings', path: '/customer/settings', icon: Settings },
  ];

  const adminLinks = [
    { name: 'Admin Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Applications', path: '/admin/applications', icon: FileText },
    { name: 'Services', path: '/admin/services', icon: Activity },
    ...(user.role === 'superadmin' || user.role === 'admin' ? [{ name: 'Staff', path: '/admin/staff', icon: Users }] : []),
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const links = user.role === 'customer' ? customerLinks : adminLinks;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40 lg:hidden glass"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 glass border-r flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="w-8 h-8" />
            <h1 className="text-xl font-bold text-foreground">
              Smart Portal
            </h1>
          </div>
          <button className="lg:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="px-6 pb-4">
          <div className="text-sm font-medium text-muted-foreground mb-1">Welcome back,</div>
          <div className="font-semibold">{user.name}</div>
          <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
        </div>

        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname.startsWith(link.path);
            return (
              <button
                key={link.path}
                onClick={() => {
                  navigate(link.path);
                  setSidebarOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary/20 text-primary-foreground" 
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground dark:hover:bg-white/5"
                )}
              >
                <Icon size={18} />
                {link.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative">
        <header className="h-16 flex items-center justify-between px-4 lg:px-8 border-b border-border/50 glass z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
          >
            <Menu size={24} />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 sm:gap-4 relative">
            <button 
              onClick={toggleTheme}
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors relative"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse"></span>
                )}
              </button>

              <AnimatePresence>
                {notificationsOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-72 glass border border-border/50 rounded-2xl shadow-xl overflow-hidden z-50 origin-top-right"
                  >
                    <div className="p-4 border-b border-border/50 font-semibold flex justify-between items-center bg-background/50">
                      Notifications
                      {unreadCount > 0 && <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                    </div>
                    <div className="max-h-[300px] overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">No recent notifications</div>
                      ) : (
                        notifications.map((item) => (
                          <div key={item.id} className={cn("p-4 border-b border-border/10 hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer transition-colors", !item.read && "bg-primary/5")}>
                            <div className="flex justify-between items-start mb-1">
                              <span className={cn("text-sm text-foreground", !item.read ? "font-bold" : "font-medium")}>{item.title}</span>
                              {!item.read && <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></span>}
                            </div>
                            <p className="text-xs text-muted-foreground leading-snug">{item.desc}</p>
                            <span className="text-[10px] text-muted-foreground/70 mt-1 block">
                              {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <div onClick={markAllAsRead} className="p-3 text-center text-xs font-medium text-primary hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer bg-background/50 transition-colors">
                        Mark all as read
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary-foreground font-semibold ml-2">
              {user.name.charAt(0)}
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-4 lg:p-8">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
