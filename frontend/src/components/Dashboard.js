import React, { useEffect, useState } from "react";
import MyBookings from "./MyBookings";

function Dashboard({ user }) {
  const [events, setEvents] = useState([]);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data));
  }, []);

  const handleBook = async (eventId) => {
    const res = await fetch(`http://localhost:5000/api/book/${eventId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roll_no: user.roll_no }),
    });
    const data = await res.json();
    if (data.success) {
      alert("Booking Successful! QR Code saved.");
    } else {
      alert(data.message || "Booking failed");
    }
  };

  if (showBookings) {
    return <MyBookings user={user} goBack={() => setShowBookings(false)} />;
  }

  return (
    <div>
      <h2>Welcome, {user.name}</h2>
      <button onClick={() => setShowBookings(true)}>My Bookings</button>
      <h3>Upcoming Events</h3>
      <div className="event-cards">
        {events.map((event) => (
          <div key={event.event_id} className="event-card">
            <h4>{event.title}</h4>
            <p>{event.event_date}</p>
            <button onClick={() => handleBook(event.event_id)}>Book</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Dashboard;
