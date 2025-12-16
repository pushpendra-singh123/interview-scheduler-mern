
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const slotRoutes = require('./src/routes/slotRoutes');

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/interview_scheduler');

app.use('/api/slots', slotRoutes);

app.listen(5000, () => console.log('Server running on port 5000'));
