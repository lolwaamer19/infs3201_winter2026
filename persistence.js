const fs = require("fs/promises")

const empFile = "./employees.json"
const shiftFile = "./shifts.json"
const configFile = "./config.json"

/**
 * Reads a JSON file safely.
 * Returns an empty array if file read or parse fails.
 * @param {string} file Path to JSON file
 * @returns {Promise<Array|Object>} Parsed JSON content
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
 * Returns DEBUG_LEVEL as a number.
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
 * Writes data to a JSON file.
 * @param {string} file Path to JSON file
 * @param {Array|Object} data Data to write
 * @returns {Promise<void>}
 */
async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2))
}

/**
 * Returns all employees.
 * @returns {Promise<Array>}
 */
async function getEmployees() {
    return await readJson(empFile)
}

/**
 * Finds an employee by ID.
 * @param {string} employeeId Employee ID
 * @returns {Promise<Object|null>}
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
 * Returns all shifts.
 * @returns {Promise<Array>}
 */
async function getShifts() {
    return await readJson(shiftFile)
}

/**
 * Finds a shift by ID.
 * @param {string} shiftId Shift ID
 * @returns {Promise<Object|null>}
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
 * Returns the maxDailyHours value from config file.
 * @returns {Promise<number>}
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
    getMaxDailyHours
}
