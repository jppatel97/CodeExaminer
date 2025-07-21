# CodeExaminer

A collaborative code editor and secure online examination system for teachers and students, featuring real-time editing, multi-language support, and a modern, responsive UI.

---

## ✨ Features

- **Real-time Collaboration:** Multiple users can edit code together, see each other's cursors, and work in sync.
- **Multi-language Support:** Write and execute code in C, C++, Python, Java, and JavaScript.
- **Secure Online Exams:** Teachers can create, manage, and grade exams; students can take exams in a secure environment.
- **Modern UI/UX:** Clean, responsive design inspired by VS Code.
- **File Management:** Create, rename, and delete files and folders in a project explorer.
- **Password Reset:** Secure, email-based password reset for all users.
- **Role-based Access:** Separate dashboards and permissions for teachers and students.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- MongoDB Atlas account (for production) or local MongoDB for development
- Gmail or SMTP credentials for email sending

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/your-repo.git
   cd your-repo
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Set up environment variables**

   - Create `.env` in the `backend` directory:
     ```env
     MONGO_URI=your_mongodb_atlas_connection_string
     JWT_SECRET=your_super_secret_jwt_key
     JWT_EXPIRE=30d
     EMAIL_USER=your-email@gmail.com
     EMAIL_PASSWORD=your-app-password
     FRONTEND_URL=http://localhost:5173
     ```

   - Create `.env` in the `frontend` directory:
     ```env
     VITE_BACKEND_URL=http://localhost:5000
     ```

5. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

6. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm run dev
   ```

7. **Open your browser**
   - Visit [http://localhost:5173](http://localhost:5173)

---

## 🌐 Deployment (Vercel)

1. **Push your code to GitHub.**
2. **Connect your repo to Vercel.**
3. **Set the following environment variables in Vercel dashboard:**
   - `MONGO_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `FRONTEND_URL` (e.g. `https://your-app.vercel.app`)
   - `VITE_BACKEND_URL` (set to `/api`)
4. **Deploy!**

---

## 🛠️ Technology Stack

- **Frontend:** React, Vite, Tailwind CSS, Monaco Editor, Socket.IO Client, React Router
- **Backend:** Node.js, Express, Socket.IO, MongoDB, Mongoose, JWT, Nodemailer

---

## 🙋‍♂️ Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.




