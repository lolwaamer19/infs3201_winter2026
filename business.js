const store = require("./persistence")

/**
 * Returns all employees
 */
async function listEmployees() {
    return await store.getEmployees()
}

/**
 * Returns all shifts
 */
async function listShifts() {
    return await store.getShifts()
}

/**
 * Returns all assignments
 */
async function listAssignments() {
    return await store.getAssignments()
}




/**
 * Computes the duration of a shift in hours.
 *
 * LLM used: ChatGPT (OpenAI)
 * Prompt: "Write a JavaScript function computeShiftDuration(startTime, endTime)
 * that returns the number of hours as a real number between two times in HH:MM format."
 *
 * @param {string} startTime - Shift start time (HH:MM)
 * @param {string} endTime - Shift end time (HH:MM)
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
 * Assigns employee to shift with hour limit check
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
            if (s !== null && s.day === newShift.day) {
                totalHours += computeShiftDuration(s.start, s.end)

            }
        }
    }

    if (totalHours + computeShiftDuration(newShift.start, newShift.end) > maxDailyHours) {
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
