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



module.exports = {
    listEmployees,
    listShifts,
    computeShiftDuration
}