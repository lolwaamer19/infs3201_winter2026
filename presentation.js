const prompt = require("prompt-sync")()
const business = require("./business")
require("dotenv").config()

/**
 * Displays the main menu and handles user input.
 * Repeats until the user chooses to exit.
 * @returns {Promise<void>}
 */
async function mainMenu() {
    while (true) {
        console.log("\n=== Employee Scheduling System ===")
        console.log("1) List Employees")
        console.log("2) List Shifts")
        
        console.log("3) Exit")

        const choice = prompt("Choose option: ").trim()

        if (choice === "1") {
            await uiListEmployees()
        } else if (choice === "2") {
            await uiListShifts()
        }  else if (choice === "3") {
            console.log("Goodbye!")
            break
        } else {
            console.log("Invalid option.")
        }
    }
}

/**
 * Retrieves and prints all employees.
 * @returns {Promise<void>}
 */
async function uiListEmployees() {
    const employees = await business.listEmployees()

    if (employees.length === 0) {
        console.log("No employees found.")
        return
    }

    console.log("\nEmployees:")
    for (let i = 0; i < employees.length; i++) {
        console.log("- " + employees[i].employeeId + ": " + employees[i].name)
    }
}

/**
 * Retrieves and prints all shifts.
 * @returns {Promise<void>}
 */
async function uiListShifts() {
    const shifts = await business.listShifts()

    if (shifts.length === 0) {
        console.log("No shifts found.")
        return
    }

    console.log("\nShifts:")
    for (let i = 0; i < shifts.length; i++) {
        const s = shifts[i]
        console.log("- " + s.shiftId + ": " + s.date)
    }
}

/**
 * Retrieves and prints all assignments.
 * @returns {Promise<void>}
 */
async function uiListAssignments() {
    const assignments = await business.listAssignments()

    if (assignments.length === 0) {
        console.log("No assignments found.")
        return
    }

    console.log("\nAssignments:")
    for (let i = 0; i < assignments.length; i++) {
        const a = assignments[i]
        console.log("- Employee " + a.employeeId + " -> Shift " + a.shiftId)
    }
}

mainMenu()

