const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const cors = require("cors"); // <-- ADD THIS

const app = express();
const db = new sqlite3.Database("database.db");

// ✅ Enable CORS
app.use(cors());

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve frontend files (optional)
app.use(express.static(path.join(__dirname, "public")));


// ==================== DATABASE SETUP ==================== //
db.serialize(() => {
  // Create Students Table
  db.run(`CREATE TABLE IF NOT EXISTS students (
    roll_no TEXT PRIMARY KEY,
    name TEXT,
    password TEXT
  )`);

  // Create Events Table
  db.run(`CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    event_date TEXT,
    total_seats INTEGER,
    available_seats INTEGER,
    is_highlighted INTEGER DEFAULT 0
  )`);

  // Create Bookings Table
  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT,
    event_id INTEGER,
    booking_time TEXT,
    qr_code TEXT
  )`);

  // Insert Sample Student
  const insertStudent = db.prepare(
    `INSERT OR IGNORE INTO students (roll_no, name, password) VALUES (?, ?, ?)`
  );
  insertStudent.run("1", "Atharva Jain", "123456");
  insertStudent.finalize();

  // Insert Sample Events
  const insertEvent = db.prepare(
    `INSERT OR IGNORE INTO events (title, description, event_date, total_seats, available_seats, is_highlighted)
     VALUES (?, ?, ?, ?, ?, ?)`
  );
  insertEvent.run("Hackathon 2025", "48-hour coding hackathon", "2025-11-15", 200, 200, 1);
  insertEvent.run("Cultural Fest", "Annual dance & music", "2025-12-05", 150, 150, 0);
  insertEvent.finalize();

  console.log("✅ Database and sample data ready.");
});

// ==================== ROUTES ==================== //

// 🟢 Login Route
app.post("/login", (req, res) => {
  const { roll_no, password } = req.body;

  db.get(
    "SELECT * FROM students WHERE roll_no = ? AND password = ?",
    [roll_no, password],
    (err, row) => {
      if (err) {
        console.error("❌ Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (!row) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      res.json({ message: "Login successful", student: row });
    }
  );
});

// 🟢 Get All Events
app.get("/events", (req, res) => {
  db.all("SELECT * FROM events", [], (err, rows) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
    res.json(rows);
  });
});

// 🟢 Book Event
app.post("/book", (req, res) => {
  const { roll_no, event_id } = req.body;
  const bookingTime = new Date().toISOString();

  db.get("SELECT available_seats FROM events WHERE event_id = ?", [event_id], (err, event) => {
    if (err || !event) return res.status(400).json({ message: "Event not found" });
    if (event.available_seats <= 0) return res.status(400).json({ message: "No seats available" });

    // Insert booking
    db.run(
      "INSERT INTO bookings (roll_no, event_id, booking_time, qr_code) VALUES (?, ?, ?, ?)",
      [roll_no, event_id, bookingTime, `QR-${roll_no}-${event_id}`],
      (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ message: "Booking failed" });
        }

        // Update seat count
        db.run(
          "UPDATE events SET available_seats = available_seats - 1 WHERE event_id = ?",
          [event_id],
          (err) => {
            if (err) console.error(err);
          }
        );

        res.json({ message: "Booking successful!" });
      }
    );
  });
});

// 🟢 Get Student Bookings
app.get("/bookings/:roll_no", (req, res) => {
  const roll_no = req.params.roll_no;

  db.all(
    `SELECT b.booking_id, e.title, e.event_date, b.booking_time, b.qr_code
     FROM bookings b
     JOIN events e ON b.event_id = e.event_id
     WHERE b.roll_no = ?`,
    [roll_no],
    (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal server error" });
      }
      res.json(rows);
    }
  );
});

// ==================== START SERVER ==================== //
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
