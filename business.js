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
 * Converts time string to minutes
 */
function timeToMinutes(timeStr) {
    const parts = timeStr.split(":")
    return (parseInt(parts[0], 10) * 60) + parseInt(parts[1], 10)
}

/**
 * Calculates shift duration in hours
 */
function shiftDurationHours(shift) {
    return (timeToMinutes(shift.end) - timeToMinutes(shift.start)) / 60
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
                totalHours += shiftDurationHours(s)
            }
        }
    }

    if (totalHours + shiftDurationHours(newShift) > maxDailyHours) {
        return { success: false, message: "Cannot assign shift. Daily hours limit exceeded." }
    }

    await store.addAssignment(employeeId, shiftId)
    return { success: true, message: "Shift assigned successfully." }
}

module.exports = {
    listEmployees,
    listShifts,
    listAssignments,
    assignShift
}
