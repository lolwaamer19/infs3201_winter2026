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
    return await store.getEmployees()
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
 * Returns employee + shifts (sorted by date/time) for details page.
 * Also adds "startClass" for highlighting times before 12:00.
 * @param {string} employeeId
 * @returns {Promise<{success:boolean, message:string, employee?:Object, shifts?:Array}>}
 */
async function getEmployeeDetails(employeeId) {
  const employee = await store.findEmployee(employeeId)
  if (!employee) {
    return { success: false, message: "Employee not found." }
  }

  const shifts = await store.getEmployeeShifts(employeeId)

  // add highlight class (no client-side JS)
  for (let i = 0; i < shifts.length; i++) {
    const start = shifts[i].startTime || ""
    shifts[i].startClass = start < "12:00" ? "beforeNoon" : ""
  }

  return { success: true, message: "OK", employee: employee, shifts: shifts }
}


module.exports = {
    listEmployees,
    listShifts,
    computeShiftDuration,
    getEmployeeDetails
}