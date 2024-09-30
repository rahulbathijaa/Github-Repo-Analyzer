# app/routers/repo_analyzer.py
from fastapi import APIRouter, HTTPException
from app.utils import github_client

router = APIRouter()

@router.get("/analyze/{username}")
async def analyze_user(username: str):
    query = """
    query ($username: String!) {
      user(login: $username) {
        login
        avatarUrl
        createdAt
        bio
        followers {
          totalCount
        }
        following {
          totalCount
        }
        repositories(first: 1, orderBy: {field: UPDATED_AT, direction: DESC}) {
          nodes {
            name
            primaryLanguage {
              name
            }
            defaultBranchRef {
              target {
                ... on Commit {
                  history(first: 100) {
                    edges {
                      node {
                        committedDate
                        message
                        additions
                        deletions
                      }
                    }
                  }
                }
              }
            }
            pullRequests(first: 100, states: MERGED) {
              edges {
                node {
                  createdAt
                  title
                  additions
                  deletions
                }
              }
            }
            object(expression: "HEAD:README.md") {
              ... on Blob {
                text
              }
            }
          }
        }
      }
    }
    """
    variables = {"username": username}
    try:
        data = await github_client.graphql_query(query, variables)
        return data
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=exc.response.status_code, detail=str(exc))
