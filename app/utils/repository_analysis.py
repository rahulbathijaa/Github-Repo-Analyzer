# app/utils/repository_analysis.py

import openai
from openai import OpenAI
import os
from dotenv import load_dotenv
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def calculate_key_metrics(repo_data):
    stars = repo_data.get('stargazerCount', 0)
    forks = repo_data.get('forkCount', 0)
    open_issues = repo_data.get('openIssues', {}).get('totalCount', 0)
    closed_issues = repo_data.get('closedIssues', {}).get('totalCount', 0)
    watchers = repo_data.get('watchers', {}).get('totalCount', 0)

    total_issues = open_issues + closed_issues

    metrics = {
        "repo_name": repo_data.get('name', 'Unknown'),
        "stars": stars,
        "forks": forks,
        "open_issues": open_issues,
        "watchers": watchers,
        "forks_to_stars_ratio": forks / stars if stars > 0 else 0,
        "issues_resolution_rate": closed_issues / total_issues if total_issues > 0 else 0,
        "engagement_score": (stars + forks * 2 + watchers) / 100  # Simple engagement score
    }

    return metrics

def generate_repo_analysis(metrics):
    prompt = f"""
    Analyze the following repository metrics and provide insights:
    Repository: {metrics['repo_name']}
    Stars: {metrics['stars']}
    Forks: {metrics['forks']}
    Open Issues: {metrics['open_issues']}
    Watchers: {metrics['watchers']}
    Forks to Stars Ratio: {metrics['forks_to_stars_ratio']:.2f}
    Issues Resolution Rate: {metrics['issues_resolution_rate']:.2f}
    Engagement Score: {metrics['engagement_score']:.2f}

    Provide a comprehensive analysis in a single paragraph. Include insights on:
    1. Overall repository health and popularity
    2. Community engagement and interest
    3. Project maintenance and issue management
    4. Potential areas for improvement

    Also, provide an overall score for the repository health on a scale of 0-100.
    """

    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are an AI assistant that analyzes GitHub repository metrics and provides insights."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        content = response.choices[0].message.content.strip()
        logger.info(f"API response content: {content}")

        # Extract the overall score from the content
        score_match = re.search(r'Overall score: (\d+)', content)
        overall_score = int(score_match.group(1)) if score_match else 0

        # Remove the overall score from the analysis text
        analysis = re.sub(r'Overall score: \d+', '', content).strip()

        return {
            "analysis": analysis,
            "overall_score": overall_score
        }

    except Exception as e:
        logger.error(f"API call error: {str(e)}")
        # Return default values including all required fields
        return {
            "analysis": f"Error calling OpenAI API: {str(e)}",
            "overall_score": 0
        }

def chain_of_thought_analysis(repo_data):
    metrics = {}
    try:
        metrics = calculate_key_metrics(repo_data)
        analysis_result = generate_repo_analysis(metrics)
        return {**metrics, **analysis_result}
    except Exception as e:
        logger.error(f"An error occurred during analysis: {str(e)}")
        # Return a dictionary with default values that match the RepoAnalysis model
        return {
            "repo_name": repo_data.get('name', 'Unknown'),
            "stars": metrics.get('stars', 0),
            "forks": metrics.get('forks', 0),
            "open_issues": metrics.get('open_issues', 0),
            "watchers": metrics.get('watchers', 0),
            "forks_to_stars_ratio": metrics.get('forks_to_stars_ratio', 0.0),
            "issues_resolution_rate": metrics.get('issues_resolution_rate', 0.0),
            "engagement_score": metrics.get('engagement_score', 0.0),
            "analysis": f"An error occurred during analysis: {str(e)}",
            "overall_score": 0
        }
