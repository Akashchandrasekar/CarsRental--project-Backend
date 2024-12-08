import mongoose from "mongoose";
import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import jwt from "jsonwebtoken";

// Middleware to authenticate user
export const authenticateUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract token from header
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No Token Provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user details to request object
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized: Invalid Token" });
  }
};

// Middleware to authorize admin
export const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access Denied: Admins Only" });
  }
  next();
};

// Create a new booking
export const createBooking = async (req, res) => {
  const { vehicle, startDate, endDate, totalPrice } = req.body;

  try {
    const vehicleRecord = await Vehicle.findById(vehicle);

    if (!vehicleRecord || !vehicleRecord.available) {
      return res.status(400).json({ message: "Vehicle not available" });
    }

    const booking = new Booking({
      vehicle,
      user: req.user.id, // Automatically set the authenticated user
      startDate,
      endDate,
      totalPrice,
    });

    await booking.save();

    // Update vehicle availability
    vehicleRecord.available = false;
    await vehicleRecord.save();

    res.status(201).json({ message: "Booking created successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Error creating booking", error });
  }
};

// Get all bookings (Admin-only)
export const getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("vehicle user", "-password")
      .exec();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bookings", error });
  }
};

// Get booking by ID
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("vehicle user", "-password")
      .exec();

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Ensure the user is authorized to view this booking
    if (req.user._id !== booking.user.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied" });
    }

    res.status(200).json(booking);
  } catch (error) {
    res.status(500).json({ message: "Error fetching booking", error });
  }
};

// Get the rental history of a specific vehicle
export const getRentalHistory = async (req, res) => {
  const { vehicleId } = req.params; // Vehicle ID from request parameters

  try {
    // Find all bookings for the specified vehicle
    const bookings = await Booking.find({ vehicle: vehicleId })
      .populate("user", "name email")
      .populate("vehicle", "model licensePlate"); // Populate the user and vehicle info

    if (bookings.length === 0) {
      return res
        .status(404)
        .json({ message: "No rental history found for this vehicle." });
    }

    // Calculate booking duration for each booking
    const rentalHistory = bookings.map((booking) => {
      const duration =
        (new Date(booking.endDate) - new Date(booking.startDate)) /
        (1000 * 3600 * 24); // in days
      return {
        bookingId: booking._id,
        user: booking.user.name,
        vehicle: booking.vehicle.model,
        startDate: booking.startDate,
        endDate: booking.endDate,
        duration: duration, // booking duration in days
        totalPrice: booking.totalPrice,
      };
    });

    res.status(200).json({ rentalHistory });
  } catch (error) {
    res.status(500).json({ message: "Error fetching rental history", error });
  }
};

// Generate rental report (total rentals, total earnings, and total rental duration)
export const generateRentalReport = async (req, res) => {
  const { vehicleId } = req.params;

  try {
    // Check if the vehicle exists before running the query
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found" });
    }

    // Correctly instantiate the ObjectId using 'new'
    const vehicleObjectId = new mongoose.Types.ObjectId(vehicleId);

    // Aggregate bookings for the vehicle and calculate total earnings and rental duration
    const rentalReport = await Booking.aggregate([
      { $match: { vehicle: vehicleObjectId } }, // Use the correct ObjectId
      {
        $group: {
          _id: null,
          totalRentals: { $sum: 1 }, // Count total bookings
          totalEarnings: { $sum: "$totalPrice" }, // Sum of total price
          totalDuration: { $sum: { $subtract: ["$endDate", "$startDate"] } }, // Total rental days in milliseconds
        },
      },
    ]);

    if (rentalReport.length === 0) {
      return res
        .status(404)
        .json({ message: "No rental data available for this vehicle." });
    }

    // Convert total duration from milliseconds to days
    const totalDurationInDays =
      rentalReport[0].totalDuration / (1000 * 3600 * 24);

    res.status(200).json({
      totalRentals: rentalReport[0].totalRentals,
      totalEarnings: rentalReport[0].totalEarnings,
      totalDurationInDays: totalDurationInDays,
    });
  } catch (error) {
    console.error("Error generating rental report:", error); // Log the error for debugging
    res
      .status(500)
      .json({
        message: "Error generating rental report",
        error: error.message,
      });
  }
};

// Cancel a booking (Admin-only)

export const cancelBooking = async (req, res) => {
  try {
    // Validate booking ID format
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid booking ID" });
    }

    // Fetch booking by ID
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Check user role (only admins can cancel bookings)
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access Denied: Admins Only" });
    }

    // Retrieve the vehicle associated with the booking
    const vehicle = await Vehicle.findById(booking.vehicle);
    if (vehicle) {
      vehicle.available = true; // Mark vehicle as available again
      await vehicle.save();
    }

    // Remove the booking from the database
    await booking.deleteOne();

    res.status(200).json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error); // Log the error for debugging
    res.status(500).json({
      message: "Error cancelling booking",
      error: error.message || "An unexpected error occurred",
    });
  }
};
