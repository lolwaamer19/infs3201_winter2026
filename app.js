

const fs = require("fs/promises")
const promptSync = require("prompt-sync")
const prompt = promptSync({ sigint: true })

const EMP_FILE = "./employees.json"
const SHIFT_FILE = "./shifts.json"
const ASSIGN_FILE = "./assignments.json"

//file helpers
async function readFileJson(fileName) {
    try {
        const text = await fs.readFile(fileName, "utf-8")
        return JSON.parse(text)
    } catch (err) {
        return []
    }
}

async function writeFileJson(fileName, data) {
    const text = JSON.stringify(data, null, 4)
    await fs.writeFile(fileName, text, "utf-8")
}

//search helpers
function findEmployee(employees, employeeId) {
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeId) {
            return employees[i]
        }
    }
    return null
}

function findShift(shifts, shiftId) {
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftId) {
            return shifts[i]
        }
    }
    return null
}

function assignmentAlreadyExists(assignments, employeeId, shiftId) {
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId && assignments[i].shiftId === shiftId) {
            return true
        }
    }
    return false
}

// menu options
async function showAllEmployees() {
    const employees = await readFileJson(EMP_FILE)

    console.log("Employee ID   Name                 Phone")
    console.log("-----------   -------------------- ---------")

    // find longest name
    let nameWidth = 4
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].name.length > nameWidth) {
            nameWidth = employees[i].name.length
        }
    }

    for (let i = 0; i < employees.length; i++) {
        const emp = employees[i]

        const idText = emp.employeeId.padEnd(13, " ")
        const nameText = emp.name.padEnd(nameWidth + 3, " ")

        console.log(idText + nameText + emp.phone)
    }
}


async function addNewEmployee() {
    const name = prompt("Enter employee name: ").trim()
    const phone = prompt("Enter phone number: ").trim()

    const employees = await readFileJson(EMP_FILE)

    // find biggest number in IDs exE001, E002...
    let biggest = 0
    for (let i = 0; i < employees.length; i++) {
        const id = employees[i].employeeId // "E005"
        const num = parseInt(id.substring(1), 10)
        if (num > biggest) {
            biggest = num
        }
    }

    const nextNumber = biggest + 1

    // make it 3 digits (001, 002, 010, 100)
    let numText = String(nextNumber)
    while (numText.length < 3) {
        numText = "0" + numText
    }

    const newEmployee = {
        employeeId: "E" + numText,
        name: name,
        phone: phone
    }

    employees.push(newEmployee)
    await writeFileJson(EMP_FILE, employees)

    console.log("Employee added...")
}

async function assignEmployeeToShift() {
    const employeeId = prompt("Enter employee ID: ").trim()
    const shiftId = prompt("Enter shift ID: ").trim()

    const employees = await readFileJson(EMP_FILE)
    const shifts = await readFileJson(SHIFT_FILE)
    const assignments = await readFileJson(ASSIGN_FILE)

    // check employee exists
    let employeeFound = false
    for (let i = 0; i < employees.length; i++) {
        if (employees[i].employeeId === employeeId) {
            employeeFound = true
        }
    }
    if (employeeFound === false) {
        console.log("Employee does not exist")
        return
    }

    // check shift exists
    let shiftFound = false
    for (let i = 0; i < shifts.length; i++) {
        if (shifts[i].shiftId === shiftId) {
            shiftFound = true
        }
    }
    if (shiftFound === false) {
        console.log("Shift does not exist")
        return
    }

    // check duplicate assignment (employeeId + shiftId)
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId && assignments[i].shiftId === shiftId) {
            console.log("Employee already assigned to shift")
            return
        }
    }

    // add assignment
    assignments.push({ employeeId: employeeId, shiftId: shiftId })
    await writeFileJson(ASSIGN_FILE, assignments)

    console.log("Shift Recorded")
}


async function viewEmployeeSchedule() {
    const employeeId = prompt("Enter employee ID: ").trim()

    const employees = await readFileJson(EMP_FILE)
    const shifts = await readFileJson(SHIFT_FILE)
    const assignments = await readFileJson(ASSIGN_FILE)

    console.log("date,startTime,endTime")

    // if employee not found = header only
    if (findEmployee(employees, employeeId) === null) {
        return
    }

    // print shifts for certian employee
    for (let i = 0; i < assignments.length; i++) {
        if (assignments[i].employeeId === employeeId) {
            const shift = findShift(shifts, assignments[i].shiftId)
            if (shift !== null) {
                console.log(shift.date + "," + shift.startTime + "," + shift.endTime)
            }
        }
    }
}

//main loop
function printMenu() {
    console.log("\n1. Show all employees")
    console.log("2. Add new employee")
    console.log("3. Assign employee to shift")
    console.log("4. View employee schedule")
    console.log("5. Exit")
}

async function main() {
    while (true) {
        printMenu()
        const choice = prompt("What is your choice> ").trim()

        if (choice === "1") {
            await showAllEmployees()
        } else if (choice === "2") {
            await addNewEmployee()
        } else if (choice === "3") {
            await assignEmployeeToShift()
        } else if (choice === "4") {
            await viewEmployeeSchedule()
        } else if (choice === "5") {
            break
        } else {
            console.log("Invalid choice")
        }
    }
}

main()
