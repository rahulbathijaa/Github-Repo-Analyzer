# app/main.py
import logging
from fastapi import FastAPI
from app.routers import repo_analyzer

# Set up logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

app.include_router(repo_analyzer.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the GitHub Repo Analyzer"}
