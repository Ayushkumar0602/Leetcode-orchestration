import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, googleProvider, githubProvider, rtdb } from '../firebase';
import {
    onAuthStateChanged,
    signInWithPopup,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    updateProfile,
} from 'firebase/auth';
import { ref, onValue } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

const API_BASE = 'https://leetcode-orchestration-55z3.onrender.com';

async function registerSession(uid) {
    try {
        const response = await fetch(`${API_BASE}/api/auth/session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ uid }),
        });
        const data = await response.json();
        if (data.sessionId) {
            localStorage.setItem('currentSessionId', data.sessionId);
        }
    } catch (err) {
        console.error('Failed to register session:', err);
    }
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

    // ── Google Login ──────────────────────────────────────────────
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
            await registerSession(result.user.uid);
        }
        return result;
    };

    // ── GitHub Login ──────────────────────────────────────────────
    const loginWithGithub = async () => {
        const result = await signInWithPopup(auth, githubProvider);
        if (result.user) {
            await registerSession(result.user.uid);
        }
        return result;
    };

    // ── Email Signup (creates account + sends verification email) ─
    const signupWithEmail = async (email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        if (result.user) {
            await sendEmailVerification(result.user);
        }
        return result;
    };

    // ── Email Login ───────────────────────────────────────────────
    const loginWithEmail = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        if (result.user) {
            await registerSession(result.user.uid);
        }
        return result;
    };

    // ── Magic Link (Passwordless) ─────────────────────────────────
    const sendMagicLink = async (email) => {
        const actionCodeSettings = {
            url: window.location.origin + '/login', // Redirect back to login page
            handleCodeInApp: true,
        };
        await import('firebase/auth').then(({ sendSignInLinkToEmail }) => 
            sendSignInLinkToEmail(auth, email, actionCodeSettings)
        );
        window.localStorage.setItem('emailForSignIn', email);
    };

    const signInWithMagicLink = async (email, url) => {
        const { isSignInWithEmailLink, signInWithEmailLink } = await import('firebase/auth');
        if (isSignInWithEmailLink(auth, url)) {
            const result = await signInWithEmailLink(auth, email, url);
            window.localStorage.removeItem('emailForSignIn');
            if (result.user) {
                await registerSession(result.user.uid);
            }
            return result;
        }
        throw new Error('Invalid magic link.');
    };

    // ── Update User Profile (Onboarding) ──────────────────────────
    const updateUserProfile = async ({ displayName, photoURL, primaryInterest }) => {
        if (!auth.currentUser) return;
        
        const updateData = {};
        if (displayName) updateData.displayName = displayName;
        if (photoURL) updateData.photoURL = photoURL;

        if (Object.keys(updateData).length > 0) {
            await updateProfile(auth.currentUser, updateData);
        }
        
        // Also update the backend profile
        try {
            await fetch(`${API_BASE}/api/profile/${auth.currentUser.uid}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    displayName: displayName || auth.currentUser.displayName,
                    photoURL: photoURL || auth.currentUser.photoURL,
                    primaryInterest: primaryInterest || 'DSA'
                }),
            });
        } catch (err) {
            console.error('Failed to update profile on backend:', err);
        }
        
        await registerSession(auth.currentUser.uid);
        setCurrentUser({ ...auth.currentUser });
    };

    // ── Account Linking ───────────────────────────────────────────
    const linkWithGoogle = async () => {
        if (!auth.currentUser) return;
        const { linkWithPopup } = await import('firebase/auth');
        await linkWithPopup(auth.currentUser, googleProvider);
        setCurrentUser({ ...auth.currentUser });
    };

    const linkWithGithub = async () => {
        if (!auth.currentUser) return;
        const { linkWithPopup } = await import('firebase/auth');
        await linkWithPopup(auth.currentUser, githubProvider);
        setCurrentUser({ ...auth.currentUser });
    };

    // ── Logout ────────────────────────────────────────────────────
    const logout = async () => {
        if (currentUser) {
            const sessionId = localStorage.getItem('currentSessionId');
            if (sessionId) {
                try {
                    await fetch(`${API_BASE}/api/auth/session/${currentUser.uid}/${sessionId}`, {
                        method: 'DELETE',
                    });
                } catch (err) {
                    console.error('Failed to remove session:', err);
                }
                localStorage.removeItem('currentSessionId');
            }
        }
        return signOut(auth);
    };

    const value = {
        currentUser,
        loginWithGoogle,
        loginWithGithub,
        signupWithEmail,
        loginWithEmail,
        sendMagicLink,
        signInWithMagicLink,
        updateUserProfile,
        linkWithGoogle,
        linkWithGithub,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
