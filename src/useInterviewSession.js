import { useState, useEffect } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from './firebase';

export function useInterviewSession(sessionId) {
    const [aiActions, setAiActions] = useState([]);

    useEffect(() => {
        if (!sessionId) return;

        const actionsRef = ref(rtdb, `sessions/${sessionId}/actions`);

        const unsubscribe = onValue(actionsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // RTDB returns an object with push IDs as keys, 
                // we want a flat array of all actions sorted by timestamp
                const allActions = Object.values(data)
                    .sort((a, b) => a.timestamp - b.timestamp)
                    .flatMap(record => record.actions || []);

                setAiActions(allActions);
            } else {
                setAiActions([]);
            }
        });

        return () => off(actionsRef, 'value', unsubscribe);
    }, [sessionId]);

    return { aiActions };
}
