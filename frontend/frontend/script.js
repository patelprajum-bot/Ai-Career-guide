"use strict";

/* =========================================================
   CAREER GUIDE — FRONTEND + FASTAPI + SERPAPI
   ========================================================= */

const API_BASE_URL = "http://127.0.0.1:8000";
const RECOMMEND_ENDPOINT = `${API_BASE_URL}/recommend`;


/* =========================================================
   1. DOM ELEMENTS
   ========================================================= */

const careerForm = document.getElementById("careerForm");
const findCareerBtn = document.getElementById("findCareerBtn");

const resultsSection = document.getElementById("results");
const careerCards = document.getElementById("careerCards");
const resultsSummary = document.getElementById("resultsSummary");

const skillsSection = document.getElementById("skills-section");
const skillsOverview = document.getElementById("skillsOverview");
const requiredSkills = document.getElementById("requiredSkills");

const roadmapContainer = document.getElementById("roadmapContainer");

const resourcesSection = document.getElementById("resources");
const resourcesGrid = document.getElementById("resourcesGrid");

const toast = document.getElementById("toast");
const toastMessage = document.getElementById("toastMessage");


/* =========================================================
   2. UTILITIES
   ========================================================= */

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}


function safeExternalURL(value) {
    try {
        const url = new URL(value);

        if (url.protocol === "https:" || url.protocol === "http:") {
            return url.href;
        }

        return "";
    } catch {
        return "";
    }
}


function splitCommaSeparated(value) {
    return String(value ?? "")
        .split(",")
        .map(item => item.trim())
        .filter(Boolean);
}


function showToast(message) {
    if (!toast || !toastMessage) {
        console.log(message);
        return;
    }

    toastMessage.textContent = message;
    toast.classList.add("show");

    clearTimeout(showToast.timeoutId);

    showToast.timeoutId = setTimeout(() => {
        toast.classList.remove("show");
    }, 4500);
}


function setLoadingState(isLoading) {
    if (!findCareerBtn) return;

    findCareerBtn.disabled = isLoading;
    findCareerBtn.classList.toggle("loading", isLoading);

    if (isLoading) {
        findCareerBtn.setAttribute("aria-busy", "true");
    } else {
        findCareerBtn.removeAttribute("aria-busy");
    }
}


function hideResults() {
    resultsSection?.classList.add("hidden");
    skillsSection?.classList.add("hidden");
    roadmapContainer?.closest(".roadmap-section")?.classList.add("hidden");
    resourcesSection?.classList.add("hidden");
}


function showResults() {
    resultsSection?.classList.remove("hidden");
    skillsSection?.classList.remove("hidden");
    roadmapContainer?.closest(".roadmap-section")?.classList.remove("hidden");
    resourcesSection?.classList.remove("hidden");
}


/* =========================================================
   3. READ FORM DATA
   ========================================================= */

function getUserProfile() {
    const education = document.getElementById("education").value.trim();
    const branch = document.getElementById("branch").value.trim();
    const skills = splitCommaSeparated(
        document.getElementById("skills").value
    );
    const interests = splitCommaSeparated(
        document.getElementById("interests").value
    );
    const careerGoal = document.getElementById("careerGoal").value.trim();

    if (!education || !branch || !careerGoal) {
        throw new Error("Please complete all required fields.");
    }

    if (skills.length === 0) {
        throw new Error("Please enter at least one skill.");
    }

    if (interests.length === 0) {
        throw new Error("Please enter your interests.");
    }

    return {
        education,
        branch,
        skills,
        interests,
        career_goal: careerGoal
    };
}


/* =========================================================
   4. CALL FASTAPI BACKEND
   ========================================================= */

async function getCareerRecommendations(profile) {
    let response;

    try {
        response = await fetch(RECOMMEND_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify({
                education: profile.education,
                branch: profile.branch,
                skills: profile.skills.join(", "),
                interests: profile.interests.join(", "),
                career_goal: profile.career_goal
            })
        });
    } catch (error) {
        console.error("Fetch failed:", error);

        throw new Error(
            "Backend se connection nahi ho paaya. Check karo ki FastAPI chal raha hai."
        );
    }

    let data;

    try {
        data = await response.json();
    } catch {
        throw new Error(
            `Backend ka response valid JSON nahi hai. HTTP ${response.status}`
        );
    }

    if (!response.ok) {
        const detail = typeof data.detail === "string"
            ? data.detail
            : `HTTP ${response.status}`;

        throw new Error(`Backend error: ${detail}`);
    }

    return data;
}


