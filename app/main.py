# app/main.py
import logging
from fastapi import FastAPI
from app.routers import repo_analyzer
from fastapi.middleware.cors import CORSMiddleware

# Set up logging
logging.basicConfig(level=logging.INFO)

app = FastAPI()

origins = [
    "http://localhost:3000",  
    "https://localhost:3000",
    "https://www.ghrepoanalyzer.com",
    "https://github-repo-analyzer.vercel.app",
    "https://github-repo-analyzer-git-main-rahul-bathijas-projects.vercel.app",
    "https://github-repo-analyzer-48oqcxj38-rahul-bathijas-projects.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Allow frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repo_analyzer.router)

@app.get("/")
async def read_root():
    return {"message": "Welcome to the GitHub Repo Analyzer"}
