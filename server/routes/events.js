const express = require('express');
const router = express.Router()
const { protect, admin } = require('../middleware/auth.js')
const {getAllEvents, getEventById,createEvent,updateEvent,deleteEvent} = require('../controller/eventController.js')

// Get all events
router.get('/', getAllEvents)

// Get Event By Id
router.get('/:id', getEventById);

// Create new Event (Admin Only)
router.post('/', protect, admin, createEvent);

// Update Event (Admin Only)
router.put('/:id', protect, admin, updateEvent)

// Delete Event (Admin Only)
router.delete('/:id', protect, admin, deleteEvent);

module.exports = router;