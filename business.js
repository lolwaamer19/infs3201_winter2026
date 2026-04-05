const store = require("./persistence")

/**
 * Returns all employees.
 * @returns {Promise<Array>}
 */
async function listEmployees() {
    return await store.getEmployees()
}

/**
 * Returns all shifts.
 * @returns {Promise<Array>}
 */
async function listShifts() {
    return await store.getShifts()
    return await store.getEmployees()
}



/**
 * Computes the duration of a shift in hours.
 *
 * LLM used: ChatGPT (OpenAI)
 * Prompt used:
 * "Write a JavaScript function that calculates the number of hours
 * between a start time and end time given in HH:MM format."
 *
 * @param {string} startTime Shift start time (HH:MM)
 * @param {string} endTime Shift end time (HH:MM)
 * @returns {number} Duration in hours
 */
function computeShiftDuration(startTime, endTime) {
    const startParts = startTime.split(":")
    const endParts = endTime.split(":")

    const startMinutes = (parseInt(startParts[0], 10) * 60) + parseInt(startParts[1], 10)
    const endMinutes = (parseInt(endParts[0], 10) * 60) + parseInt(endParts[1], 10)

    return (endMinutes - startMinutes) / 60
}

/**
 * Returns employee + shifts (sorted by date/time) for details page.
 * Also adds "startClass" for highlighting times before 12:00.
 * @param {string} employeeId
 * @returns {Promise<{success:boolean, message:string, employee?:Object, shifts?:Array}>}
 */
async function getEmployeeDetails(employeeId) {
  const employee = await store.findEmployee(employeeId)
  if (!employee) {
    return { success: false, message: "Employee not found." }
  }

  const shifts = await store.getEmployeeShifts(employeeId)

  // add highlight class (no client-side JS)
  for (let i = 0; i < shifts.length; i++) {
    const start = shifts[i].startTime || ""
    shifts[i].startClass = start < "12:00" ? "beforeNoon" : ""
  }

  return { success: true, message: "OK", employee: employee, shifts: shifts }
}

/**
 * edits employee after validating inputs (server-side)
 * @param {string} employeeId
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<{success:boolean, message:string}>}
 */
async function editEmployee(employeeId, name, phone) {
  employeeId = (employeeId || "").trim()
  name = (name || "").trim()
  phone = (phone || "").trim()

  if (!employeeId) {
    return { success: false, message: "Employee ID is required." }
  }

  if (!name) {
    return { success: false, message: "Name must be non-empty." }
  }

  // must be 4 digits, dash, 4 digits
  const phoneOk = /^\d{4}-\d{4}$/.test(phone)
  if (!phoneOk) {
    return { success: false, message: "Phone number must be 4 digits, a dash, then 4 digits." }
  }

  const employee = await store.findEmployee(employeeId)
  if (!employee) {
    return { success: false, message: "Employee not found." }
  }

  await store.updateEmployee(employeeId, name, phone)
  return { success: true, message: "Updated." }
}

const crypto = require("crypto")
const { v4: uuidv4 } = require("uuid")

/**
 * checks login credentials and returns username if valid
 * @param {string} username
 * @param {string} password
 * @returns {Promise<string|undefined>}
 */
const emailSystem = require("./emailSystem")

/**
 * checks login credentials, handles account locking and failed attempts
 * @param {string} username
 * @param {string} password
 * @returns {Promise<{success:boolean, message:string}>}
 */
async function checkLogin(username, password) {
    const hashed = crypto.createHash("sha256").update(password).digest("hex")
    const user = await store.findUser(username)

    if (!user) {
        return { success: false, message: "Invalid username or password" }
    }

    if (user.locked) {
        return { success: false, message: "Account is locked. Please contact support." }
    }

    if (user.password !== hashed) {
        await store.incrementFailedAttempts(username)

        const updatedUser = await store.findUser(username)
        const attempts = updatedUser.failedAttempts

        if (attempts >= 10) {
            await store.lockAccount(username)
            await emailSystem.sendAccountLockedEmail(user.email)
            return { success: false, message: "Account locked due to too many failed attempts." }
        }

        if (attempts >= 3) {
            await emailSystem.sendSuspiciousActivityEmail(user.email)
        }

        return { success: false, message: "Invalid username or password" }
    }

    await store.resetFailedAttempts(username)
    return { success: true, message: "OK" }
}

