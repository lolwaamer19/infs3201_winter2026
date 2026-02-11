const store = require("./persistence")

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

    const shift = await store.findShift(shiftId)
    if (shift === null) {
        return { success: false, message: "Shift not found." }
    }

    const existingAssignment = await store.findAssignment(employeeId, shiftId)
    if (existingAssignment !== null) {
        return { success: false, message: "Employee already assigned to this shift." }
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
