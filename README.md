# 🍽️ FoodieHub

FoodieHub is a food-sharing social media application where users can create food posts, explore food content, and interact with other users through likes and comments.

## 🚀 Features

- User registration and authentication
- JWT-based authentication
- Secure password hashing
- Create and manage food posts
- Upload food images
- Like and comment on posts
- User profile management
- REST API documentation with Swagger UI

## 🛠️ Tech Stack

### Frontend
- Next.js
- React.js
- JavaScript

### Backend
- Python
- FastAPI
- SQLAlchemy
- Pydantic
- PyJWT
- Alembic

### Database
- SQLite

## 📁 Project Structure

```text
FoodieHub/
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── database/
│   │   └── dependencies/
│   │
│   ├── uploads/
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── .gitignore
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd FoodieHub
```

### 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m virtualenv venv
```

Activate the virtual environment (Windows Git Bash):

```bash
source venv/Scripts/activate
```

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Create a `.env` file using `.env.example` and configure your environment variables.

Start the backend server:

```bash
python -m uvicorn app.main:app --reload
```

Backend URL: http://127.0.0.1:8000

API Documentation: http://127.0.0.1:8000/docs

### 3. Frontend Setup

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Frontend URL: http://localhost:3000

## 🔐 Environment Variables

Create a `.env` file inside the backend directory.

Example:

```env
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
DATABASE_URL=sqlite:///./food.db
```

**Important:** Never commit your actual `.env` file or secret keys to GitHub.

## 👨‍💻 Author

**Kuldeep Nayak**

- GitHub: YOUR_GITHUB_PROFILE_URL

## 📄 License

This project is developed for learning and development purposes