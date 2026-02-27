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
}

/**
 * Returns all assignments.
 * @returns {Promise<Array>}
 */
async function listAssignments() {
    return await store.getAssignments()
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
 * Assigns an employee to a shift.
 * Validates employee, shift, duplicate assignment,
 * and enforces maxDailyHours limit.
 *
 * @param {string} employeeId Employee ID
 * @param {string} shiftId Shift ID
 * @returns {Promise<{success: boolean, message: string}>}
 */
async function assignShift(employeeId, shiftId) {
    const employee = await store.findEmployee(employeeId)
    if (employee === null) {
        return { success: false, message: "Employee not found." }
    }

    const newShift = await store.findShift(shiftId)
    if (newShift === null) {
        return { success: false, message: "Shift not found." }
    }

    const existing = await store.findAssignment(employeeId, shiftId)
    if (existing !== null) {
        return { success: false, message: "Employee already assigned to this shift." }
    }

    const maxDailyHours = await store.getMaxDailyHours()
    const assignments = await store.getAssignments()

    let totalHours = 0

    for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i]

        if (a.employeeId === employeeId) {
            const s = await store.findShift(a.shiftId)

            if (s !== null && s.date === newShift.date) {
                totalHours += computeShiftDuration(s.startTime, s.endTime)
            }
        }
    }

    const newShiftHours = computeShiftDuration(newShift.startTime, newShift.endTime)

    if (totalHours + newShiftHours > maxDailyHours) {
        return { success: false, message: "Cannot assign shift. Daily hours limit exceeded." }
    }

    await store.addAssignment(employeeId, shiftId)

    return { success: true, message: "Shift assigned successfully." }
}

module.exports = {
    listEmployees,
    listShifts,
    listAssignments,
    assignShift,
    computeShiftDuration
}