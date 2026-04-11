import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

const ADMIN_UIDS = [
  'sD1yZ4068yO9a88xIeM3n7rU6hU2', // Ayush Jaiswal
];

/**
 * Returns { isAdmin: boolean, loading: boolean }
 * Checks both the hardcoded UID list AND the Firestore profile field `isAdmin: true`.
 */
const useIsAdmin = () => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setIsAdmin(false);
      setLoading(false);
      return;
    }

    // Fast check: hardcoded UID list
    if (ADMIN_UIDS.includes(currentUser.uid)) {
      setIsAdmin(true);
      setLoading(false);
      return;
    }

    // Async check: Firestore profile
    const checkFirestore = async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const data = snap.data();
          setIsAdmin(data.isAdmin === true || data.role === 'admin');
        } else {
          setIsAdmin(false);
        }
      } catch {
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkFirestore();
  }, [currentUser]);

  return { isAdmin, loading };
};

export default useIsAdmin;
