const prompt = require("prompt-sync")()
const business = require("./business")
require("dotenv").config()


/**
 * Displays main menu and handles user choices
 */
async function mainMenu() {
    while (true) {
        console.log("\n=== Employee Scheduling System ===")
        console.log("1) List Employees")
        console.log("2) List Shifts")
        console.log("3) List Assignments")
        console.log("4) Assign Employee to Shift")
        console.log("5) Exit")

        const choice = prompt("Choose option: ").trim()

        if (choice === "1") {
            await uiListEmployees()
        } else if (choice === "2") {
            await uiListShifts()
        } else if (choice === "3") {
            await uiListAssignments()
        } else if (choice === "4") {
            await uiAssignShift()
        } else if (choice === "5") {
            console.log("Goodbye!")
            break
        } else {
            console.log("Invalid option.")
        }
    }
}

/**
 * Prints all employees
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
 * Prints all shifts
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
 * Prints all assignments
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

/**
 * Assigns an employee to a shift
 */
async function uiAssignShift() {
    const employeeId = prompt("Enter employee ID: ").trim()
    const shiftId = prompt("Enter shift ID: ").trim()

    const result = await business.assignShift(employeeId, shiftId)
    console.log(result.message)
}

mainMenu()


