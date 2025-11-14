# Installation Guide

This guide will help you set up and run the MySchool project on your computer.

## Prerequisites

Before installing, make sure you have the following installed on your PC:

### 1. Node.js (Version 18 or higher)
- Download from: https://nodejs.org/
- Install the LTS (Long Term Support) version
- After installation, verify by opening Command Prompt/Terminal and running:
  ```bash
  node --version
  npm --version
  ```
  Both commands should show version numbers.

### 2. MongoDB (Database)
- Download from: https://www.mongodb.com/try/download/community
- Install MongoDB Community Server
- During installation, make sure to:
  - Install MongoDB as a Service (Windows) or start MongoDB service (Mac/Linux)
  - Install MongoDB Compass (optional, but helpful for viewing data)

### 3. Git (Optional, for version control)
- Download from: https://git-scm.com/downloads

---

## Installation Steps

### Step 1: Extract the Project

1. Extract the ZIP file to a folder (e.g., `C:\Projects\myschool` or `~/Projects/myschool`)

### Step 2: Install Backend Dependencies

1. Open Command Prompt (Windows) or Terminal (Mac/Linux)
2. Navigate to the backend folder:
   ```bash
   cd myschool/backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   This may take a few minutes. Wait for it to complete.

### Step 3: Install Frontend Dependencies

1. Open a NEW Command Prompt/Terminal window
2. Navigate to the portal folder:
   ```bash
   cd myschool/portal
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
   This may take a few minutes. Wait for it to complete.

### Step 4: Configure Environment Variables

#### Backend Configuration

1. In the `backend` folder, create a file named `.env` (if it doesn't exist)
2. Add the following content:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/myschool
   JWT_SECRET=your-secret-key-change-this-in-production
   NODE_ENV=development
   ```
   **Important:** Change `JWT_SECRET` to a random string for security.

#### Frontend Configuration

1. In the `portal` folder, create a file named `.env` (if it doesn't exist)
2. Add the following content:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### Step 5: Start MongoDB

**Windows:**
- MongoDB should start automatically as a service
- If not, open Services (Win+R, type `services.msc`), find "MongoDB", and start it

**Mac/Linux:**
- Open Terminal and run:
  ```bash
  mongod
  ```
- Or if installed as a service:
  ```bash
  sudo systemctl start mongod
  ```

### Step 6: Seed the Database (Optional - First Time Only)

To populate the database with sample data:

1. Navigate to the backend folder:
   ```bash
   cd myschool/backend
   ```
2. Run the seed script:
   ```bash
   npm run seed
   ```
   This will create sample students, teachers, classes, etc.

### Step 7: Start the Backend Server

1. In the backend folder, run:
   ```bash
   npm run dev
   ```
   You should see: `Server running on port 5000` or similar

2. **Keep this terminal window open** - the server needs to keep running

### Step 8: Start the Frontend Application

1. Open a **NEW** Command Prompt/Terminal window
2. Navigate to the portal folder:
   ```bash
   cd myschool/portal
   ```
3. Run:
   ```bash
   npm run dev
   ```
   You should see a URL like: `http://localhost:5173` or `http://localhost:3000`

4. **Keep this terminal window open** as well

### Step 9: Access the Application

1. Open your web browser (Chrome, Firefox, Edge, etc.)
2. Go to the URL shown in the frontend terminal (usually `http://localhost:5173`)
3. You should see the login page

---

## Default Login Credentials

After seeding the database, you can use these credentials:

**Admin:**
- Email: `admin@school.com`
- Password: `admin123`

**Teacher:**
- Email: `teacher1@school.com`
- Password: `teacher123`

**Student:**
- Email: `student1@school.com`
- Password: `student123`

---

## Troubleshooting

### Problem: "Cannot find module" errors
**Solution:** Make sure you ran `npm install` in both `backend` and `portal` folders

### Problem: "Port already in use" error
**Solution:** 
- Backend: Change `PORT=5000` to `PORT=5001` in `backend/.env`
- Frontend: Usually handles this automatically, but if needed, change the port in `portal/vite.config.ts`

### Problem: "MongoDB connection failed"
**Solution:**
- Make sure MongoDB is running
- Check if `MONGODB_URI` in `backend/.env` is correct
- Try: `mongodb://127.0.0.1:27017/myschool` instead

### Problem: "npm: command not found"
**Solution:** 
- Make sure Node.js is installed correctly
- Restart your computer after installing Node.js
- Try using `npm.cmd` instead of `npm` on Windows

### Problem: Frontend shows "Failed to fetch" or connection errors
**Solution:**
- Make sure the backend server is running
- Check that `VITE_API_URL` in `portal/.env` matches the backend port
- Check browser console (F12) for detailed error messages

---

## Project Structure

```
myschool/
├── backend/          # Backend API server
│   ├── src/
│   ├── .env         # Backend environment variables
│   └── package.json
├── portal/          # Frontend React application
│   ├── src/
│   ├── .env        # Frontend environment variables
│   └── package.json
└── README.md
```

---

## Running the Project Daily

Every time you want to run the project:

1. **Start MongoDB** (if not running as a service)
2. **Start Backend:** Open terminal → `cd myschool/backend` → `npm run dev`
3. **Start Frontend:** Open NEW terminal → `cd myschool/portal` → `npm run dev`
4. **Open browser** → Go to the frontend URL

---

## Stopping the Project

- Press `Ctrl + C` in both terminal windows (backend and frontend)
- Close the terminal windows

---

## Need Help?

If you encounter any issues:
1. Check the error messages in the terminal
2. Check the browser console (Press F12 → Console tab)
3. Make sure all prerequisites are installed correctly
4. Verify MongoDB is running

---

## Notes

- **Do NOT** commit the `.env` files to version control (they contain sensitive information)
- **Do NOT** delete the `node_modules` folders - they contain all dependencies
- If you delete `node_modules`, you'll need to run `npm install` again
- The database will persist data even after closing the application

