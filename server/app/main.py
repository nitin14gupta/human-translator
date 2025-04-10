from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import users, auth
from . import models
from .database import engine

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Human Translator API",
    description="API for Human Translator app with i18n support",
    version="0.1.0",
)

# Configure CORS
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:19000",  # Expo development server
    "http://localhost:19006",  # Expo web
    "exp://localhost:19000",   # Expo on local device
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Welcome to Human Translator API"} 