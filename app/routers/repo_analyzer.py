from fastapi import APIRouter, HTTPException
from app.utils import github_client
from app.utils.analyzer_utils import extract_user_profile
from app.models.models import UserProfile
import httpx

router = APIRouter()

@router.get("/user/{username}", response_model=UserProfile)
async def get_user_profile(username: str):
    try:
        data = await fetch_user_data(username)
        user_profile = extract_user_profile(data)
        return user_profile
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

async def fetch_user_data(username: str):
    query = """
    query ($username: String!) {
      user(login: $username) {
        login
        name
        avatarUrl
        bio
        createdAt
        followers {
          totalCount
        }
        following {
          totalCount
        }
      }
    }
    """
    variables = {"username": username}
    data = await github_client.graphql_query(query, variables)
    return data
