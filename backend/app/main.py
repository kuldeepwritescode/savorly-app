from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from app.database.session import engine, Base
from app.routers import auth, post, users

# Create all tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Food Post API",
    description="Food Post App with FastAPI",
    version="1.0.0"
)

# Uploads folder banao + serve karo
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router)
app.include_router(post.router)
app.include_router(users.router)


@app.get("/")
def root():
    return {"message": "Food Post API is running"}