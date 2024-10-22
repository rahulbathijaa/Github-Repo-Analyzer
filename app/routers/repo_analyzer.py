# app/routers/repo_analyzer.py

from fastapi import APIRouter, HTTPException
from app.utils import github_client
from app.utils.analyzer_utils import extract_user_profile
from app.utils.repository_analysis import chain_of_thought_analysis
from app.models.models import (
    UserProfile,
    RepoAnalysis,
    LanguageYearUsage,
)
from typing import List
import logging
from collections import defaultdict
import httpx

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

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
        repositories(
          first: 20,
          ownerAffiliations: OWNER,
          isFork: false,
          orderBy: { field: STARGAZERS, direction: DESC }
        ) {
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
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100) {
                    edges {
                      node {
                        committedDate
                        additions
                        deletions
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    """

    variables = {"username": username}
    data = await github_client.graphql_query(query, variables)

    # Log the raw data received from GitHub
    logger.info(f"GitHub response data for user {username}: {data}")

    if 'errors' in data:
        error_message = data['errors'][0].get('message', 'Unknown error')
        logger.error(f"GitHub API error: {error_message}")
        raise HTTPException(status_code=400, detail=f"GitHub API error: {error_message}")

    if not data.get("data") or not data["data"].get("user"):
        logger.error(f"No user data found for {username}")
        raise HTTPException(status_code=404, detail="User not found")

    # Log the user data being returned
    logger.info(f"User data for {username}: {data['data']['user']}")

    # Return the entire user data
    return data["data"]["user"]

# User profile route
@router.get("/user/{username}", response_model=UserProfile)
async def get_user_profile(username: str):
    try:
        user_data = await fetch_user_profile_and_repos(username)
        logger.info(f"Fetched user data for {username}")

        user_profile = extract_user_profile(user_data)
        logger.info(f"Extracted user profile for {username}: {user_profile}")

        return user_profile
    except HTTPException as exc:
        logger.error(f"HTTPException in get_user_profile: {exc.detail}")
        raise exc  # Re-raise HTTP exceptions to be handled by FastAPI
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTPStatusError in get_user_profile: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
    except Exception as exc:
        logger.exception(f"An error occurred in get_user_profile: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

# Repo analyzer route
@router.get("/repos/analyze/{username}", response_model=List[RepoAnalysis])
async def analyze_repositories(username: str):
    try:
        # Fetch user data, including repositories
        user_data = await fetch_user_profile_and_repos(username)
        logger.info(f"Fetched user data for {username}")

        # Access the repositories
        data = user_data['repositories']['nodes']
        logger.info(f"Repositories for {username}: {data}")

        # Filter repositories to ensure they are owned by the user and not forks
        user_repos = [
            repo for repo in data if repo['owner']['login'].lower() == username.lower() and not repo['isFork']
        ]
        logger.info(f"User-owned repositories for {username}: {user_repos}")

        if not user_repos:
            logger.error(f"No owned repositories found for {username}")
            raise HTTPException(
                status_code=404, detail="No owned repositories found for this user."
            )

        # Sort the user_repos by stargazerCount in descending order
        sorted_repos = sorted(user_repos, key=lambda r: r.get("stargazerCount", 0), reverse=True)
        logger.info(f"Sorted repositories by stars for {username}: {sorted_repos}")

        # Take the top two repositories
        top_two_repos = sorted_repos[:2]
        logger.info(f"Top two repositories for {username}: {top_two_repos}")

        # Perform analysis on each of the top two repositories
        analysis_results = []
        for repo in top_two_repos:
            analysis_result = chain_of_thought_analysis(repo)
            analysis_results.append(RepoAnalysis(**analysis_result))
            logger.info(f"Analysis result for repo {repo['name']}: {analysis_result}")

        # Return the list of analysis results
        return analysis_results

    except HTTPException as exc:
        logger.error(f"HTTPException in analyze_repositories: {exc.detail}")
        raise exc  # Re-raise HTTP exceptions to be handled by FastAPI
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTPStatusError in analyze_repositories: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
    except Exception as exc:
        logger.exception(f"An error occurred in analyze_repositories: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))

# New route to get language usage by year grouped by commit size
@router.get("/repos/commits/{username}", response_model=List[LanguageYearUsage])
async def get_commits_by_language(username: str):
    try:
        user_data = await fetch_user_profile_and_repos(username)
        logger.info(f"Fetched user data for {username}")

        repos = user_data['repositories']['nodes']
        logger.info(f"Repositories for {username}: {repos}")

        # Initialize data structure
        language_usage = defaultdict(lambda: defaultdict(int))

        for repo in repos:
            repo_languages = [edge['node']['name'] for edge in repo.get('languages', {}).get('edges', [])]
            
            # Check if defaultBranchRef and its nested keys exist
            default_branch_ref = repo.get('defaultBranchRef')
            if not default_branch_ref:
                logger.warning(f"No default branch ref found for repo: {repo.get('name')}")
                continue

            target = default_branch_ref.get('target')
            if not target:
                logger.warning(f"No target found for default branch ref in repo: {repo.get('name')}")
                continue

            history = target.get('history')
            if not history:
                logger.warning(f"No commit history found for repo: {repo.get('name')}")
                continue

            commits = history.get('edges', [])

            for commit in commits:
                commit_node = commit['node']
                commit_date = commit_node['committedDate']
                year = commit_date[:4]
                additions = commit_node.get('additions', 0)
                deletions = commit_node.get('deletions', 0)
                total_changes = additions + deletions

                if total_changes == 0:
                    continue

                for language in repo_languages:
                    language_usage[language][year] += total_changes / len(repo_languages)

        # Convert to list of LanguageYearUsage
        usage_list = []
        for language, years in language_usage.items():
            for year, size in years.items():
                usage_list.append(LanguageYearUsage(
                    language=language,
                    year=int(year),
                    size=int(size)
                ))

        logger.info(f"Language usage for {username}: {usage_list}")

        return usage_list

    except HTTPException as exc:
        logger.error(f"HTTPException in get_commits_by_language: {exc.detail}")
        raise exc
    except httpx.HTTPStatusError as exc:
        logger.error(f"HTTPStatusError in get_commits_by_language: {exc}")
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
    except Exception as exc:
        logger.exception(f"An error occurred in get_commits_by_language: {str(exc)}")
        raise HTTPException(status_code=500, detail=str(exc))
