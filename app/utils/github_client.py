# app/utils/github_client.py

import os
from dotenv import load_dotenv
import httpx
import asyncio
import logging

# Set up logging
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

load_dotenv()

GITHUB_API_URL = "https://api.github.com"
GITHUB_GRAPHQL_URL = "https://api.github.com/graphql"
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

HEADERS = {
    "Authorization": f"Bearer {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# Create a semaphore to limit concurrent GitHub API calls
GITHUB_SEMAPHORE = asyncio.Semaphore(5)  # Adjust the limit as needed

async def graphql_query(query: str, variables: dict, retries=3, backoff_factor=0.5):
    async with GITHUB_SEMAPHORE:
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
                    if e.response.status_code in [502, 504] and attempt < retries - 1:
                        wait_time = backoff_factor * (2 ** attempt)
                        logger.warning(f"GitHub API error {e.response.status_code}. Retrying in {wait_time} seconds...")
                        await asyncio.sleep(wait_time)
                        continue
                    raise
