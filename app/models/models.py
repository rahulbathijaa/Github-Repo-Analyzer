# app/models/models.py

from pydantic import BaseModel
from typing import Optional, List

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
    forks_to_stars_ratio: float
    issues_resolution_rate: float
    engagement_score: float
    analysis: str
    overall_score: int

class LanguageUsage(BaseModel):
    language: str
    size: int

class RepoLanguages(BaseModel):
    repo_name: str
    languages: List[LanguageUsage]
    updatedAt: Optional[str]

class LanguageYearUsage(BaseModel):
    language: str
    year: int
    size: int
