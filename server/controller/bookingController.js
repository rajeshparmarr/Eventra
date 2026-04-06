// const Booking = require("../models/Bookings.js");
// const OTP = require("../models/OTP.js");
// const Event = require("../models/Event.js");
// const { sendOtpEmail, sendBookingEmail } = require("../utils/email.js");

// const generateOtp = () => {
//   return Math.floor(100000 + Math.random() * 900000).toString();
// };

// exports.sendBookingOTP = async (req, res) => {
//   const otp = generateOtp();
//   await OTP.findOneAndDelete({
//     email: req.user.email,
//     action: "event_booking",
//   });
//   await OTP.create({
//     email: req.user.email,
//     otp: otp,
//     action: "event_booking",
//   });
//   await sendOtpEmail(req.user.email, otp, "event_booking");
//   res.json({ message: "OTP sent to email" });
// };

// exports.bookEvent = async (req, res) => {
//   const { eventId, otp } = req.body;

//   const otpRecord = await OTP.findOne({
//     email: req.user.email,
//     otp,
//     action: "event_booking",
//   });
//   if (!otpRecord) {
//     return res.status(400).json({
//       error: "Invalid or expired OTP",
//     });
//   }

//   const event = await Event.findById(eventId);
//   if (!event) {
//     return res.status(404).json({
//       error: "Event not found",
//     });
//   }

//   if (event.totalSeats <= 0) {
//     return res.status(400).json({ error: "No seats available" });
//   }

//   const existingBooking = await Booking.findOne({
//     userId: req.user._id,
//     eventId,
//   });
//   if (existingBooking) {
//     return res.status(400).json({
//       error: "You have already booked this event",
//     });
//   }

//   const booking = await Booking.create({
//     userId: req.user._id,
//     eventId,
//     status: "pending",
//     paymentStatus: "non_paid",
//     amount: event.ticketPrice,
//   });

//   await OTP.deleteMany({ email: req.user.email, action: "event_booking" });
//   res
//     .status(201)
//     .json({
//       message: "Booking created. Please check your email for confirmation",
//     });
// };

// exports.confirmBooking = async (req, res) => {
//   const paymentStatus = req.body.paymentStatus;
//   if (!["paid", "non_paid"].includes(paymentStatus)) {
//     return res.status(400).json({ error: "Invalid payment status" });
//   }
//   const booking = await Booking.findById(req.params.id).populate("eventId");
//   if (!booking) {
//     return res.status(404).json({ error: "Booking not found" });
//   }

//   if (booking.status === "confirmed") {
//     return res.status(400).json({
//       error: "Booking is already confirmed",
//     });
//   }

//   const event = await Event.findById(booking.eventId._id);
//   if (event.totalSeats <= 0) {
//     return res.status(400).json({ error: "No seats available" });
//   }

//   booking.status = "confirmed";
//   if (paymentStatus) {
//     booking.paymentStatus = paymentStatus;
//   }
//   await booking.save();
//   event.totalSeats -= 1;
//   await event.save();
//   await sendBookingEmail(req.user.email, event.title, booking._id);
//   res.json({
//       message: "Booking confirmed successfully",
//   });
// };

// exports.getMyBookings = async (req, res) => {
//   const bookings = await Booking.find({ userId: req.user._id }).populate(
//     "eventId"
//   );
//   res.json(bookings);
// };

// exports.cancelBooking = async (req, res) => {
//   try {
//     const booking = await Booking.findById(req.params.id);

//     if (!booking) {
//       return res.status(404).json({ error: "Booking not found" });
//     }

//     if (booking.userId.toString() !== req.user._id.toString()) {
//       return res.status(403).json({ error: "Unauthorized" });
//     }

//     if (booking.status === "confirmed") {
//       const event = await Event.findById(booking.eventId._id);
//       event.totalSeats += 1;
//       await event.save();
//       }

//       booking.status = "cancelled";
//       await booking.save();
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


const Booking = require("../models/Bookings.js");
const OTP = require("../models/OTP.js");
const Event = require("../models/Event.js");
const { sendOtpEmail, sendBookingEmail } = require("../utils/email.js");

// Generate 6-digit OTP
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP for booking
exports.sendBookingOTP = async (req, res) => {
  try {
    const otp = generateOtp();

    await OTP.findOneAndDelete({
      email: req.user.email,
      action: "event_booking",
    });

    await OTP.create({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    await sendOtpEmail(req.user.email, otp, "event_booking");

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create booking (after OTP verification)
exports.bookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    const otpRecord = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "event_booking",
    });

    if (!otpRecord) {
      return res.status(400).json({
        error: "Invalid or expired OTP",
      });
    }

    const event = await Event.findById(eventId);

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (event.totalSeats <= 0) {
      return res.status(400).json({
        error: "No seats available",
      });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user._id,
      eventId,
    });

    if (existingBooking) {
      return res.status(400).json({
        error: "You have already booked this event",
      });
    }

    const booking = await Booking.create({
      userId: req.user._id,
      eventId,
      status: "pending",
      paymentStatus: "non_paid",
      amount: event.ticketPrice,
    });

    // Remove OTP after use
    await OTP.deleteMany({
      email: req.user.email,
      action: "event_booking",
    });

    res.status(201).json({
      message: "Booking created. Please confirm your booking",
      bookingId: booking._id,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Confirm booking (after payment or manual confirmation)
exports.confirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body;

    if (!["paid", "non_paid"].includes(paymentStatus)) {
      return res.status(400).json({
        error: "Invalid payment status",
      });
    }

    const booking = await Booking.findById(req.params.id).populate("eventId");

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (booking.status === "confirmed") {
      return res.status(400).json({
        error: "Booking already confirmed",
      });
    }

    const event = booking.eventId;

    if (!event) {
      return res.status(404).json({
        error: "Event not found",
      });
    }

    if (event.totalSeats <= 0) {
      return res.status(400).json({
        error: "No seats available",
      });
    }

    // Update booking
    booking.status = "confirmed";
    booking.paymentStatus = paymentStatus;

    await booking.save();

    // Decrease seat count
    event.totalSeats -= 1;
    await event.save();

    await sendBookingEmail(req.user.email, event.title, booking._id);

    res.json({
      message: "Booking confirmed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all bookings of logged-in user
exports.getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userId: req.user._id,
    }).populate("eventId");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        error: "Booking not found",
      });
    }

    if (booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        error: "Unauthorized",
      });
    }

    // If already confirmed, restore seat
    if (booking.status === "confirmed") {
      const event = await Event.findById(booking.eventId);

      if (event) {
        event.totalSeats += 1;
        await event.save();
      }
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({
      message: "Booking cancelled successfully",
    });
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
};