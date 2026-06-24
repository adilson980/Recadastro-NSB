import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { 
  initializeAuth, 
  browserLocalPersistence, 
  browserSessionPersistence, 
  inMemoryPersistence, 
  GoogleAuthProvider,
  getAuth,
  Auth
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

// Helper to check if standard browser persistence is safe to use (not blocked by iframe sandbox)
const checkStorageSupport = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    
    // Check if localStorage is blocked or throws a SecurityError
    const storage = window.localStorage;
    if (!storage) return false;
    
    const testKey = '__storage_test__';
    storage.setItem(testKey, 'test');
    storage.removeItem(testKey);
    
    // Check if IndexedDB is available and doesn't throw on access
    if (!window.indexedDB) return false;
    
    return true;
  } catch (e) {
    console.warn('Storage check failed, falling back to inMemoryPersistence:', e);
    return false;
  }
};

let initializedAuth: Auth | null = null;

export const getAuthInstance = (): Auth => {
  if (!initializedAuth) {
    try {
      if (checkStorageSupport()) {
        initializedAuth = initializeAuth(app, {
          persistence: [browserLocalPersistence, browserSessionPersistence]
        });
      } else {
        console.info('Iframe sandbox or restricted environment detected. Initializing Firebase Auth with inMemoryPersistence to prevent SecurityError.');
        initializedAuth = initializeAuth(app, {
          persistence: inMemoryPersistence
        });
      }
    } catch (error) {
      console.warn('Firebase Auth initialization failed, falling back to standard getAuth:', error);
      initializedAuth = getAuth(app);
    }
  }
  return initializedAuth;
};

export const googleProvider = new GoogleAuthProvider();


