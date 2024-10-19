import os
import re
import logging
import math
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
            "closed_issues": closed_issues,  # Include closed_issues
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
            "closed_issues": 0,  # Include closed_issues
            "watchers": 0,
            "forks_to_stars_ratio": 0.0,
            "issues_resolution_rate": 0.0,
            "engagement_score": 0.0,
        }

def compute_overall_score(metrics):
    try:
        stars = metrics.get('stars', 0)
        forks = metrics.get('forks', 0)
        issues_resolution_rate = metrics.get('issues_resolution_rate', 0.0)
        engagement_score = metrics.get('engagement_score', 0.0)

        # Apply logarithmic scaling to stars and forks to naturally increase scores
        stars_score = min(40, math.log10(stars + 1) * 10)
        forks_score = min(20, math.log10(forks + 1) * 5)
        issues_score = issues_resolution_rate * 20  # Since issues_resolution_rate is between 0 and 1
        engagement_component = min(20, math.log10(engagement_score + 1) * 5)

        # Sum up to get the overall score
        overall_score = stars_score + forks_score + issues_score + engagement_component

        # Ensure the score is between 0 and 100
        overall_score = min(100, max(0, overall_score))

        logger.info(f"Calculated overall score: {overall_score}")
        return int(overall_score)

    except Exception as e:
        logger.exception(f"Error calculating overall score: {str(e)}")
        return 0  # Return zero if an error occurs

def generate_repo_analysis(metrics):
    try:
        # Build the prompt dynamically based on available metrics
        prompt_lines = [
            f"Repository: {metrics.get('repo_name', 'Unknown')}",
            f"Stars: {metrics.get('stars', 0)}",
            f"Forks: {metrics.get('forks', 0)}",
            f"Open Issues: {metrics.get('open_issues', 0)}",
            f"Closed Issues: {metrics.get('closed_issues', 0)}",
            f"Watchers: {metrics.get('watchers', 0)}",
            f"Forks to Stars Ratio: {metrics.get('forks_to_stars_ratio', 0.0):.2f}",
            f"Issues Resolution Rate: {metrics.get('issues_resolution_rate', 0.0):.2f}",
            f"Engagement Score: {metrics.get('engagement_score', 0.0):.2f}",
            "",
            "Analyze the repository based on the metrics above.",
            "Provide a comprehensive analysis in exactly four sentences, focusing on positive aspects and strengths of the repository.",
            "Include insights on:",
            "- Overall repository health and popularity",
            "- Community engagement and interest",
            "- Project maintenance and issue management",
            "- Potential areas for improvement",
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

        # Since we no longer ask OpenAI to provide the overall score, we don't need to extract it
        analysis = content

        return {
            "analysis": analysis
            # Do not include 'overall_score' here
        }

    except Exception as e:
        logger.exception(f"API call error: {str(e)}")
        # Return default values including all required fields
        return {
            "analysis": f"Error calling OpenAI API: {str(e)}"
            # Do not include 'overall_score' here
        }

def chain_of_thought_analysis(repo_data):
    try:
        metrics = calculate_key_metrics(repo_data)
        overall_score = compute_overall_score(metrics)  # Compute the overall score
        analysis_result = generate_repo_analysis(metrics)
        analysis_result['overall_score'] = overall_score  # Add the overall score to the analysis result
        return {**metrics, **analysis_result}
    except Exception as e:
        logger.exception(f"An error occurred during analysis: {str(e)}")
        # Return default values including all required fields
        default_metrics = {
            "repo_name": repo_data.get('name', 'Unknown'),
            "stars": 0,
            "forks": 0,
            "open_issues": 0,
            "closed_issues": 0,
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
