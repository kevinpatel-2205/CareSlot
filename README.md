# 🏥 CareSlot – Doctor Appointment Management System

A full-stack **MERN** based web application that simplifies and digitizes the complete medical appointment workflow — from booking and payments to analytics and administrative control.

---

## 👨‍💻 Developer Information

**Name:** Kevin Patel
**Email:** [kevinpatel37592@gmail.com](mailto:kevinpatel37592@gmail.com)
**GitHub:** [https://github.com/kevinpatel-2205/](https://github.com/kevinpatel-2205/)

---

# 📌 Project Overview

**CareSlot** is a web-based Doctor Appointment Management System built using the MERN stack (MongoDB, Express, React, Node.js).

It provides three main user roles:

* 👤 Patient
* 👨‍⚕️ Doctor
* 👨‍💼 Admin

The system replaces manual appointment booking with a centralized, secure, and real-time digital platform.

---

# 🎯 Key Objectives

* Digitize appointment scheduling
* Prevent booking conflicts
* Enable secure online payments
* Track doctor earnings
* Provide real-time dashboards & analytics
* Centralized monitoring through admin panel

---

# 🏗️ System Architecture

The application follows a **3-Tier Architecture**:

```
User → React Frontend → Express API → MongoDB Database
```

### 1️⃣ Frontend

* React.js (SPA)
* Tailwind CSS
* Chart.js
* Redux Toolkit

### 2️⃣ Backend

* Node.js
* Express.js
* REST API
* JWT Authentication

### 3️⃣ Database

* MongoDB
* Mongoose ODM

---

# 👤 Patient Module

### ✅ Dashboard

* Total bookings
* Upcoming bookings
* Completed bookings
* Cancelled bookings
* Sorted upcoming appointments list

### ✅ Doctor Listing

* View all doctors
* Search & filter by specialization
* See availability status

### ✅ Doctor Details

* Name
* Experience
* About
* Specialization
* Consultation fee
* Available time slots

### ✅ Appointment Booking Flow

1. Select doctor
2. Select date
3. Select time slot
4. Confirm booking
5. Status set to **Pending**
6. Online payment (optional)
7. On successful payment → Status becomes **Confirmed**

### ✅ Appointment Management

* View appointments
* Filter by:

  * Pending
  * Confirmed
  * Completed
  * Cancelled

### ✅ Profile Management

* Update name
* Email
* Phone
* Password

---

# 👨‍⚕️ Doctor Module

### ✅ Dashboard

* Total earnings (Confirmed appointments)
* Appointment statistics
* Monthly earnings chart
* Payment type distribution (Cash vs Razorpay)

### ✅ Appointment Management

* Confirm appointment
* Cancel appointment
* Mark as completed

### ✅ Patient Management

* View patient list
* View patient details

### ✅ Available Slots

* Add available slots
* View existing slots

### ✅ Profile Control

* Update profile
* Activate / Deactivate account

---

# 👨‍💼 Admin Module

### ✅ Dashboard

* Total doctors
* Total patients
* Analytics charts
* Top 5 highest earning doctors
* Top 5 most booked doctors

### ✅ Doctor Management

* Add doctor
* Activate/Deactivate
* Delete doctor

### ✅ Patient Management

* View all patients
* Delete patients

### ✅ Appointment Monitoring

* View all appointments
* Filter by status
* Monitor patient & doctor details

---

# 💳 Online Payment Integration

Integrated with **Razorpay** for secure online transactions:

* Appointment payment processing
* Order creation
* Payment verification
* Payment status tracking
* Supports:

  * Cash
  * Razorpay

---

# 📧 Email Notification System

Integrated using **Nodemailer**:

* Doctor account creation email (sent to doctor with login credentials or Dashboard link)
* Appointment booking email (sent to Doctor after successful booking)
---

# 🔐 Security Features

* JWT-based authentication
* Role-based access control
* Password hashing with Bcrypt
* Protected admin routes
* Express rate limiting
* Secure API structure

---

# 📊 Analytics & Charts

Using Chart.js:

* Monthly earnings graph
* Appointment status distribution
* Payment method distribution
* Admin analytics overview

---

# 🗂️ Database Collections

* Users
* Doctors
* Patients
* Appointments
* Payments

Each stored as structured MongoDB documents.

---

# 🚀 Future Enhancements

* SMS reminders
* Video consultation
* Prescription uploads
* Multi-language support
* Mobile application
* AI-based doctor recommendation

---

# ⚙️ Environment Setup

---

## 🔹 Backend `.env` Setup

Create a `.env` file inside the **server** folder:

```
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key

EMAIL_USER=your_email
EMAIL_PASS=your_email_password

RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

CURRENCY=INR
```

---

## 🔹 Frontend `.env` Setup

Create a `.env` file inside the **client** folder:

```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key
```

---

# 📦 Installation & Project Setup Guide

Follow these steps carefully:

---

## 1️⃣ Clone Repository

```bash
git clone https://github.com/kevinpatel-2205/CareSlot.git
cd your-repo-name
```

---

## 2️⃣ Setup Backend

```bash
cd server
npm install
```

Run backend:

```bash
npm run dev
```

Backend will run on:

```
http://localhost:5000
```

---

## 3️⃣ Setup Frontend

Open new terminal:

```bash
cd client
npm install
```

Run frontend:

```bash
npm run dev
```

Frontend will run on:

```
http://localhost:5173
```

---

# 📁 Tech Stack Summary

### Frontend

* React.js
* Redux Toolkit
* Tailwind CSS
* Chart.js
* Axios

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose

### Authentication

* JWT
* Bcrypt

### Payment

* Razorpay

### Email

* Nodemailer

---

# 🏆 Why CareSlot?

CareSlot is a complete real-world scalable system that demonstrates:

* Clean modular architecture
* Secure authentication
* Payment gateway integration
* Email automation
* Role-based access control
* Advanced analytics
* Production-ready structure

---

# 📬 Contact

If you would like to collaborate, contribute, or discuss improvements:

**Kevin Patel**
📧 [kevinpatel37592@gmail.com](mailto:kevinpatel37592@gmail.com)
🔗 [https://github.com/kevinpatel-2205/](https://github.com/kevinpatel-2205/)

---

> Built with dedication using the MERN Stack 🚀
