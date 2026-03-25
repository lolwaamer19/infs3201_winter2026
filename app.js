const express = require("express")
const exphbs = require("express-handlebars")
const business = require("./business")
require("dotenv").config()

const app = express()
const PORT = 8000

app.use(express.urlencoded({ extended: false }))

/**
 * Configures handlebars, defines routes, and starts the Express server.
 * @returns {void}
 */
function startServer() {
  // handlebars setup
  app.engine("handlebars", exphbs.engine({ defaultLayout: false }))
  app.set("view engine", "handlebars")
  app.set("views", "./views")

  /**
   * Landing page: list all employees as links.
   * @route GET /
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns {Promise<void>}
   */
  app.get("/", async function (req, res) {
    const employees = await business.listEmployees()
    res.render("home", { employees: employees })
  })

  /**
   * Employee details page: shows employee info + shifts.
   * @route GET /employee/:id
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns {Promise<void>}
   */
  app.get("/employee/:id", async function (req, res) {
    const employeeId = (req.params.id || "").trim()
    const result = await business.getEmployeeDetails(employeeId)

    if (!result.success) {
      res.status(404).send(result.message)
      return
    }

    res.render("employees", {
      employee: result.employee,
      shifts: result.shifts
    })
  })

  /**
   * Shows edit form with prefilled employee data.
   * @route GET /edit/:id
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns {Promise<void>}
   */
  app.get("/edit/:id", async function (req, res) {
    const employeeId = (req.params.id || "").trim()
    const result = await business.getEmployeeDetails(employeeId)

    if (!result.success) {
      res.status(404).send(result.message)
      return
    }

    res.render("edit", { employee: result.employee })
  })

  /**
   * Handles edit form submit (server-side validation is inside business layer).
   * Uses PRG: redirects to /employee/:id on success.
   * @route POST /edit/:id
   * @param {import("express").Request} req
   * @param {import("express").Response} res
   * @returns {Promise<void>}
   */
  app.post("/edit/:id", async function (req, res) {
    const employeeId = (req.params.id || "").trim()

    const result = await business.editEmployee(
      employeeId,
      req.body.name,
      req.body.phone
    )

    if (!result.success) {
      res.send(result.message)
      return
    }

    res.redirect("/employee/" + employeeId)
  })

  // start server (after routes)
  app.listen(PORT, function () {
    console.log("Server running on http://127.0.0.1:" + PORT)
  })
}

startServer()