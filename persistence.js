const fs = require("fs/promises")

const empFile = "./employees.json"
const shiftFile = "./shifts.json"
const assignFile = "./assignments.json"

async function readJson(file) {
    try {
        const text = await fs.readFile(file, "utf-8")
        return JSON.parse(text)
    } catch (err) {
        return []
    }
}

async function writeJson(file, data) {
    await fs.writeFile(file, JSON.stringify(data, null, 2))
}

/* -------- Employees -------- */

async function getEmployees() {
    return await readJson(empFile)
}

async function findEmployee(empId) {
    const employees = await readJson(empFile)

    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id === empId) {
            return employees[i]
        }
    }

    return null
}

async function addEmployee(employee) {
    const employees = await readJson(empFile)
    employees.push(employee)
    await writeJson(empFile, employees)
    return employee
}

async function updateEmployee(empId, newData) {
    const employees = await readJson(empFile)

    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id === empId) {
            const updated = employees[i]
            const keys = Object.keys(newData)

            for (let k = 0; k < keys.length; k++) {
                const key = keys[k]
                updated[key] = newData[key]
            }

            employees[i] = updated
            await writeJson(empFile, employees)
            return updated
        }
    }

    return null
}

async function deleteEmployee(empId) {
    const employees = await readJson(empFile)
    const kept = []
    let removed = false

    for (let i = 0; i < employees.length; i++) {
        if (employees[i].id === empId) {
            removed = true
        } else {
            kept.push(employees[i])
        }
    }

    if (!removed) {
        return false
    }

    await writeJson(empFile, kept)
    return true
}

/* -------- Shifts -------- */

async function getShifts() {
    return await readJson(shiftFile)
}

async function findShift(shiftId) {
    const shifts = await readJson(shiftFile)

    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].id === shiftId) {
            return shifts[i]
        }
    }

    return null
}

async function addShift(shift) {
    const shifts = await readJson(shiftFile)
    shifts.push(shift)
    await writeJson(shiftFile, shifts)
    return shift
}

async function updateShift(shiftId, newData) {
    const shifts = await readJson(shiftFile)

    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].id === shiftId) {
            const updated = shifts[i]
            const keys = Object.keys(newData)

            for (let k = 0; k < keys.length; k++) {
                const key = keys[k]
                updated[key] = newData[key]
            }

            shifts[i] = updated
            await writeJson(shiftFile, shifts)
            return updated
        }
    }

    return null
}

async function deleteShift(shiftId) {
    const shifts = await readJson(shiftFile)
    const kept = []
    let removed = false

    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].id === shiftId) {
            removed = true
        } else {
            kept.push(shifts[i])
        }
    }

    if (!removed) {
        return false
    }

    await writeJson(shiftFile, kept)
    return true
}

/* -------- Assignments -------- */

async function getAssignments() {
    return await readJson(assignFile)
}

async function findAssignment(employeeId, shiftId) {
    const assignments = await readJson(assignFile)

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i]
        if (assignment.employeeId === employeeId && assignment.shiftId === shiftId) {
            return assignment
        }
    }

    return null
}

async function addAssignment(employeeId, shiftId) {
    const assignments = await readJson(assignFile)
    const obj = { employeeId: employeeId, shiftId: shiftId }
    assignments.push(obj)
    await writeJson(assignFile, assignments)
    return obj
}

async function deleteAssignment(employeeId, shiftId) {
    const assignments = await readJson(assignFile)
    const kept = []
    let removed = false

    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i]
        if (assignment.employeeId === employeeId && assignment.shiftId === shiftId) {
            removed = true
        } else {
            kept.push(assignment)
        }
    }

    if (!removed) {
        return false
    }

    await writeJson(assignFile, kept)
    return true
}

module.exports = {
    getEmployees,
    findEmployee,
    addEmployee,
    updateEmployee,
    deleteEmployee,

    getShifts,
    findShift,
    addShift,
    updateShift,
    deleteShift,

    getAssignments,
    findAssignment,
    addAssignment,
    deleteAssignment
}
