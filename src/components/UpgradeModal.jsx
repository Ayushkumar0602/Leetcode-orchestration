import React, { useState } from 'react';
import { X, Zap, CheckCircle, Loader2 } from 'lucide-react';
import { sendPaymentSuccessEmail, sendPaymentFailedEmail } from '../utils/paymentEmails';

export default function UpgradeModal({ isOpen, onClose, user, onUpgradeSuccess }) {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            // 1. Create order on backend
            const res = await fetch('https://leetcode-orchestration.onrender.com/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            });
            const data = await res.json();

            if (!data.success) throw new Error("Could not create order");

            // 2. Open Razorpay Checkout modal
            const options = {
                key: data.key_id,
                amount: data.order.amount,
                currency: data.order.currency,
                name: "Whizan AI",
                description: "Upgrade to Blaze Plan",
                image: "/logo.jpeg",
                order_id: data.order.id,
                handler: async function (response) {
                    // 3. Verify payment on backend
                    const verifyRes = await fetch('https://leetcode-orchestration.onrender.com/api/verify-payment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            uid: user.uid
                        })
                    });
                    const verifyData = await verifyRes.json();
                    if (verifyData.success) {
                        // ✅ Send beautiful success email with bill
                        await sendPaymentSuccessEmail(
                            user,
                            response.razorpay_payment_id,
                            response.razorpay_order_id,
                            verifyData.expiryDate
                        );
                        onUpgradeSuccess();
                    } else {
                        alert("Payment verification failed.");
                    }
                },
                prefill: {
                    name: user.displayName || "User",
                    email: user.email || ""
                },
                theme: {
                    color: "#a855f7"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                // ❌ Send payment failure email with error details
                sendPaymentFailedEmail(
                    user,
                    response.error?.code,
                    response.error?.description
                );
                alert("Payment failed! Please try again.");
                console.error(response.error);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            alert("Upgrade failed to initiate. Check console.");
        } finally {
            setLoading(false);
            onClose(); // Close our internal modal React state, Razorpay modal handles its own open state
        }
    };

    return (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div style={{ background: '#0a0b12', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '24px', maxWidth: '420px', width: '100%', padding: '2rem', position: 'relative', animation: 'scaleIn 0.3s ease-out', boxShadow: '0 20px 50px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.05)' }}>
                <button onClick={onClose} style={{ position: 'absolute', top: '16px', right: '16px', background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', padding: '4px' }}>
                    <X size={20} />
                </button>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(168,85,247,0.2), rgba(59,130,246,0.1))', border: '1px solid rgba(168,85,247,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Zap size={32} color="#a855f7" />
                    </div>
                </div>

                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', textAlign: 'center', marginBottom: '8px', letterSpacing: '-0.03em' }}>
                    Upgrade to <span style={{ background: 'linear-gradient(135deg, #a855f7, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blaze</span>
                </h2>
                <p style={{ color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: '0.9rem', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    Unlock unlimited mock interviews, premium AI analysis, and advanced portfolio customizations.
                </p>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {[
                        'Unlimited AI mock interviews',
                        'Priority personalized feedback',
                        'Advanced layout templates',
                        'Pro badge on public profile'
                    ].map((feature, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.85rem', color: '#e2e8f0', fontWeight: 500 }}>
                            <CheckCircle size={16} color="#10b981" /> {feature}
                        </li>
                    ))}
                </ul>

                <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>One-time Upgrade</div>
                        <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)' }}>Lifetime access</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', display: 'flex', alignItems: 'flex-start' }}>
                        <span style={{ fontSize: '1rem', marginTop: '4px', marginRight: '2px', color: 'rgba(255,255,255,0.5)' }}>₹</span>30
                    </div>
                </div>

                <button
                    onClick={handleUpgrade}
                    disabled={loading}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #3b82f6)', color: '#fff', border: 'none', borderRadius: '14px', padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s', boxShadow: '0 10px 20px rgba(168,85,247,0.3)', opacity: loading ? 0.7 : 1 }}
                >
                    {loading ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</> : 'Pay ₹30 to Upgrade'}
                    <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
                </button>
                <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>
                    Secured by Razorpay. Test mode active.
                </div>
            </div>
            <style>{`@keyframes scaleIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } to { opacity: 1; transform: scale(1) translateY(0); } }`}</style>
        </div>
    );
}
