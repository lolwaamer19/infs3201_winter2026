const { MongoClient, ObjectId } = require("mongodb")
require("dotenv").config()

let client = null
let db = null

/**
 * Connects to MongoDB database.
 * @returns {Promise<void>}
 */
async function connect() {
    client = new MongoClient(process.env.MONGO_URL)
    await client.connect()
    db = client.db("infs3201_winter2026")
}

/**
 * Closes the MongoDB connection.
 * @returns {Promise<void>}
 */
async function disconnect() {
    await client.close()
}

/**
 * Step 1: Adds an empty employees array to every shift document.
 * @returns {Promise<void>}
 */
async function addEmptyEmployeesArray() {
    const shifts = db.collection("shifts")
    const allShifts = await shifts.find({}).toArray()

    for (let i = 0; i < allShifts.length; i++) {
        await shifts.updateOne(
            { _id: allShifts[i]._id },
            { $set: { employees: [] } }
        )
    }

    console.log("Step 1 done: added empty employees array to all shifts")
}

/**
 * Step 2: Reads all assignments and pushes each employee's ObjectId
 * into the corresponding shift's employees array.
 * @returns {Promise<void>}
 */
async function embedEmployeesInShifts() {
    const assignments = db.collection("assignments")
    const shifts = db.collection("shifts")
    const employees = db.collection("employees")

    const allAssignments = await assignments.find({}).toArray()

    for (let i = 0; i < allAssignments.length; i++) {
        const assignment = allAssignments[i]

        const employee = await employees.findOne({ employeeId: assignment.employeeId })
        if (!employee) {
            console.log("Employee not found: " + assignment.employeeId)
            continue
        }

        const shift = await shifts.findOne({ shiftId: assignment.shiftId })
        if (!shift) {
            console.log("Shift not found: " + assignment.shiftId)
            continue
        }

        await shifts.updateOne(
            { _id: shift._id },
            { $push: { employees: employee._id } }
        )
    }

    console.log("Step 2 done: embedded employee ObjectIds into shifts")
}

