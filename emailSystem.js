const nodemailer = require("nodemailer")

/**
 * Sends an email. Currently outputs to console only.
 * Interface matches what a real email system would require.
 * @param {string} to - recipient email address
 * @param {string} subject - email subject
 * @param {string} body - email body
 * @returns {Promise<void>}
 */
async function sendEmail(to, subject, body) {
    console.log("=== EMAIL SENT ===")
    console.log("To: " + to)
    console.log("Subject: " + subject)
    console.log("Body: " + body)
    console.log("=================")
}

/**
 * Sends a 2FA code to the user.
 * @param {string} email - recipient email address
 * @param {string} code - the 6-digit 2FA code
 * @returns {Promise<void>}
 */
async function send2FACode(email, code) {
    await sendEmail(
        email,
        "Your 2FA Code",
        "Your verification code is: " + code + "\nThis code expires in 3 minutes."
    )
}

/**
 * Sends a suspicious activity warning to the user.
 * @param {string} email - recipient email address
 * @returns {Promise<void>}
 */
async function sendSuspiciousActivityEmail(email) {
    await sendEmail(
        email,
        "Suspicious Activity Detected",
        "There have been multiple failed login attempts on your account. If this was not you, please contact support."
    )
}

/**
 * Sends an account locked notification to the user.
 * @param {string} email - recipient email address
 * @returns {Promise<void>}
 */
async function sendAccountLockedEmail(email) {
    await sendEmail(
        email,
        "Account Locked",
        "Your account has been locked due to too many failed login attempts. Please contact support."
    )
}

module.exports = {
    send2FACode,
    sendSuspiciousActivityEmail,
    sendAccountLockedEmail
}