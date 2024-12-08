# Postman API Documentation for Vehicle Rental Platform Backend

https://dark-room.postman.co/workspace/87ff17a0-e7e0-4064-87ca-1d9a2f74a0d2/documentation/39168683-3f7bba11-c58b-46dc-9c69-c5dba9099344

# Vehicle Rental Platform Backend

This repository contains the backend implementation for a **Vehicle Rental Platform**. The platform offers features for vehicle listings, booking management, payment processing, rental history tracking, vehicle maintenance records, and user reviews. It is designed to streamline operations for both users and administrators.

---

## **Features**

### **Core Functionalities**

- **Vehicle Listings**:

  - Add, update, and delete vehicles.
  - View available vehicles with details like price, description, and availability status.

- **Booking Management**:

  - Book vehicles for specific durations.
  - Cancel bookings (admin-only functionality).
  - Track rental history for vehicles and users.

- **Payment Processing**:
  - Integration with payment gateways for secure transactions.
  - Calculate and handle total charges based on booking durations.

### **Extended Functionalities**

- **Rental History Tracking**:

  - Maintain records of all past bookings for each vehicle.
  - Generate rental history reports for analysis and management.

- **Vehicle Maintenance Records**:

  - Track and log maintenance details for vehicles.
  - Ensure vehicles are available for booking only after maintenance checks.

- **User Reviews**:
  - Users can leave ratings and comments for vehicles.
  - Administrators can monitor and manage reviews.

---

## **Installation**

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Steps

1. Clone the repository:

   git clone https://github.com/Akashchandrasekar/Capstone-project-backend

2. Install dependencies:

   npm install

3. Start the development server:

   npm run dev

---

## **API Documentation**

### **Authentication**

- **Register User**: `POST /api/auth/register`
- **Login User**: `POST /api/auth/login`
- **Forgot Password**: `POST /api/auth/forgot-password`
- **Reset Password**: `POST /api/auth/reset-password/:id/:token`

### **Vehicle Management**

- **Add Vehicle**: `POST /api/vehicles` (Admin only)
- **Get All Vehicles**: `GET /api/vehicles`
- **Update Vehicle**: `PUT /api/vehicles/:id` (Admin only)
- **Delete Vehicle**: `DELETE /api/vehicles/:id` (Admin only)

### **Booking Management**

- **Create Booking**: `POST /api/bookings`
- **Get All Bookings**: `GET /api/bookings`
- **Get Booking by ID**: `GET /api/bookings/:id`
- **Cancel Booking**: `DELETE /api/bookings/:id` (Admin only)

### **Rental History**

- **Get Rental History for a Vehicle**: `GET /api/reports/vehicle/:id`
- **Get Rental History for a User**: `GET /api/reports/user/:id`

### **Reviews**

- **Create Review**: `POST /api/reviews` (Authenticated Users)
- **Get Reviews for a Vehicle**: `GET /api/reviews/:vehicleId`

## **License**

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## **Future Enhancements**

- Implement advanced search and filter options for vehicle listings.
- Add multi-currency support for international users.
- Integrate push notifications for booking updates.
- Enable dynamic pricing based on demand and availability.

---

Feel free to raise issues or suggest improvements to enhance this platform!
