from fastapi import APIRouter, HTTPException
from app.utils import github_client
from app.utils.analyzer_utils import extract_user_profile
from app.utils.repository_analysis import chain_of_thought_analysis
from app.models.models import UserProfile, RepoAnalysis
import httpx

router = APIRouter()

# Consolidated fetch function that pulls both user profile and repos
async def fetch_user_profile_and_repos(username: str):
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
        repositories(first: 100, orderBy: {field: STARGAZERS, direction: DESC}) {
          nodes {
            name
            stargazerCount
            forkCount
            openIssues: issues(states: OPEN) {
              totalCount
            }
            closedIssues: issues(states: CLOSED) {
              totalCount
            }
            watchers {
              totalCount
            }
          }
        }
      }
    }
    """
    variables = {"username": username}
    data = await github_client.graphql_query(query, variables)

    # Check if 'data' and 'user' keys exist in response
    if "data" not in data or "user" not in data["data"]:
        raise HTTPException(status_code=404, detail="User not found in GitHub response")

    return data

# User profile route
@router.get("/user/{username}", response_model=UserProfile)
async def get_user_profile(username: str):
    try:
        data = await fetch_user_profile_and_repos(username)
        user_profile = extract_user_profile(data["data"])  # Access 'data' key explicitly
        return user_profile
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# Repo analyzer route
@router.get("/repos/analyze/{username}", response_model=RepoAnalysis)
async def analyze_repositories(username: str):
    try:
        # Fetch user profile and repositories
        data = await fetch_user_profile_and_repos(username)

        repos = data["data"]["user"]["repositories"]["nodes"]
        if not repos:
            raise HTTPException(status_code=404, detail="No repositories found for this user.")
        
        # Find the most popular repo by stars
        most_popular_repo = max(repos, key=lambda r: r.get("stargazerCount", 0))

        # Analyze repo metrics
        repo_metrics = {
            "repo_name": most_popular_repo['name'],
            "stars": most_popular_repo.get("stargazerCount", 0),
            "forks": most_popular_repo.get("forkCount", 0),
            "open_issues": most_popular_repo['openIssues']['totalCount'],
            "watchers": most_popular_repo['watchers']['totalCount'],
            "issues_closed": most_popular_repo['closedIssues']['totalCount']
        }

        # Call the chain-of-thought analysis function
        analysis = chain_of_thought_analysis(repo_metrics)

        # Return the repo metrics and the analysis
        return RepoAnalysis(**repo_metrics, analysis=analysis)

    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))