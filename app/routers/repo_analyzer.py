from fastapi import APIRouter, HTTPException
from app.utils import github_client
from app.utils.analyzer_utils import extract_user_profile
from app.utils.repository_analysis import chain_of_thought_analysis
from app.models.models import UserProfile, RepoAnalysis
import httpx
import logging

logger = logging.getLogger(__name__)

router = APIRouter()

# Consolidated fetch function that pulls both user profile and repos
async def fetch_user_profile_and_repos(username: str):
    query = """
    query ($username: String!) {
      user(login: $username) {
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
            description
            primaryLanguage {
              name
            }
            owner {
              login
            }
            isFork
            updatedAt
          }
        }
      }
    }
    """
    
    variables = {"username": username}
    data = await github_client.graphql_query(query, variables)

    # Filter out forked repositories and repositories not owned by the user
    user_repos = [repo for repo in data["data"]["user"]["repositories"]["nodes"] 
                  if repo['owner']['login'] == username and not repo['isFork']]

    return user_repos


# User profile route
@router.get("/user/{username}", response_model=UserProfile)
async def get_user_profile(username: str):
    try:
        data = await fetch_user_profile_and_repos(username)
        # Ensure 'data' is accessed correctly
        user_profile = extract_user_profile(data)  # Removed ["data"] as 'data' is already the user data
        return user_profile
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))

# Repo analyzer route
@router.get("/repos/analyze/{username}", response_model=RepoAnalysis)
async def analyze_repositories(username: str):
    try:
        # Fetch user profile and repositories
        data = await fetch_user_profile_and_repos(username)

        # Filter repositories to ensure they are owned by the user and not forks
        user_repos = [repo for repo in data if repo['owner']['login'] == username and not repo['isFork']]

        if not user_repos:
            raise HTTPException(status_code=404, detail="No owned repositories found for this user.")
        
        # Find the most popular repo by stars from the filtered user-owned repos
        most_popular_repo = max(user_repos, key=lambda r: r.get("stargazerCount", 0))

        # Alternatively, sort by updatedAt to get the first listed repo
        first_repo = sorted(user_repos, key=lambda r: r['updatedAt'], reverse=True)[0]

        # Depending on the logic, you can return either the most popular or first listed repo
        repo_to_analyze = most_popular_repo  # or first_repo, based on preference

        # Call the chain-of-thought analysis function
        analysis_result = chain_of_thought_analysis(repo_to_analyze)

        # Log the analysis result for debugging
        logger.info(f"Analysis result: {analysis_result}")

        # Return the analysis result
        return RepoAnalysis(**analysis_result)

    except Exception as exc:
        logger.error(f"An error occurred: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))
