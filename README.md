# Clinexa - Healthcare Booking Platform

A full-featured healthcare appointment booking application built with React, TypeScript, and Tailwind CSS.

## Features

- **Patient Registration & Login** - Secure authentication system for patients
- **Doctor Portal** - Separate registration and login for doctors
- **Doctor Browsing** - Search and filter doctors by specialization
- **Appointment Booking** - Book appointments with date/time selection
- **Payment Integration** - Support for cash and online payments
- **Doctor Dashboard** - Manage appointments and patient details
- **Blood Bank Management** - Track blood inventory across banks
- **Emergency Blood Requests** - Create and respond to urgent blood needs
- **Donor Profiles** - Blood type preferences and availability
- **Reviews & Ratings** - Patient reviews for doctors

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Shadcn UI
- React Router
- Local Storage Database

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Admin & Authentication

- **Admin Dashboard**: `/admin/db` - View all registered users and data
- **Doctor Portal**: `/doctor-auth` - Doctor registration and login
- **Patient Auth**: `/auth` - Patient registration and login

## Data Storage

The application uses a local database stored in browser's localStorage. No external database setup required.
