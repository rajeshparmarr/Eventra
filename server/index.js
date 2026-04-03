const express = require('express');
const dotenv = require('dotenv')
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth.js')

dotenv.config()

const app = express();
app.use(cors());
app.use(express.json());

// routes
app.use('/api/auth', authRoutes)

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.error("Error connecting to MongoDB:",error)
    })

const PORT = process.env.PORT || 1023;
app.listen(PORT, () => {
    console.log(`App is running on Port no.: ${PORT}`)
})