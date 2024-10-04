# app/models/models.py
from pydantic import BaseModel
from typing import Optional

class UserProfile(BaseModel):
    login: str
    name: Optional[str]
    avatarUrl: str
    bio: Optional[str]
    createdAt: str
    followers: int
    following: int

class RepoAnalysis(BaseModel):
    repo_name: str
    stars: int
    forks: int
    open_issues: int
    watchers: int
    issues_closed: int