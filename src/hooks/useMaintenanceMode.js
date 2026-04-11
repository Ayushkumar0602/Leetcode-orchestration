import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Listens to Firestore `config/app` for:
 *
 * Global maintenance:
 *   maintenanceMode: boolean
 *   maintenanceMessage: string
 *   estimatedEnd: Timestamp | null
 *   progressPercent: number (0-100)
 *
 * Per-page maintenance:
 *   pageMaintenance: {
 *     "/resumeoptimiser": { isActive: true, message: "...", estimatedEnd: Timestamp, progressPercent: 70 },
 *     "/courses": { isActive: false, message: "" },
 *     ...
 *   }
 *
 * Returns:
 *   {
 *     loading, isActive, message, estimatedEnd, progressPercent,  ← global
 *     pageMaintenance,                                            ← per-page map
 *   }
 */
const useMaintenanceMode = () => {
  const [data, setData] = useState({
    loading: true,
    isActive: false,
    message: null,
    estimatedEnd: null,
    progressPercent: 65,
    pageMaintenance: {},
  });

  useEffect(() => {
    const docRef = doc(db, 'config', 'app');

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const d = snapshot.data();

          // Normalise pageMaintenance timestamps
          const rawPM = d.pageMaintenance || {};
          const pageMaintenance = {};
          Object.entries(rawPM).forEach(([path, cfg]) => {
            pageMaintenance[path] = {
              ...cfg,
              estimatedEnd: cfg.estimatedEnd?.toDate?.() || null,
            };
          });

          setData({
            loading: false,
            isActive: d.maintenanceMode === true,
            message: d.maintenanceMessage || null,
            estimatedEnd: d.estimatedEnd?.toDate?.() || null,
            progressPercent: d.progressPercent ?? 65,
            pageMaintenance,
          });
        } else {
          setData({ loading: false, isActive: false, message: null, estimatedEnd: null, progressPercent: 65, pageMaintenance: {} });
        }
      },
      (error) => {
        console.warn('[MaintenanceMode] Could not read config/app:', error.message);
        setData({ loading: false, isActive: false, message: null, estimatedEnd: null, progressPercent: 65, pageMaintenance: {} });
      }
    );

    return () => unsubscribe();
  }, []);

  return data;
};

export default useMaintenanceMode;
