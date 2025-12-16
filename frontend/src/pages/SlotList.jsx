
import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function SlotList() {
    const [slots, setSlots] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:5000/api/slots')
             .then(res => setSlots(res.data));
    }, []);

    const book = (id) => {
        axios.post(`http://localhost:5000/api/slots/book/${id}`)
             .then(() => alert('Booked'));
    };

    return (
        <div>
            <h2>Available Slots</h2>
            {slots.map(s => (
                <div key={s._id}>
                    <span>{new Date(s.startTime).toLocaleString()}</span>
                    <button onClick={() => book(s._id)}>Book</button>
                </div>
            ))}
        </div>
    );
}
