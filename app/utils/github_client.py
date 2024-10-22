# app/utils/github_client.py
import os
from dotenv import load_dotenv
import httpx
import asyncio

# Load environment variables from .env file
load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

# Common headers for all requests
HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

async def get_repo_info(owner: str, repo_name: str):
    url = f"{GITHUB_API_URL}/repos/{owner}/{repo_name}"
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=HEADERS)
        response.raise_for_status()
        return response.json()

async def graphql_query(query: str, variables: dict, retries=3, backoff_factor=0.5):
    async with httpx.AsyncClient(timeout=30.0) as client:  # Set a 30s timeout
        for attempt in range(retries):
            try:
                response = await client.post(
                    GITHUB_GRAPHQL_URL,
                    json={"query": query, "variables": variables},
                    headers=HEADERS
                )
                response.raise_for_status()
                return response.json()
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 502 and attempt < retries - 1:
                    await asyncio.sleep(backoff_factor * (2 ** attempt))
                    continue
                raise
