const express = require("express")
const exphbs = require("express-handlebars")
const business = require("./business")
require("dotenv").config()

const app = express()
const PORT = 8000

/**
 * Configures handlebars, defines routes,
 * and starts the Express server.
 *
 * @returns {void}
 */
function startServer() {
    app.engine("handlebars", exphbs.engine({ defaultLayout: false }))
    app.set("view engine", "handlebars")
    app.set("views", "./views")

    /**
     * GET /
     * Landing page.
     * Retrieves all employees from the business layer
     * and renders the home view.
     *
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     * @returns {Promise<void>}
     */
    app.get("/", async function (req, res) {
        const employees = await business.listEmployees()
        res.render("home", { employees: employees })
    })

    app.listen(PORT, function () {
        console.log("Server running on http://127.0.0.1:" + PORT)
    })
}

startServer()