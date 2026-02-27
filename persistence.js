const { MongoClient } = require("mongodb")

/**
 * MongoDB connection string.
 * Replace with your MongoDB Atlas connection string.
 */
const url = "mongodb+srv://60105155:<QATAr2022@@>@cluster0.kbxji.mongodb.net/?appName=Cluster0"

/**
 * Database name required by assignment instructions.
 */
const dbName = "infs3201_winter2026"

let db = null

/**
 * Establishes a connection to MongoDB (singleton pattern).
 * Ensures only one connection is created.
 * @returns {Promise<Object>} MongoDB database instance
 */
async function connect() {
    if (!db) {
        const client = new MongoClient(url)
        await client.connect()
        db = client.db(dbName)
    }
    return db
}

/**
 * Returns all employees from the employees collection.
 * @returns {Promise<Array>}
 */
async function getEmployees() {
    const database = await connect()
    return await database
        .collection("employees")
        .find({})
        .toArray()
}

/**
 * Finds an employee by employeeId.
 * Uses MongoDB findOne for efficiency (no full collection iteration).
 * @param {string} employeeId Employee ID
 * @returns {Promise<Object|null>}
 */
async function findEmployee(employeeId) {
    const database = await connect()
    return await database
        .collection("employees")
        .findOne({ employeeId: employeeId })
}

/**
 * Returns all shifts from the shifts collection.
 * @returns {Promise<Array>}
 */
async function getShifts() {
    const database = await connect()
    return await database
        .collection("shifts")
        .find({})
        .toArray()
}

/**
 * Finds a shift by shiftId.
 * Uses MongoDB findOne instead of manual looping.
 * @param {string} shiftId Shift ID
 * @returns {Promise<Object|null>}
 */
async function findShift(shiftId) {
    const database = await connect()
    return await database
        .collection("shifts")
        .findOne({ shiftId: shiftId })
}

/**
 * Returns all assignments.
 * (Keep collection even if not currently used,
 * since assignment instructions say not to change schema.)
 * @returns {Promise<Array>}
 */
async function getAssignments() {
    const database = await connect()
    return await database
        .collection("assignments")
        .find({})
        .toArray()
}

/**
 * Finds an assignment by employeeId and shiftId.
 * @param {string} employeeId Employee ID
 * @param {string} shiftId Shift ID
 * @returns {Promise<Object|null>}
 */
async function findAssignment(employeeId, shiftId) {
    const database = await connect()
    return await database
        .collection("assignments")
        .findOne({
            employeeId: employeeId,
            shiftId: shiftId
        })
}

/**
 * Adds a new assignment document to the assignments collection.
 * @param {string} employeeId Employee ID
 * @param {string} shiftId Shift ID
 * @returns {Promise<void>}
 */
async function addAssignment(employeeId, shiftId) {
    const database = await connect()
    await database
        .collection("assignments")
        .insertOne({
            employeeId: employeeId,
            shiftId: shiftId
        })
}

/**
 * Returns maxDailyHours configuration.
 * Assignment instructions state configuration
 * is NOT stored in the database.
 * @returns {number}
 */
function getMaxDailyHours() {
    return 8
}

module.exports = {
    getEmployees,
    findEmployee,
    getShifts,
    findShift,
    getAssignments,
    findAssignment,
    addAssignment,
    getMaxDailyHours
}