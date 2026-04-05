const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config()

const dbName = "infs3201_winter2026"

let client = null
let db = null

/**
 * connects to mongodb once and reuses the connection
 * @returns {Promise<import("mongodb").Db>}
 */
async function connect() {
    if (db) {
        return db
    }

    const mongoUrl = process.env.MONGO_URL
    if (!mongoUrl) {
        throw new Error("MONGO_URL is missing in .env")
    }

    client = new MongoClient(mongoUrl)
    await client.connect()
    db = client.db(dbName)

    return db
}

/**
 * returns all employees
 * @returns {Promise<Array>}
 */
async function getEmployees() {
    const database = await connect()
    return await database.collection("employees").find({}).toArray()
}

/**
 * finds one employee by their ObjectId
 * @param {string} id - the string version of the ObjectId
 * @returns {Promise<Object|null>}
 */
async function findEmployee(id) {
    const database = await connect()
    return await database.collection("employees").findOne({ _id: new ObjectId(id) })
}

/**
 * returns all shifts
 * @returns {Promise<Array>}
 */
async function getShifts() {
    const database = await connect()
    return await database.collection("shifts").find({}).toArray()
}

/**
 * finds one shift by its ObjectId
 * @param {string} id - the string version of the ObjectId
 * @returns {Promise<Object|null>}
 */
async function findShift(id) {
    const database = await connect()
    return await database.collection("shifts").findOne({ _id: new ObjectId(id) })
}

/**
 * returns all shifts that contain the employee's ObjectId in their employees array
 * sorted by date then startTime (ascending)
 * @param {string} id - the string version of the employee's ObjectId
 * @returns {Promise<Array>}
 */
async function getEmployeeShifts(id) {
    const database = await connect()

    const shifts = await database
        .collection("shifts")
        .find({ employees: new ObjectId(id) })
        .toArray()

    // manual sort (no .sort())
    for (let i = 0; i < shifts.length; i++) {
        for (let j = 0; j < shifts.length - 1; j++) {
            const aKey = shifts[j].date + shifts[j].startTime
            const bKey = shifts[j + 1].date + shifts[j + 1].startTime

            if (aKey > bKey) {
                const temp = shifts[j]
                shifts[j] = shifts[j + 1]
                shifts[j + 1] = temp
            }
        }
    }

    return shifts
}

/**
 * updates employee name and phone by ObjectId
 * @param {string} id - the string version of the ObjectId
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(id, name, phone) {
    const database = await connect()

    await database.collection("employees").updateOne(
        { _id: new ObjectId(id) },
        {
            $set: {
                name: name,
                phone: phone
            }
        }
    )
}
/**
 * finds a user by username
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function findUser(username) {
    const database = await connect()
    return await database.collection("users").findOne({ username: username })
}

/**
 * saves a session to the database
 * @param {string} key - the session key
 * @param {Date} expiry - the expiry date
 * @param {Object} data - the session data
 * @returns {Promise<void>}
 */
async function saveSession(key, expiry, data) {
    const database = await connect()
    await database.collection("sessions").insertOne({ key: key, expiry: expiry, data: data })
}

/**
 * gets a session by key
 * @param {string} key
 * @returns {Promise<Object|null>}
 */
async function getSession(key) {
    const database = await connect()
    return await database.collection("sessions").findOne({ key: key })
}

/**
 * deletes a session by key
 * @param {string} key
 * @returns {Promise<void>}
 */
async function deleteSession(key) {
    const database = await connect()
    await database.collection("sessions").deleteOne({ key: key })
}

/**
 * updates the expiry of a session by key
 * @param {string} key
 * @param {Date} expiry
 * @returns {Promise<void>}
 */
async function updateSessionExpiry(key, expiry) {
    const database = await connect()
    await database.collection("sessions").updateOne(
        { key: key },
        { $set: { expiry: expiry } }
    )
}
/**
 * saves a security log entry to the database
 * @param {string} username - the logged in user or "unknown"
 * @param {string} url - the URL accessed
 * @param {string} method - GET or POST
 * @returns {Promise<void>}
 */
async function logAccess(username, url, method) {
    const database = await connect()
    await database.collection("security_log").insertOne({
        timestamp: new Date(),
        username: username,
        url: url,
        method: method
    })
}
/**
 * saves a 2FA code for a user with expiry
 * @param {string} username
 * @param {string} code
 * @param {Date} expiry
 * @returns {Promise<void>}
 */
async function save2FACode(username, code, expiry) {
    const database = await connect()
    await database.collection("twofa").deleteMany({ username: username })
    await database.collection("twofa").insertOne({ username: username, code: code, expiry: expiry })
}

/**
 * gets a 2FA code for a user
 * @param {string} username
 * @returns {Promise<Object|null>}
 */
async function get2FACode(username) {
    const database = await connect()
    return await database.collection("twofa").findOne({ username: username })
}

/**
 * deletes a 2FA code for a user
 * @param {string} username
 * @returns {Promise<void>}
 */
async function delete2FACode(username) {
    const database = await connect()
    await database.collection("twofa").deleteOne({ username: username })
}

/**
 * increments failed login attempts for a user
 * @param {string} username
 * @returns {Promise<void>}
 */
async function incrementFailedAttempts(username) {
    const database = await connect()
    await database.collection("users").updateOne(
        { username: username },
        { $inc: { failedAttempts: 1 } }
    )
}

/**
 * resets failed login attempts for a user
 * @param {string} username
 * @returns {Promise<void>}
 */
async function resetFailedAttempts(username) {
    const database = await connect()
    await database.collection("users").updateOne(
        { username: username },
        { $set: { failedAttempts: 0 } }
    )
}

/**
 * locks a user account
 * @param {string} username
 * @returns {Promise<void>}
 */
async function lockAccount(username) {
    const database = await connect()
    await database.collection("users").updateOne(
        { username: username },
        { $set: { locked: true } }
    )
}

const fs = require("fs")
const path = require("path")

/**
 * returns list of documents for an employee
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getEmployeeDocuments(employeeId) {
    const database = await connect()
    return await database.collection("documents").find({ employeeId: employeeId }).toArray()
}

/**
 * saves a document record for an employee
 * @param {string} employeeId
 * @param {string} filename
 * @param {string} originalName
 * @returns {Promise<void>}
 */
async function saveDocument(employeeId, filename, originalName) {
    const database = await connect()
    await database.collection("documents").insertOne({
        employeeId: employeeId,
        filename: filename,
        originalName: originalName,
        uploadedAt: new Date()
    })
}

/**
 * counts documents for an employee
 * @param {string} employeeId
 * @returns {Promise<number>}
 */
async function countDocuments(employeeId) {
    const database = await connect()
    return await database.collection("documents").countDocuments({ employeeId: employeeId })
}
module.exports = {
    getEmployees,
    findEmployee,
    getShifts,
    findShift,
    getEmployeeShifts,
    updateEmployee,
    findUser,
    saveSession,
    getSession,
    deleteSession,
    updateSessionExpiry,
    logAccess,
    save2FACode,
    get2FACode,
    delete2FACode,
    incrementFailedAttempts,
    resetFailedAttempts,
    lockAccount,
    getEmployeeDocuments,
    saveDocument,
    countDocuments
}