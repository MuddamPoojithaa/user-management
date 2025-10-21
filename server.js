const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

<<<<<<< HEAD
dotenv.config();
=======
>>>>>>> ecb167b17549a5c6a6131ef9772dfd581c974159
const app = express();

app.use(cors());
app.use(express.json());

<<<<<<< HEAD
// ✅ MySQL Connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

db.connect((err) => {
  if (err) {
    console.error("❌ DB connection error:", err);
  } else {
    console.log("✅ Connected to Railway MySQL!");
  }
});

// ✅ Test API
app.get("/api/test", (req, res) => {
  db.query("SELECT NOW() AS now", (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json(result[0]);
  });
});


// ✅ 1️⃣ Get all users
app.get("/api/users", (req, res) => {
  const sql = "SELECT * FROM users ORDER BY id DESC";
  db.query(sql, (err, data) => {
    if (err) return res.status(500).json({ error: err });
    res.json(data);
  });
});

// ✅ 2️⃣ Add new user
app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  const sql = "INSERT INTO users (name, email) VALUES (?, ?)";
  db.query(sql, [name, email], (err, result) => {
    if (err) return res.status(500).json({ error: err });
    res.json({ id: result.insertId, name, email });
  });
});

// ✅ 3️⃣ Update user
app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const sql = "UPDATE users SET name = ?, email = ? WHERE id = ?";
  db.query(sql, [name, email, id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
=======
// ----- SQLite DB Setup -----
const db = new sqlite3.Database("./database.db", (err) => {
  if (err) console.error(err.message);
  else console.log("✅ Connected to SQLite DB");
});

// Create users table if not exists
db.run(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  email TEXT
)`);

// ----- API Routes -----
app.get("/api/users", (req, res) => {
  db.all("SELECT * FROM users ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

app.post("/api/users", (req, res) => {
  const { name, email } = req.body;
  db.run("INSERT INTO users (name,email) VALUES (?,?)", [name, email], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ id: this.lastID, name, email });
  });
});

app.put("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  db.run("UPDATE users SET name=?, email=? WHERE id=?", [name, email, id], function (err) {
    if (err) return res.status(500).json(err);
>>>>>>> ecb167b17549a5c6a6131ef9772dfd581c974159
    res.json({ message: "User updated successfully" });
  });
});

<<<<<<< HEAD
// ✅ 4️⃣ Delete user
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  db.query(sql, [id], (err, result) => {
    if (err) return res.status(500).json({ error: err });
=======
app.delete("/api/users/:id", (req, res) => {
  const { id } = req.params;
  db.run("DELETE FROM users WHERE id=?", [id], function (err) {
    if (err) return res.status(500).json(err);
>>>>>>> ecb167b17549a5c6a6131ef9772dfd581c974159
    res.json({ message: "User deleted successfully" });
  });
});

<<<<<<< HEAD

// ✅ Start Server
=======
// ----- Serve React Frontend -----
app.use(express.static(path.join(__dirname, "build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// ----- Start Server -----
>>>>>>> ecb167b17549a5c6a6131ef9772dfd581c974159
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