/**
 * generates and saves a 6-digit 2FA code for a user
 * @param {string} username
 * @returns {Promise<string>}
 */
async function generate2FACode(username) {
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 3)
    await store.save2FACode(username, code, expiry)
    return code
}

/**
 * verifies a 2FA code for a user
 * @param {string} username
 * @param {string} code
 * @returns {Promise<boolean>}
 */
async function verify2FACode(username, code) {
    const record = await store.get2FACode(username)

    if (!record) {
        return false
    }

    if (new Date() > new Date(record.expiry)) {
        await store.delete2FACode(username)
        return false
    }

    if (record.code !== code) {
        return false
    }

    await store.delete2FACode(username)
    return true
}

/**
 * creates a new session and returns the session key
 * @param {string} username
 * @returns {Promise<string>}
 */
async function startSession(username) {
    const key = uuidv4()
    const expiry = new Date()
    expiry.setMinutes(expiry.getMinutes() + 5)
    await store.saveSession(key, expiry, { username: username })
    return key
}

/**
 * gets session data if session exists and is not expired
 * @param {string} key
 * @returns {Promise<Object|null>}
 */
async function getSessionData(key) {
    const session = await store.getSession(key)

    if (!session) {
        return null
    }

    // check if session is expired
    if (new Date() > new Date(session.expiry)) {
        await store.deleteSession(key)
        return null
    }

    // extend session by 5 more minutes
    const newExpiry = new Date()
    newExpiry.setMinutes(newExpiry.getMinutes() + 5)
    await store.updateSessionExpiry(key, newExpiry)

    return session.data
}

/**
 * deletes a session by key
 * @param {string} key
 * @returns {Promise<void>}
 */
async function deleteSession(key) {
    await store.deleteSession(key)
}

/**
 * logs a security access entry
 * @param {string} username
 * @param {string} url
 * @param {string} method
 * @returns {Promise<void>}
 */
async function logAccess(username, url, method) {
    await store.logAccess(username, url, method)
}
/**
 * gets a user by username
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function getUserByUsername(username) {
    return await store.findUser(username)
}

const path = require("path")
const fs = require("fs")

/**
 * uploads a document for an employee
 * @param {string} employeeId
 * @param {Object} file - the uploaded file object from multer
 * @returns {Promise<{success:boolean, message:string}>}
 */
async function uploadDocument(employeeId, file) {
    if (!file) {
        return { success: false, message: "No file uploaded." }
    }

    // check file type
    if (file.mimetype !== "application/pdf") {
        fs.unlinkSync(file.path)
        return { success: false, message: "Only PDF files are allowed." }
    }

    // check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
        fs.unlinkSync(file.path)
        return { success: false, message: "File must be less than 2MB." }
    }

    // check document count (max 5)
    const count = await store.countDocuments(employeeId)
    if (count >= 5) {
        fs.unlinkSync(file.path)
        return { success: false, message: "Maximum of 5 documents allowed per employee." }
    }

    await store.saveDocument(employeeId, file.filename, file.originalname)
    return { success: true, message: "Document uploaded successfully." }
}

/**
 * returns list of documents for an employee
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getEmployeeDocuments(employeeId) {
    return await store.getEmployeeDocuments(employeeId)
}

module.exports = {
    listEmployees,
    listShifts,
    computeShiftDuration,
    getEmployeeDetails,
    editEmployee,
    checkLogin,
    startSession,
    getSessionData,
    deleteSession,
    logAccess,
    checkLogin,
    generate2FACode,
    verify2FACode,
    getUserByUsername,
    uploadDocument,
    getEmployeeDocuments
}