/* =========================================================
   5. NORMALIZE BACKEND DATA
   ========================================================= */

function normalizeBackendResponse(data, profile) {
    const careerSearch = data.career_search ?? {};
    const skillsSearch = data.skills_roadmap ?? {};
    const resourcesSearch = data.learning_resources ?? {};

    const careerResults = Array.isArray(careerSearch.results)
        ? careerSearch.results
        : [];

    const skillsResults = Array.isArray(skillsSearch.results)
        ? skillsSearch.results
        : [];

    const resourceResults = Array.isArray(resourcesSearch.results)
        ? resourcesSearch.results
        : [];

    const successfulSearches = [
        careerSearch,
        skillsSearch,
        resourcesSearch
    ].filter(item => item.success === true);

    if (successfulSearches.length === 0) {
        const errors = [
            careerSearch.error,
            skillsSearch.error,
            resourcesSearch.error
        ].filter(Boolean);

        throw new Error(
            errors.length
                ? errors.join(" | ")
                : "No search results received. Please try again."
        );
    }

    const careers = careerResults.map((item, index) => ({
        title: item.title || "Career Resource",
        description: item.snippet || "Open this result to learn more.",
        link: item.link || "",
        icon: "↗",
        featured: index === 0
    }));

    const required = skillsResults.map(item => ({
        name: item.title || "Skill Resource",
        description: item.snippet || "Explore this resource for more information.",
        link: item.link || "",
        level: "Explore"
    }));

    const roadmap = skillsResults.map((item, index) => ({
        number: String(index + 1).padStart(2, "0"),
        title: item.title || "Learning Roadmap",
        description: item.snippet || "Open this resource for details.",
        duration: "Explore",
        tags: ["Roadmap", "Learning"],
        link: item.link || ""
    }));

    const resources = resourceResults.map(item => ({
        type: "LEARNING RESOURCE",
        title: item.title || "Learning Resource",
        description: item.snippet || "Open this resource to learn more.",
        url: item.link || "",
        linkText: "Open Resource →"
    }));

    return {
        summary:
            `Search results for ${profile.career_goal}, based on your ` +
            `${profile.education} education and ${profile.branch} background. ` +
            `These are web search results, not AI-verified career matches.`,

        careers,
        roadmap,
        resources,

        skills: {
            currentScore: null,
            description:
                "Explore the resources below to understand which skills " +
                "may be useful for your career goal.",
            required
        }
    };
}


/* =========================================================
   6. RENDER CAREER RESULTS
   ========================================================= */

function renderCareerCards(careers) {
    careerCards.innerHTML = "";

    if (careers.length === 0) {
        careerCards.innerHTML = `
            <p class="empty-results">
                No career results were found. Try different profile details.
            </p>
        `;
        return;
    }

    careers.forEach((career, index) => {
        const card = document.createElement("article");
        card.className = `career-card ${career.featured ? "featured" : ""}`;
        card.style.animationDelay = `${index * 100}ms`;

        const link = safeExternalURL(career.link);

        card.innerHTML = `
            ${career.featured
                ? '<div class="recommended-label">CAREER SEARCH RESULT</div>'
                : ""}

            <div class="career-icon">${escapeHTML(career.icon)}</div>

            <h3>${escapeHTML(career.title)}</h3>

            <p class="career-card-description">
                ${escapeHTML(career.description)}
            </p>

            <div class="career-card-footer">
                <span>Web Search</span>

                ${link
                    ? `<a class="explore-link"
                          href="${escapeHTML(link)}"
                          target="_blank"
                          rel="noopener noreferrer">
                          Explore →
                       </a>`
                    : ""}
            </div>
        `;

        careerCards.appendChild(card);
    });
}


/* =========================================================
   7. RENDER SKILLS
   ========================================================= */

function renderSkills(skillData) {
    skillsOverview.innerHTML = `
        <div class="skill-score">
            <strong>Live</strong>
            <span>Search Results</span>
        </div>

        <h3>Skills to explore</h3>

        <p>${escapeHTML(skillData.description)}</p>
    `;

    requiredSkills.innerHTML = "";

    if (!skillData.required.length) {
        requiredSkills.innerHTML = `
            <p class="empty-results">
                No skill resources were found.
            </p>
        `;
        return;
    }

    skillData.required.forEach((skill, index) => {
        const card = document.createElement("div");
        card.className = "skill-card";

        const link = safeExternalURL(skill.link);

        card.innerHTML = `
            <div class="skill-number">
                ${String(index + 1).padStart(2, "0")}
            </div>

            <div class="skill-info">
                <h4>${escapeHTML(skill.name)}</h4>
                <p>${escapeHTML(skill.description)}</p>

                ${link
                    ? `<a href="${escapeHTML(link)}"
                          target="_blank"
                          rel="noopener noreferrer">
                          View resource →
                       </a>`
                    : ""}
            </div>

            <div class="skill-level">
                <span>${escapeHTML(skill.level)}</span>
            </div>
        `;

        requiredSkills.appendChild(card);
    });
}


