const express = require('express');
const router = express.Router()
const { protect, admin } = require('../middleware/auth.js')
const {bookEvent,sendBookingOTP,getMyBookings,confirmBooking,cancelBooking} = require('../controller/bookingController.js')

router.post('/', protect, bookEvent);
router.post('/send-otp', protect, sendBookingOTP);
router.get('/my', protect, getMyBookings);
router.put('/:id/confirm', protect, admin, confirmBooking);
router.delete('/:id', protect, cancelBooking)

module.exports = router;