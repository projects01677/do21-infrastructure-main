import express from "express"
import fetch from "node-fetch"
import { port } from "./port"

const start = async () => {
  const maintenancePageHtml = await fetch("https://s3.amazonaws.com/whistle-error-pages/maintenance.html").then((response) =>
    response.text()
  )

  const app = express()

  app.get("/", (req, res) => {
    res.status(503).send(maintenancePageHtml)
  })

  app.listen(port, () => {
    console.log(`http://localhost:${port}`)
  })
}

start()
