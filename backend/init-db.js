const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("database.db");

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS students (
    roll_no TEXT PRIMARY KEY,
    name TEXT,
    password TEXT
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS events (
    event_id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    description TEXT,
    event_date TEXT,
    total_seats INTEGER,
    available_seats INTEGER,
    is_highlighted INTEGER DEFAULT 0
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    roll_no TEXT,
    event_id INTEGER,
    booking_time TEXT,
    qr_code TEXT
  )`);

  // ✅ Insert sample data safely
  const insertStudent = db.prepare(`INSERT OR IGNORE INTO students (roll_no, name, password) VALUES (?, ?, ?)`);
  insertStudent.run("1", "Atharva Jain", "123456");
  insertStudent.finalize();

  const insertEvent = db.prepare(`INSERT OR IGNORE INTO events (title, description, event_date, total_seats, available_seats, is_highlighted)
                                  VALUES (?, ?, ?, ?, ?, ?)`);

  insertEvent.run("Hackathon 2025", "48-hour coding hackathon", "2025-11-15", 200, 200, 1);
  insertEvent.run("Cultural Fest", "Annual dance & music", "2025-12-05", 150, 150, 0);
  insertEvent.finalize();
});

db.close((err) => {
  if (err) console.error("❌ Error closing DB:", err.message);
  else console.log("✅ Database initialized successfully.");
});
