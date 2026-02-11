const store = require("./persistence")


function timeToMinutes(timeStr) {
    const parts = timeStr.split(":")
    const h = parseInt(parts[0], 10)
    const m = parseInt(parts[1], 10)
    return (h * 60) + m
}

function shiftDurationHours(shift) {
    const startMin = timeToMinutes(shift.start)
    const endMin = timeToMinutes(shift.end)
    const diff = endMin - startMin
    return diff / 60
}

async function listEmployees() {
    return await store.getEmployees()
}

async function listShifts() {
    return await store.getShifts()
}

async function listAssignments() {
    return await store.getAssignments()
}

async function addEmployee(employee) {
    const existing = await store.findEmployee(employee.id)
    if (existing !== null) {
        return { success: false, message: "Employee already exists." }
    }

    await store.addEmployee(employee)
    return { success: true, message: "Employee added successfully." }
}

async function addShift(shift) {
    const existing = await store.findShift(shift.id)
    if (existing !== null) {
        return { success: false, message: "Shift already exists." }
    }

    await store.addShift(shift)
    return { success: true, message: "Shift added successfully." }
}

async function assignShift(employeeId, shiftId) {
    const employee = await store.findEmployee(employeeId)
    if (employee === null) {
        return { success: false, message: "Employee not found." }
    }

    const newShift = await store.findShift(shiftId)
    if (newShift === null) {
        return { success: false, message: "Shift not found." }
    }

    const existingAssignment = await store.findAssignment(employeeId, shiftId)
    if (existingAssignment !== null) {
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
                totalHours = totalHours + shiftDurationHours(s)
            }
        }
    }

    const newHours = shiftDurationHours(newShift)
    const finalHours = totalHours + newHours

    if (finalHours > maxDailyHours) {
        return { success: false, message: "Cannot assign shift. Daily hours limit exceeded." }
    }

    await store.addAssignment(employeeId, shiftId)
    return { success: true, message: "Shift assigned successfully." }
}

module.exports = {
    listEmployees,
    listShifts,
    listAssignments,
    addEmployee,
    addShift,
    assignShift
}
