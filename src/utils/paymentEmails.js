import emailjs from '@emailjs/browser';

// Primary EmailJS Account (Success)
const SUCCESS_SERVICE_ID = 'service_3hcmwzo';
const SUCCESS_PUBLIC_KEY = 'jqVZqs-raFP7VHsqS';
const TEMPLATE_SUCCESS   = 'template_sltyg6u';

// Secondary EmailJS Account (Failed & Ended)
const FAILED_SERVICE_ID  = 'service_ifrkd2o';
const FAILED_PUBLIC_KEY  = 'yAHoktwg19W6fYRz9';
const TEMPLATE_FAILED    = 'template_m5klrh8';


/**
 * Format a date string nicely: "16 March 2026"
 */
function formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'long', year: 'numeric'
    });
}

/**
 * Send a payment success email with full bill details.
 * @param {object} user           - Firebase user object
 * @param {string} paymentId      - Razorpay payment ID (e.g. pay_XXXX)
 * @param {string} orderId        - Razorpay order ID (e.g. order_XXXX)
 * @param {string} expiryDateISO  - ISO string of plan expiry
 */
export async function sendPaymentSuccessEmail(user, paymentId, orderId, expiryDateISO) {
    try {
        const name = user.displayName || user.email?.split('@')[0] || 'there';
        await emailjs.send(
            SUCCESS_SERVICE_ID,
            TEMPLATE_SUCCESS,
            {
                to_name:     name,
                to_email:    user.email,
                payment_id:  paymentId,
                order_id:    orderId,
                amount:      '₹30',
                plan:        'Blaze',
                plan_expiry: formatDate(expiryDateISO),
                from_name:   'Whizan Team',
                reply_to:    'whizanai@gmail.com',
            },
            SUCCESS_PUBLIC_KEY
        );
        console.log('✅ Payment success email sent to', user.email);
    } catch (err) {
        console.error('⚠️ Payment success email failed (non-blocking):', err);
    }
}

/**
 * Send a payment failure email with error details.
 * @param {object} user              - Firebase user object
 * @param {string} errorCode         - Razorpay error code
 * @param {string} errorDescription  - Human-readable error description
 */
export async function sendPaymentFailedEmail(user, errorCode, errorDescription) {
    try {
        const name = user.displayName || user.email?.split('@')[0] || 'there';
        await emailjs.send(
            FAILED_SERVICE_ID,
            TEMPLATE_FAILED,
            {
                to_name:           name,
                to_email:          user.email,
                error_code:        errorCode        || 'UNKNOWN',
                error_description: errorDescription || 'An unexpected error occurred.',
                from_name:         'Whizan Team',
                reply_to:          'whizanai@gmail.com',
            },
            FAILED_PUBLIC_KEY
        );
        console.log('✅ Payment failed email sent to', user.email);
    } catch (err) {
        console.error('⚠️ Payment failed email error (non-blocking):', err);
    }
}
