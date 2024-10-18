# app/utils/repository_analysis.py

import os
import re
import logging
from dotenv import load_dotenv
from openai import OpenAI

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

def calculate_key_metrics(repo_data):
    try:
        stars = repo_data.get('stargazerCount', 0) or 0
        forks = repo_data.get('forkCount', 0) or 0
        open_issues = repo_data.get('openIssues', {}).get('totalCount', 0) or 0
        closed_issues = repo_data.get('closedIssues', {}).get('totalCount', 0) or 0
        watchers = repo_data.get('watchers', {}).get('totalCount', 0) or 0

        total_issues = open_issues + closed_issues

        # Safely compute ratios, avoid division by zero
        forks_to_stars_ratio = forks / stars if stars else 0
        issues_resolution_rate = closed_issues / total_issues if total_issues else 0

        # Compute engagement score
        engagement_score = (stars + forks * 2 + watchers) / 100

        metrics = {
            "repo_name": repo_data.get('name', 'Unknown'),
            "stars": stars,
            "forks": forks,
            "open_issues": open_issues,
            "watchers": watchers,
            "forks_to_stars_ratio": forks_to_stars_ratio,
            "issues_resolution_rate": issues_resolution_rate,
            "engagement_score": engagement_score,
        }

        return metrics

    except Exception as e:
        logger.exception(f"Error calculating key metrics: {str(e)}")
        # Return default metrics with zero values
        return {
            "repo_name": repo_data.get('name', 'Unknown'),
            "stars": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "forks_to_stars_ratio": 0.0,
            "issues_resolution_rate": 0.0,
            "engagement_score": 0.0,
        }

def generate_repo_analysis(metrics):
    try:
        # Build the prompt dynamically based on available metrics
        prompt_lines = [
            "Analyze the following repository metrics and provide insights:",
            f"Repository: {metrics.get('repo_name', 'Unknown')}",
            f"Stars: {metrics.get('stars', 0)}",
            f"Forks: {metrics.get('forks', 0)}",
            f"Open Issues: {metrics.get('open_issues', 0)}",
            f"Watchers: {metrics.get('watchers', 0)}",
            f"Forks to Stars Ratio: {metrics.get('forks_to_stars_ratio', 0.0):.2f}",
            f"Issues Resolution Rate: {metrics.get('issues_resolution_rate', 0.0):.2f}",
            f"Engagement Score: {metrics.get('engagement_score', 0.0):.2f}",
            "",
            "Provide a comprehensive analysis in a single paragraph. Include insights on:",
            "1. Overall repository health and popularity",
            "2. Community engagement and interest",
            "3. Project maintenance and issue management",
            "4. Potential areas for improvement",
            "",
            "Also, provide an overall score for the repository health on a scale of 0-100."
        ]
        prompt = "\n".join(prompt_lines)

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
        logger.exception(f"API call error: {str(e)}")
        # Return default values including all required fields
        return {
            "analysis": f"Error calling OpenAI API: {str(e)}",
            "overall_score": 0
        }

def chain_of_thought_analysis(repo_data):
    try:
        metrics = calculate_key_metrics(repo_data)
        analysis_result = generate_repo_analysis(metrics)
        return {**metrics, **analysis_result}
    except Exception as e:
        logger.exception(f"An error occurred during analysis: {str(e)}")
        # Return default values including all required fields
        default_metrics = {
            "repo_name": repo_data.get('name', 'Unknown'),
            "stars": 0,
            "forks": 0,
            "open_issues": 0,
            "watchers": 0,
            "forks_to_stars_ratio": 0.0,
            "issues_resolution_rate": 0.0,
            "engagement_score": 0.0,
        }
        return {
            **default_metrics,
            "analysis": f"An error occurred during analysis: {str(e)}",
            "overall_score": 0
        }
