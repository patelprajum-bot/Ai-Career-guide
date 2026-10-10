from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

import os
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed


# =========================================================
# 1. LOAD ENVIRONMENT VARIABLES
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_FILE = os.path.join(BASE_DIR, ".env")

load_dotenv(ENV_FILE)

SERPAPI_KEY = os.getenv("SERPAPI_KEY")


# =========================================================
# 2. CREATE FASTAPI APP
# =========================================================

app = FastAPI(
    title="Career Guide API",
    description="Career recommendation backend using FastAPI and SerpApi",
    version="1.0.0"
)


# =========================================================
# 3. CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# 4. REQUEST MODEL
# =========================================================

class CareerRequest(BaseModel):
    education: str
    branch: str
    skills: str
    interests: str
    career_goal: str


# =========================================================
# 5. HOME ROUTE
# =========================================================

@app.get("/")
def home():
    return {
        "message": "Career Guide Backend is Running",
        "status": "success"
    }


# =========================================================
# 6. SERPAPI SEARCH FUNCTION
# =========================================================

def search_serpapi(query: str):

    # Check API key
    if not SERPAPI_KEY:
        return {
            "success": False,
            "error": "SERPAPI_KEY not found in .env file",
            "results": []
        }

    params = {
        "engine": "google",
        "q": query,
        "api_key": SERPAPI_KEY,
        "num": 5
    }

    try:

        response = requests.get(
            "https://serpapi.com/search.json",
            params=params,
            timeout=45
        )

        response.raise_for_status()

        data = response.json()

        # SerpApi itself can return an error inside JSON
        if data.get("error"):
            return {
                "success": False,
                "error": data.get("error"),
                "results": []
            }

        results = []

        for item in data.get("organic_results", [])[:5]:

            results.append({
                "title": item.get("title", ""),
                "link": item.get("link", ""),
                "snippet": item.get("snippet", "")
            })

        return {
            "success": True,
            "error": None,
            "results": results
        }

    except requests.exceptions.Timeout:

        return {
            "success": False,
            "error": "SerpApi request timed out. Please try again.",
            "results": []
        }

    except requests.exceptions.HTTPError as e:

        return {
            "success": False,
            "error": f"SerpApi HTTP error: {str(e)}",
            "results": []
        }

    except requests.exceptions.RequestException as e:

        return {
            "success": False,
            "error": f"Network error while contacting SerpApi: {str(e)}",
            "results": []
        }

    except Exception as e:

        return {
            "success": False,
            "error": f"Unexpected error: {str(e)}",
            "results": []
        }


# =========================================================
# 7. SIMPLE SERPAPI TEST
# =========================================================

@app.get("/test-search")
def test_search():

    result = search_serpapi(
        "software developer career roadmap"
    )

    return result


# =========================================================
# 8. CAREER RECOMMENDATION
# =========================================================

@app.post("/recommend")
def recommend_career(user: CareerRequest):

    # -----------------------------------------------------
    # Create search queries
    # -----------------------------------------------------

    career_query = (
        f"best career options for {user.education} "
        f"{user.branch} student with skills {user.skills} "
        f"and interests {user.interests}"
    )

    skills_query = (
        f"{user.career_goal} required skills roadmap 2026"
    )

    resources_query = (
        f"{user.career_goal} best learning resources "
        f"courses projects 2026"
    )

    queries = {
        "career_search": career_query,
        "skills_roadmap": skills_query,
        "learning_resources": resources_query
    }


    # -----------------------------------------------------
    # Run all 3 searches in parallel
    # -----------------------------------------------------

    results = {}

    with ThreadPoolExecutor(max_workers=3) as executor:

        future_to_name = {
            executor.submit(search_serpapi, query): name
            for name, query in queries.items()
        }

        for future in as_completed(future_to_name):

            name = future_to_name[future]

            try:
                results[name] = future.result()

            except Exception as e:

                results[name] = {
                    "success": False,
                    "error": str(e),
                    "results": []
                }


    # -----------------------------------------------------
    # Return final response
    # -----------------------------------------------------

    return {
        "success": True,

        "user_profile": {
            "education": user.education,
            "branch": user.branch,
            "skills": user.skills,
            "interests": user.interests,
            "career_goal": user.career_goal
        },

        "career_search": results.get(
            "career_search",
            {
                "success": False,
                "error": "No result",
                "results": []
            }
        ),

        "skills_roadmap": results.get(
            "skills_roadmap",
            {
                "success": False,
                "error": "No result",
                "results": []
            }
        ),

        "learning_resources": results.get(
            "learning_resources",
            {
                "success": False,
                "error": "No result",
                "results": []
            }
        )
    }