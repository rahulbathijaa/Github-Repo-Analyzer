import openai
from openai import OpenAI
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Get OpenAI API key from environment variables
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai.api_key = OPENAI_API_KEY

def chain_of_thought_analysis(repo_metrics):
    repo_name = repo_metrics['repo_name']
    stars = repo_metrics['stars']
    forks = repo_metrics['forks']
    open_issues = repo_metrics['open_issues']
    watchers = repo_metrics['watchers']
    issues_closed = repo_metrics['issues_closed']
    
    # Constructing the prompt for GPT-4
    prompt = f"Analyze the repository '{repo_name}' with {stars} stars, {forks} forks, {open_issues} open issues, {issues_closed} closed issues, and {watchers} watchers. Provide a 3-4 sentence summary of its health and potential improvements."

    try:
        # Using GPT-4 to generate the chain of thought analysis
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4", 
            messages=[
                {"role": "system", "content": "You are a helpful assistant that provides detailed code analysis."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=150
        )

        # Extracting the generated text
        analysis = response.choices[0].message.content.strip()
        return analysis

    except Exception as e:
        return f"An error occurred with GPT-4: {str(e)}"
