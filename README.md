# Appointment Booking System with Time Overlap Management

Small full-stack web app built with **React (Vite)** + **Express.js** + **MariaDB**.

The app lets **clients** book appointments with **staff** members, while the backend ensures there are **no overlapping appointments** for a given staff member. An **admin** user manages staff accounts.

Developed as a midterm project for a Web Development course.

---

## Features

### Roles

**Admin**

- Log in as admin
- Create staff accounts (name, role, email, password)
- View all staff members
- Delete staff members (their appointments are removed via `ON DELETE CASCADE`)

**Staff**

- Log in as staff
- Pick a date and view all appointments for that day
- See client name, time range, notes, and status
- Cancel appointments (status set to `cancelled`)

**Client**

- Register and log in as client
- Book an appointment with a chosen staff member
- Pick date and time (24-hour format, 60-minute duration)
- See list of own appointments with status and notes
- Cancel own appointments

### Time Overlap Management

When a client tries to book an appointment, the backend checks the database to ensure that there is **no existing appointment for that staff member that overlaps** with the new time interval.

Each appointment is stored with:

- `start_time` (DATETIME)
- `end_time` (DATETIME)

Conceptually, for a new interval `[start_new, end_new)` and an existing interval `[start_old, end_old)` they overlap if:

```text
NOT (end_old <= start_new OR start_old >= end_new)
```

**Team**

Beka Buachidze (@MortuoRege)

Erekle Sigua (@Sigu)

Ibrahim Jabour (@xBrROxx)
