import express from "express"
import cors from "cors"
import dotenv from "dotenv"
import { createClient } from "@supabase/supabase-js"

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

app.get("/api/tasks", async (req, res) => {
  const { data, error } = await supabase.from("tasks").select("*")
  if (error) return res.status(400).json(error)
  res.json(data)
})

app.post("/api/tasks", async (req, res) => {
  const { title, description, category, priority, deadline } = req.body

  const { data, error } = await supabase
    .from("tasks")
    .insert([{ title, description, category, priority, deadline }])

  if (error) return res.status(400).json(error)
  res.json(data)
})

app.listen(5000, () => console.log("Server running on port 5000"))
