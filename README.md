AI Career Guide

AI Career Guide is a web-based project designed to help students explore career options and find useful information related to their career interests.

Choosing a career can be confusing, especially when there are so many options available. Students often need to search different websites to learn about career paths, required skills, courses, and job opportunities.

I built this project to make career-related information easier to explore through a single web application.

This project was developed for the SerpApi India Hackathon 2026.

Technologies Used

Frontend

- HTML — Structure of the web pages.
- CSS — Styling and layout of the website.
- JavaScript — User interactions and communication with the backend.

Backend

- Python — Backend development.
- FastAPI — Creating API endpoints and handling requests.
- SerpApi — Retrieving web search results.

Tools

- Git and GitHub — Version control and source-code hosting.
- Uvicorn — Running the FastAPI application, if configured in the project.

How It Works

The application connects the frontend to a backend that uses SerpApi to retrieve search results.

1. The user enters a career-related query on the website.
2. JavaScript sends the query to the backend.
3. FastAPI processes the incoming request.
4. The backend communicates with SerpApi to retrieve relevant search results.
5. The backend returns the response.
6. JavaScript handles the response and displays the available information on the website.

This allows users to explore career-related information without manually searching multiple websites to get started.

Features

- A web interface built using HTML, CSS, and JavaScript.
- Backend API built with FastAPI.
- Integration with SerpApi for web search.
- Dynamic communication between the frontend and backend.
- A foundation for adding more personalized career guidance features.

The available functionality depends on the current implementation of the project.

Project Structure

The project contains frontend and backend components.

- "frontend/" — Frontend files and related application code.
- "backend/" — Backend application and API-related code.
- "README.md" — Project documentation.

The exact structure may differ depending on the files currently present in the repository.

Getting Started

Prerequisites

Before running the project, make sure you have:

- Python installed.
- Node.js and npm, if required by your frontend setup.
- Git installed.
- A SerpApi API key.

1. Clone the repository

git clone https://github.com/patelprajum-bot/Ai-Career-guide.git
cd Ai-Career-guide

2. Set up the backend

Navigate to the directory containing the backend application and install its dependencies.

pip install -r requirements.txt

If the project uses a different dependency file or directory structure, follow the actual backend configuration.

3. Configure the API key

Create a ".env" file in the appropriate backend directory and add your SerpApi API key.

SERPAPI_API_KEY=your_api_key_here

Use the environment variable name expected by your code. Do not upload your ".env" file or expose your API key on GitHub.

4. Run the backend

If your FastAPI instance is named "app" inside "app.py", run:

uvicorn app:app --reload

If your application uses a different file or module path, adjust the command accordingly.

5. Run the frontend

Open the frontend files using your configured local development server or the setup appropriate for your project.

Since the frontend uses HTML, CSS, and JavaScript, the exact steps depend on how the frontend is organized and how it communicates with the backend.

SerpApi Integration

SerpApi is used to retrieve web search results programmatically.

When a user submits a query, the backend can send the relevant search parameters to SerpApi and process the returned response.

This integration makes the application more flexible because search results can be retrieved dynamically rather than being stored entirely as static information in the code.

The quality and availability of the results depend on the query, API configuration, and external service response.

Why I Built This Project

I wanted to work on a practical problem that students face when exploring career options.

There is plenty of information available online, but finding relevant information and knowing where to start can be difficult. Career Guide is my attempt to make that initial research process simpler.

While developing this project, I worked with frontend development, backend APIs, and external API integration. It also helped me understand how different parts of a web application communicate with each other.

Future Improvements

Some improvements I would like to explore in future versions are:

- Career suggestions based on education and interests.
- Better filtering of search results.
- Career guidance for students from different educational backgrounds.
- Internship and entry-level job discovery.
- Skill gap analysis and learning resource recommendations.
- A more personalized and user-friendly experience.

These are planned improvements, not necessarily features of the current version.

Hackathon

Built for the SerpApi India Hackathon 2026.

The project explores how search APIs can be used to build a practical application that helps students discover career-related information.

Author

Prajum Patel

GitHub: "patelprajum-bot" (https://github.com/patelprajum-bot)

---

This project is a work in progress, and I plan to improve it further as I learn and test new ideas.
