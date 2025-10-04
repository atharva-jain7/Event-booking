import React, { useEffect, useState } from "react";

function MyBookings({ user, goBack }) {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:5000/api/bookings/${user.roll_no}`)
      .then((res) => res.json())
      .then((data) => setBookings(data));
  }, [user.roll_no]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>My Bookings</h2>
      <button onClick={goBack}>Back to Dashboard</button>
      {bookings.length === 0 && <p>No bookings yet.</p>}
      <ul>
        {bookings.map((b) => (
          <li key={b.booking_id}>
            <b>{b.title}</b> - {b.event_date} <br />
            QR Code: <br />
            <img src={`http://localhost:5000${b.qr_code}`} alt="QR Code" width="150" />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MyBookings;
