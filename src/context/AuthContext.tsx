import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, googleProvider } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export type UserRole = 'customer' | 'admin' | 'superadmin';

export interface RolePermissions {
  serviceManagement: boolean;
  applicationApproval: boolean;
  userManagement: boolean;
  reportAccess: boolean;
}

export interface AppUser {
  uid: string;
  name: string;
  email: string;
  role: UserRole;
  customRoleId?: string;
  permissions?: RolePermissions;
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  logout: async () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          // Add a timeout to prevent hanging when offline
          const getDocWithTimeout = (ref: any, timeoutMs: number) => {
            return Promise.race([
              getDoc(ref),
              new Promise((_, reject) => setTimeout(() => reject(new Error('client is offline (timeout)')), timeoutMs))
            ]) as Promise<any>;
          };

          const docSnap = await getDocWithTimeout(docRef, 8000);
          
          if (docSnap.exists()) {
            const data = docSnap.data();
            let userRole = data.role || 'customer';
            
            let permissions: RolePermissions | undefined = undefined;
            if (data.customRoleId) {
              try {
                const roleSnap = await getDocWithTimeout(doc(db, 'roles', data.customRoleId), 5000);
                if (roleSnap.exists()) {
                  permissions = roleSnap.data().permissions;
                }
              } catch (e) {
                console.warn("Failed to fetch custom role permissions", e);
              }
            }

            // Promote to superadmin if matching email
            if (firebaseUser.email === 'niranjanns1925@gmail.com' && userRole !== 'superadmin') {
              userRole = 'superadmin';
              setDoc(docRef, { role: 'superadmin' }, { merge: true }).catch(e => console.warn("Background setDoc failed:", e));
            }

            // Superadmin has all permissions
            if (userRole === 'superadmin') {
              permissions = {
                serviceManagement: true,
                applicationApproval: true,
                userManagement: true,
                reportAccess: true
              };
            }

            setUser({
              uid: firebaseUser.uid,
              name: data.name || firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: userRole,
              customRoleId: data.customRoleId,
              permissions
            });
          } else {
            // Auto-create customer profile on first sign in (e.g. via Google)
            let userRole: UserRole = 'customer';
            if (firebaseUser.email === 'niranjanns1925@gmail.com') {
              userRole = 'superadmin';
            }
            const newUser: AppUser = {
              uid: firebaseUser.uid,
              name: firebaseUser.displayName || 'User',
              email: firebaseUser.email || '',
              role: userRole
            };
            setDoc(docRef, newUser).catch(e => console.warn("Background setDoc failed:", e));
            setUser(newUser);
          }
        } catch (error: any) {
          console.warn("Notice: Error fetching user data. Using fallback role.", error.message);
          if (error.message?.includes('client is offline')) {
            console.warn("Firebase is offline or slow. Check your database configuration or network.");
          }
          // If Firestore fails, still log them in with default role based on their email
          let fallbackRole: UserRole = 'customer';
          if (firebaseUser.email === 'niranjanns1925@gmail.com') {
            fallbackRole = 'superadmin';
          }
          setUser({
            uid: firebaseUser.uid,
            name: firebaseUser.displayName || 'User',
            email: firebaseUser.email || '',
            role: fallbackRole
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Google sign in error", error);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Email sign in error", error);
      throw error;
    }
  };

  const registerWithEmail = async (name: string, email: string, password: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      // Create user doc
      let role: UserRole = 'customer';
      if (email === 'niranjanns1925@gmail.com') {
        role = 'superadmin';
      }
      setDoc(doc(db, 'users', res.user.uid), {
        uid: res.user.uid,
        name,
        email,
        role
      }).catch(e => console.warn("Background setDoc failed:", e));
    } catch (error) {
      console.error("Email register error", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithEmail, registerWithEmail, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
