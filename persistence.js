const fs = require("fs/promises")

const empFile = "./employees.json"
const shiftFile = "./shifts.json"
const assignFile = "./assignments.json"
const configFile = "./config.json"

/**
 * Reads JSON file safely
 */
/**
 * Reads JSON file safely (returns [] on error)
 * @param {string} file
 * @returns {Promise<Array>}
 */
async function readJson(file) {
    try {
        const text = await fs.readFile(file, "utf-8")
        return JSON.parse(text)
    } catch (err) {
        const debugLevel = getDebugLevel()

        if (debugLevel >= 1) {
            console.log("Error reading file: " + file)
        }

        if (debugLevel >= 2) {
            console.log(err)
        }

        return []
    }
}

/**
 * Returns DEBUG_LEVEL as a number (0, 1, 2...)
 * @returns {number}
 */
function getDebugLevel() {
    const raw = process.env.DEBUG_LEVEL
    const level = parseInt(raw, 10)

    if (isNaN(level)) {
        return 0
    }

    return level
}

/**
 * Writes data to JSON file
 */
async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2))
}

/**
 * Returns all employees
 */
async function getEmployees() {
    return await readJson(empFile)
}

/**
 * Finds employee by ID
 */
async function findEmployee(employeeId) {
    const employees = await readJson(empFile)
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeId) {
            return employees[i]
        }
    }
    return null
}

/**
 * Returns all shifts
 */
async function getShifts() {
    return await readJson(shiftFile)
}

/**
 * Finds shift by ID
 */
async function findShift(shiftId) {
    const shifts = await readJson(shiftFile)

    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftId) {
            return shifts[i]
        }
    }

    return null
}


/**
 * Returns all assignments
 */
async function getAssignments() {
    return await readJson(assignFile)
}

/**
 * Finds assignment
 */
async function findAssignment(employeeId, shiftId) {
    const assignments = await readJson(assignFile)
    for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i]
        if (a.employeeId === employeeId && a.shiftId === shiftId) {
            return a
        }
    }
    return null
}

/**
 * Adds assignment
 */
async function addAssignment(employeeId, shiftId) {
    const assignments = await readJson(assignFile)
    assignments.push({ employeeId, shiftId })
    await writeJson(assignFile, assignments)
}

/**
 * Reads maxDailyHours from config
 */
async function getMaxDailyHours() {
    const cfg = await readJson(configFile)
    return cfg.maxDailyHours || 0
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
