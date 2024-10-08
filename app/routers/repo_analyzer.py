# app/routers/repo_analyzer.py

from fastapi import APIRouter, HTTPException
from app.utils import github_client
from app.utils.analyzer_utils import extract_user_profile
from app.utils.repository_analysis import chain_of_thought_analysis
from app.models.models import UserProfile, RepoAnalysis, RepoLanguages, LanguageUsage
from typing import List
import logging

logger = logging.getLogger(__name__)

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
            description
            primaryLanguage {
              name
            }
            languages(first: 10) {
              edges {
                size
                node {
                  name
                }
              }
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

    if 'errors' in data:
        error_message = data['errors'][0].get('message', 'Unknown error')
        logger.error(f"GitHub API error: {error_message}")
        raise HTTPException(status_code=400, detail=f"GitHub API error: {error_message}")

    if not data.get("data") or not data["data"].get("user"):
        raise HTTPException(status_code=404, detail="User not found")

    # Return the entire user data
    return data["data"]["user"]


# User profile route
@router.get("/user/{username}", response_model=UserProfile)
async def get_user_profile(username: str):
    try:
        user_data = await fetch_user_profile_and_repos(username)
        user_profile = extract_user_profile(user_data)
        return user_profile
    except HTTPException as exc:
        raise exc  # Re-raise HTTP exceptions to be handled by FastAPI
    except Exception as exc:
        logger.error(f"An error occurred in get_user_profile: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))


# Repo analyzer route
@router.get("/repos/analyze/{username}", response_model=RepoAnalysis)
async def analyze_repositories(username: str):
    try:
        # Fetch user data, including repositories
        user_data = await fetch_user_profile_and_repos(username)

        # Access the repositories
        data = user_data['repositories']['nodes']

        # Filter repositories to ensure they are owned by the user and not forks
        user_repos = [repo for repo in data if repo['owner']['login'] == username and not repo['isFork']]

        if not user_repos:
            raise HTTPException(status_code=404, detail="No owned repositories found for this user.")

        # Find the most popular repo by stars from the filtered user-owned repos
        most_popular_repo = max(user_repos, key=lambda r: r.get("stargazerCount", 0))

        # Call the chain-of-thought analysis function
        analysis_result = chain_of_thought_analysis(most_popular_repo)

        # Log the analysis result for debugging
        logger.info(f"Analysis result: {analysis_result}")

        # Return the analysis result
        return RepoAnalysis(**analysis_result)

    except HTTPException as exc:
        raise exc  # Re-raise HTTP exceptions to be handled by FastAPI
    except Exception as exc:
        logger.error(f"An error occurred in analyze_repositories: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))


# Repo languages route
@router.get("/repos/languages/{username}", response_model=List[RepoLanguages])
async def get_repo_languages(username: str):
    try:
        # Fetch user data, including repositories
        user_data = await fetch_user_profile_and_repos(username)

        # Access the repositories
        data = user_data['repositories']['nodes']

        # Filter repositories to ensure they are owned by the user and not forks
        user_repos = [repo for repo in data if repo['owner']['login'] == username and not repo['isFork']]

        if not user_repos:
            raise HTTPException(status_code=404, detail="No owned repositories found for this user.")

        # Prepare the list to hold language data for each repository
        repo_languages_list = []

        # Iterate over repositories and extract language data
        for repo in user_repos:
            languages = repo.get('languages', {}).get('edges', [])
            language_data = [
                LanguageUsage(language=edge['node']['name'], size=edge['size']) for edge in languages
            ]

            repo_languages = RepoLanguages(
                repo_name=repo['name'],
                languages=language_data,
                updatedAt=repo['updatedAt']  # Include updatedAt if needed
            )
            repo_languages_list.append(repo_languages)

        return repo_languages_list

    except HTTPException as exc:
        raise exc  # Re-raise HTTP exceptions to be handled by FastAPI
    except Exception as exc:
        logger.error(f"An error occurred in get_repo_languages: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))
