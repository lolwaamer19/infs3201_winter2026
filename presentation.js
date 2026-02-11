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
      const employees = await business.listEmployees()
      if (employees.length === 0) console.log("No employees found.")
      else {
        console.log("\nEmployees:")
        for (const e of employees) {
          console.log(`- ${e.id}: ${e.name}`)
        }
      }
    }

    else if (choice === "2") {
      const shifts = await business.listShifts()
      if (shifts.length === 0) console.log("No shifts found.")
      else {
        console.log("\nShifts:")
        for (const s of shifts) {
          console.log(`- ${s.id}: ${s.day} ${s.start}-${s.end}`)
        }
      }
    }

    else if (choice === "3") {
      const assigns = await business.listAssignments()
      if (assigns.length === 0) console.log("No assignments found.")
      else {
        console.log("\nAssignments:")
        for (const a of assigns) {
          console.log(`- Employee ${a.employeeId} → Shift ${a.shiftId}`)
        }
      }
    }

    else if (choice === "4") {
      console.log("Goodbye!")
      break
    }

    else {
      console.log("Invalid option.")
    }
  }
}

mainMenu()

