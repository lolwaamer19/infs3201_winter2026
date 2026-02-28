const { MongoClient } = require("mongodb")
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
 * finds one employee by employeeId
 * @param {string} employeeId
 * @returns {Promise<Object|null>}
 */
async function findEmployee(employeeId) {
    const database = await connect()
    return await database.collection("employees").findOne({ employeeId: employeeId })
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
 * finds one shift by shiftId
 * @param {string} shiftId
 * @returns {Promise<Object|null>}
 */
async function findShift(shiftId) {
    const database = await connect()
    return await database.collection("shifts").findOne({ shiftId: shiftId })
}

/**
 * returns all assignments
 * @returns {Promise<Array>}
 */
async function getAssignments() {
    const database = await connect()
    return await database.collection("assignments").find({}).toArray()
}

/**
 * finds one assignment by employeeId and shiftId
 * @param {string} employeeId
 * @param {string} shiftId
 * @returns {Promise<Object|null>}
 */
async function findAssignment(employeeId, shiftId) {
    const database = await connect()
    return await database.collection("assignments").findOne({
        employeeId: employeeId,
        shiftId: shiftId
    })
}

/**
 * adds an assignment document
 * @param {string} employeeId
 * @param {string} shiftId
 * @returns {Promise<void>}
 */
async function addAssignment(employeeId, shiftId) {
    const database = await connect()
    await database.collection("assignments").insertOne({
        employeeId: employeeId,
        shiftId: shiftId
    })
}

/**
 * returns shifts for a specific employee
 * joins assignments with shifts collection
 * sorted by date then startTime (ascending)
 * @param {string} employeeId
 * @returns {Promise<Array>}
 */
async function getEmployeeShifts(employeeId) {
    const database = await connect()

    const assignments = await database
        .collection("assignments")
        .find({ employeeId: employeeId })
        .toArray()

    const shifts = []

    for (let i = 0; i < assignments.length; i++) {
        const shift = await database
            .collection("shifts")
            .findOne({ shiftId: assignments[i].shiftId })

        if (shift) {
            shifts.push(shift)
        }
    }
    /**
 * updates employee name and phone
 * uses updateOne as required by assignment
 * @param {string} employeeId
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<void>}
 */
async function updateEmployee(employeeId, name, phone) {
    const database = await connect()

    await database.collection("employees").updateOne(
        { employeeId: employeeId },
        {
            $set: {
                name: name,
                phone: phone
            }
        }
    )
}

    // simple manual sort (no array methods)
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

module.exports = {
    getEmployees,
    findEmployee,
    getShifts,
    findShift,
    getAssignments,
    findAssignment,
    addAssignment,
    getEmployeeShifts,
    updateEmployee
}