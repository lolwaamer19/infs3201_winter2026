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
  const employees = await store.getEmployees()

  const exists = employees.find(e => e.id === employee.id)
  if (exists) {
    return { success: false, message: "Employee already exists." }
  }

  employees.push(employee)
  await store.saveEmployees(employees)

  return { success: true, message: "Employee added successfully." }
}

async function addShift(shift) {
  const shifts = await store.getShifts()

  const exists = shifts.find(s => s.id === shift.id)
  if (exists) {
    return { success: false, message: "Shift already exists." }
  }

  shifts.push(shift)
  await store.saveShifts(shifts)

  return { success: true, message: "Shift added successfully." }
}

async function assignShift(employeeId, shiftId) {
  const employees = await store.getEmployees()
  const shifts = await store.getShifts()
  const assignments = await store.getAssignments()

  const empExists = employees.find(e => e.id === employeeId)
  if (!empExists) {
    return { success: false, message: "Employee not found." }
  }

  const shiftExists = shifts.find(s => s.id === shiftId)
  if (!shiftExists) {
    return { success: false, message: "Shift not found." }
  }

  const alreadyAssigned = assignments.find(
    a => a.employeeId === employeeId && a.shiftId === shiftId
  )
  if (alreadyAssigned) {
    return { success: false, message: "Employee already assigned to this shift." }
  }

  assignments.push({ employeeId, shiftId })
  await store.saveAssignments(assignments)

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
