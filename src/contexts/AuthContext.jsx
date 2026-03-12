import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, rtdb } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let sessionUnsubscribe = null;

        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);

            if (sessionUnsubscribe) {
                sessionUnsubscribe();
                sessionUnsubscribe = null;
            }

            if (user) {
                const sessionId = localStorage.getItem('currentSessionId');
                if (sessionId) {
                    const sessionRef = ref(rtdb, `users/${user.uid}/sessions/${sessionId}`);
                    sessionUnsubscribe = onValue(sessionRef, (snapshot) => {
                        if (!snapshot.exists()) {
                            // Session was revoked remotely
                            signOut(auth);
                            localStorage.removeItem('currentSessionId');
                        }
                    });
                }
            }
        });

        return () => {
            unsubscribe();
            if (sessionUnsubscribe) sessionUnsubscribe();
        };
    }, []);

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
            // Register session in backend
            try {
                const response = await fetch('https://leetcode-orchestration-55z3.onrender.com/api/auth/session', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: result.user.uid })
                });
                const data = await response.json();
                if (data.sessionId) {
                    localStorage.setItem('currentSessionId', data.sessionId);
                }
            } catch (err) {
                console.error("Failed to register session:", err);
            }
        }
        return result;
    };

    const logout = async () => {
        if (currentUser) {
            const sessionId = localStorage.getItem('currentSessionId');
            if (sessionId) {
                try {
                    await fetch(`https://leetcode-orchestration-55z3.onrender.com/api/auth/session/${currentUser.uid}/${sessionId}`, {
                        method: 'DELETE'
                    });
                } catch (err) {
                    console.error("Failed to remove session:", err);
                }
                localStorage.removeItem('currentSessionId');
            }
        }
        return signOut(auth);
    };

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
