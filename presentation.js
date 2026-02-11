const prompt = require("prompt-sync")()
const business = require("./business")

async function mainMenu() {
    while (true) {
        console.log("\n=== Employee Scheduling System ===")
        console.log("1) List Employees")
        console.log("2) List Shifts")
        console.log("3) List Assignments")
        console.log("4) Exit")

        const choice = prompt("Choose option: ").trim()

        if (choice === "1") {
            await uiListEmployees()
        } else if (choice === "2") {
            await uiListShifts()
        } else if (choice === "3") {
            await uiListAssignments()
        } else if (choice === "4") {
            console.log("Goodbye!")
            break
        } else {
            console.log("Invalid option.")
        }
    }
}

async function uiListEmployees() {
    const employees = await business.listEmployees()

    if (employees.length === 0) {
        console.log("No employees found.")
        return
    }

    console.log("\nEmployees:")
    for (let i = 0; i < employees.length; i++) {
        const employee = employees[i]
        console.log("- " + employee.id + ": " + employee.name)
    }
}

async function uiListShifts() {
    const shifts = await business.listShifts()

    if (shifts.length === 0) {
        console.log("No shifts found.")
        return
    }

    console.log("\nShifts:")
    for (let i = 0; i < shifts.length; i++) {
        const shift = shifts[i]
        console.log("- " + shift.id + ": " + shift.day + " " + shift.start + "-" + shift.end)
    }
}

async function uiListAssignments() {
    const assignments = await business.listAssignments()

    if (assignments.length === 0) {
        console.log("No assignments found.")
        return
    }

    console.log("\nAssignments:")
    for (let i = 0; i < assignments.length; i++) {
        const assignment = assignments[i]
        console.log("- Employee " + assignment.employeeId + " -> Shift " + assignment.shiftId)
    }
}

mainMenu()

