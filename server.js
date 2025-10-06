const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const dotenv = require("dotenv");


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect((err) => {
  if (err) {
    console.error("DB connection error:", err);
  } else {
    console.log("✅ Connected to Railway MySQL!");
  }
});

// ✅ Get all users
app.get("/api/users", (req, res) => {
  db.query("SELECT * FROM users ORDER BY id DESC", (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results);
  });
});

// ✅ Add new user
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  db.query("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User added successfully" });
  });
});

// ✅ Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.query("UPDATE users SET name=?, email=? WHERE id=?", [name, email, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User updated successfully" });
  });
});

// ✅ Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM users WHERE id=?", [id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "User deleted successfully" });
  });
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
