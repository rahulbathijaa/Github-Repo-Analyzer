# app/models/models.py
from pydantic import BaseModel

class RepoInfo(BaseModel):
    name: str
    owner: str
    stars: int
    forks: int
    # Add other fields as needed
