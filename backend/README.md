# CodeExaminer Backend

This is the backend server for CodeExaminer built with Node.js, Express, and MongoDB.

## Features

- User Authentication (Register/Login)
- Role-based Authorization (Student/Teacher)
- Exam Management (CRUD operations)
- Exam Submission and Scoring
- JWT Authentication
- Error Handling
- MongoDB Database

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository
2. Navigate to the backend directory:
   ```bash
   cd backend
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory and add the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/codeexaminer
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRE=30d
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

## API Documentation

### Authentication

#### Register User
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "student"
  }
  ```

#### Login User
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```

#### Get Current User
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`

### Exams

#### Get All Exams
- **GET** `/api/exams`
- **Headers**: `Authorization: Bearer <token>`

#### Get Single Exam
- **GET** `/api/exams/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Create Exam
- **POST** `/api/exams`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "title": "Math Final",
    "subject": "Mathematics",
    "description": "Final examination for Mathematics",
    "duration": 60,
    "questions": [
      {
        "questionText": "What is 2 + 2?",
        "options": [
          { "text": "3", "isCorrect": false },
          { "text": "4", "isCorrect": true },
          { "text": "5", "isCorrect": false },
          { "text": "6", "isCorrect": false }
        ],
        "points": 1
      }
    ]
  }
  ```

#### Update Exam
- **PUT** `/api/exams/:id`
- **Headers**: `Authorization: Bearer <token>`
- **Body**: Same as Create Exam

#### Delete Exam
- **DELETE** `/api/exams/:id`
- **Headers**: `Authorization: Bearer <token>`

#### Submit Exam
- **POST** `/api/exams/:id/submit`
- **Headers**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "answers": [
      {
        "questionIndex": 0,
        "selectedOption": 1
      }
    ]
  }
  ```

## Error Handling

The API uses standard HTTP response codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Role-based access control
- Input validation and sanitization

## License

This project is licensed under the MIT License. 