const express = require("express")
const exphbs = require("express-handlebars")
const business = require("./business")
require("dotenv").config()
const emailSystem = require("./emailSystem")
const app = express()
const PORT = 8000



app.use(express.urlencoded({ extended: false }))

const cookieParser = require("cookie-parser")
app.use(cookieParser())
/**
 * Middleware to check if user is logged in.
 * Skips check for /login and /logout routes.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
async function checkAuth(req, res, next) {
    if (req.path === "/login" || req.path === "/logout") {
        next()
        return
    }

    const key = req.cookies.sessionkey
    if (!key) {
        res.redirect("/login?message=Please log in first")
        return
    }

    const session = await business.getSessionData(key)
    if (!session) {
        res.redirect("/login?message=Session expired, please log in again")
        return
    }

    next()
}

app.use(checkAuth)
/**
 * Configures handlebars, defines routes, and starts the Express server.
 * @returns {void}
 */
/**
 * Middleware to log every request to the security_log collection.
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {Function} next
 * @returns {Promise<void>}
 */
async function logRequest(req, res, next) {
    const key = req.cookies.sessionkey
    let username = "unknown"

    if (key) {
        const session = await business.getSessionData(key)
        if (session) {
            username = session.username
        }
    }

    await business.logAccess(username, req.path, req.method)
    next()
}

app.use(logRequest)
function startServer() {
  // handlebars setup
  app.engine("handlebars", exphbs.engine({ defaultLayout: false }))
  app.set("view engine", "handlebars")
  app.set("views", "./views")
  /**
 * Shows the login page.
 * @route GET /login
 */
app.get("/login", function (req, res) {
    res.render("login", { message: req.query.message })
})

/**
 * Handles login form submit, validates credentials and sends 2FA code.
 * @route POST /login
 */
app.post("/login", async function (req, res) {
    const username = req.body.username
    const password = req.body.password

    const result = await business.checkLogin(username, password)

    if (!result.success) {
        res.redirect("/login?message=" + result.message)
        return
    }

    // generate and send 2FA code
    const code = await business.generate2FACode(username)
    const user = await business.getUserByUsername(username)
    await emailSystem.send2FACode(user.email, code)

    res.redirect("/twofa?username=" + username)
})

/**
 * Shows the 2FA code entry page.
 * @route GET /twofa
 */
app.get("/twofa", function (req, res) {
    res.render("2fa", { username: req.query.username, message: req.query.message })
})

/**
 * Handles 2FA code verification.
 * @route POST /twofa
 */
app.post("/twofa", async function (req, res) {
    const username = req.body.username
    const code = req.body.code

    const valid = await business.verify2FACode(username, code)

    if (!valid) {
        res.redirect("/twofa?username=" + username + "&message=Invalid or expired code")
        return
    }

    // start session only after 2FA is verified
    const key = await business.startSession(username)
    res.cookie("sessionkey", key)
    res.redirect("/")
})

/**
 * Handles logout.
 * @route GET /logout
 */
app.get("/logout", async function (req, res) {
    const key = req.cookies.sessionkey
    if (key) {
        await business.deleteSession(key)
    }
    res.clearCookie("sessionkey")
    res.redirect("/login")
})

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