/* =========================================================
   8. RENDER ROADMAP
   ========================================================= */

function renderRoadmap(roadmap) {
    roadmapContainer.innerHTML = "";

    if (!roadmap.length) {
        roadmapContainer.innerHTML = `
            <p class="empty-results">
                No roadmap resources were found.
            </p>
        `;
        return;
    }

    roadmap.forEach(step => {
        const element = document.createElement("div");
        element.className = "roadmap-step";

        const link = safeExternalURL(step.link);

        const tags = step.tags
            .map(tag => `<span class="step-tag">${escapeHTML(tag)}</span>`)
            .join("");

        element.innerHTML = `
            <div class="step-number">${escapeHTML(step.number)}</div>

            <div class="step-content">
                <div class="step-content-top">
                    <h3>${escapeHTML(step.title)}</h3>
                    <span class="step-duration">
                        ${escapeHTML(step.duration)}
                    </span>
                </div>

                <p>${escapeHTML(step.description)}</p>

                <div class="step-tags">${tags}</div>

                ${link
                    ? `<a href="${escapeHTML(link)}"
                          target="_blank"
                          rel="noopener noreferrer">
                          Open resource →
                       </a>`
                    : ""}
            </div>
        `;

        roadmapContainer.appendChild(element);
    });
}


/* =========================================================
   9. RENDER LEARNING RESOURCES
   ========================================================= */

function renderResources(items) {
    resourcesGrid.innerHTML = "";

    if (!items.length) {
        resourcesGrid.innerHTML = `
            <p class="empty-results">
                No learning resources were found.
            </p>
        `;
        return;
    }

    items.forEach(item => {
        const card = document.createElement("article");
        card.className = "resource-card";

        const link = safeExternalURL(item.url);

        card.innerHTML = `
            <div class="resource-top">
                <span class="resource-type">
                    ${escapeHTML(item.type)}
                </span>
                <span class="resource-arrow">↗</span>
            </div>

            <h3>${escapeHTML(item.title)}</h3>

            <p>${escapeHTML(item.description)}</p>

            ${link
                ? `<a href="${escapeHTML(link)}"
                      target="_blank"
                      rel="noopener noreferrer">
                      ${escapeHTML(item.linkText)}
                   </a>`
                : "<span>Link unavailable</span>"}
        `;

        resourcesGrid.appendChild(card);
    });
}


/* =========================================================
   10. SHOW RESULTS
   ========================================================= */

function renderResults(data) {
    resultsSummary.textContent = data.summary;

    renderCareerCards(data.careers);
    renderSkills(data.skills);
    renderRoadmap(data.roadmap);
    renderResources(data.resources);

    showResults();

    // Scroll to results only after valid results are rendered.
    resultsSection.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });
}


/* =========================================================
   11. FORM SUBMISSION
   ========================================================= */

if (!careerForm || !findCareerBtn) {
    console.error(
        "Career Guide: careerForm or findCareerBtn was not found. " +
        "Check index.html IDs."
    );
} else {
    careerForm.addEventListener("submit", async function (event) {
        // Prevent the browser from reloading the page.
        event.preventDefault();

        if (findCareerBtn.disabled) return;

        try {
            const profile = getUserProfile();

            setLoadingState(true);
            showToast("Searching career information...");

            const backendData = await getCareerRecommendations(profile);

            const normalizedData = normalizeBackendResponse(
                backendData,
                profile
            );

            renderResults(normalizedData);

            showToast("Career search results loaded successfully.");

        } catch (error) {
            console.error("Career Guide error:", error);

            showToast(
                error.message || "Something went wrong. Please try again."
            );

        } finally {
            setLoadingState(false);
        }
    });
}


/* =========================================================
   12. INITIAL PAGE STATE
   ========================================================= */

hideResults();

console.log("Career Guide script loaded.");
console.log("Backend endpoint:", RECOMMEND_ENDPOINT);