# app/main.py
from fastapi import FastAPI
from app.routers import repo_analyzer

app = FastAPI()

app.include_router(repo_analyzer.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the GitHub Repo Analyzer"}
