document.addEventListener("DOMContentLoaded", function () {
    const githubUrlInput = document.getElementById("github-url");
    const convertBtn = document.getElementById("convert-btn");
    const resultContainer = document.getElementById("result-container");
    const urlResults = document.getElementById("url-results");
    const embedContainer = document.getElementById("embed-container");
    const embedResults = document.getElementById("embed-results");
    const toggleEmbedBtn = document.getElementById("toggle-embed");

    let isEmbedShown = false;

    const resetBtn = document.getElementById('reset-btn');
    resetBtn.addEventListener('click', function() {
        githubUrlInput.value = '';
        resultContainer.classList.add('hidden');
        githubUrlInput.focus();
        showSuccess('Form has been reset');
    });

    // Convert button click handler
    convertBtn.addEventListener("click", convertUrl);

    // Also convert when pressing Enter in the input field
    githubUrlInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
        convertUrl();
        }
    });

    // Toggle embed code visibility
    toggleEmbedBtn.addEventListener("click", function () {
        isEmbedShown = !isEmbedShown;

        if (isEmbedShown) {
        embedContainer.classList.remove("hidden");
        toggleEmbedBtn.innerHTML =
            '<span>Hide Embed Code</span><i class="fas fa-chevron-up ml-1 text-xs"></i>';
        } else {
        embedContainer.classList.add("hidden");
        toggleEmbedBtn.innerHTML =
            '<span>Show Embed Code</span><i class="fas fa-chevron-down ml-1 text-xs"></i>';
        }
    });

    // Main conversion function
    function convertUrl() {
        const githubUrl = githubUrlInput.value.trim();

        if (!githubUrl) {
        showError("Please enter a GitHub URL");
        return;
        }

        try {
        const parsedUrl = parseGitHubUrl(githubUrl);

        if (!parsedUrl) {
            showError("Invalid GitHub URL format");
            return;
        }

        const { user, repo, branch, path } = parsedUrl;

        // Generate jsDelivr URLs
        const baseUrl = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${branch}/${path}`;
        const baseUrlNoBranch = `https://cdn.jsdelivr.net/gh/${user}/${repo}/${path}`;

        // Fetch commit hash for this branch
        fetchCommitHash(user, repo, branch)
            .then((commitHash) => {
            if (!commitHash) {
                throw new Error("Could not fetch commit hash");
            }

            const shortHash = commitHash.substring(0, 7);
            const urlWithFullHash = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${commitHash}/${path}`;
            const urlWithShortHash = `https://cdn.jsdelivr.net/gh/${user}/${repo}@${shortHash}/${path}`;

            // Display results
            displayResults({
                withFullHash: urlWithFullHash,
                withShortHash: urlWithShortHash,
                withoutHash: baseUrl,
                baseUrlNoBranch: baseUrlNoBranch,
            });

            // Display embed code
            displayEmbedCode({
                user,
                repo,
                branch,
                path,
                commitHash,
                shortHash,
            });

            resultContainer.classList.remove("hidden");
            })
            .catch((error) => {
            console.error("Error fetching commit hash:", error);
            // Fallback to URLs without commit hash
            displayResults({
                withFullHash: baseUrl,
                withShortHash: baseUrl,
                withoutHash: baseUrl,
                baseUrlNoBranch: baseUrlNoBranch,
            });

            displayEmbedCode({
                user,
                repo,
                branch,
                path,
                commitHash: branch, // fallback to branch name
                shortHash: branch.substring(0, 7),
            });

            resultContainer.classList.remove("hidden");
            });
        } catch (error) {
        showError("Error processing URL: " + error.message);
        }
    }

    // Parse GitHub URL into components
    function parseGitHubUrl(url) {
        let user, repo, branch, path;

        // Handle raw.githubusercontent.com URLs
        if (url.includes("raw.githubusercontent.com")) {
        const parts = url.split("raw.githubusercontent.com/")[1].split("/");
        if (parts.length < 4) return null;

        user = parts[0];
        repo = parts[1];
        branch = parts[2];
        path = parts.slice(3).join("/");

        return { user, repo, branch, path };
        }

        // Handle github.com URLs
        if (url.includes("github.com")) {
        const parts = url.split("github.com/")[1].split("/");
        if (parts.length < 5) return null;

        user = parts[0];
        repo = parts[1];

        // Handle different GitHub URL types (blob, raw, blame)
        if (parts[2] === "blob" || parts[2] === "raw" || parts[2] === "blame") {
            branch = parts[3];
            path = parts.slice(4).join("/");
        } else {
            return null;
        }

        return { user, repo, branch, path };
        }

        return null;
    }

    // Fetch the latest commit hash for a branch
    async function fetchCommitHash(user, repo, branch) {
        try {
        const response = await fetch(
            `https://api.github.com/repos/${user}/${repo}/commits/${branch}`
        );
        if (!response.ok) {
            throw new Error("GitHub API request failed");
        }
        const data = await response.json();
        return data.sha;
        } catch (error) {
        console.error("Error fetching commit hash:", error);
        return null;
        }
    }

    // Display the converted URLs
    function displayResults(urls) {
        urlResults.innerHTML = `
            <div class="space-y-4 fade-in">
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-medium text-gray-700">Direct link with latest commit (long hash)</h3>
                        <p class="text-xs text-gray-500 mt-1">Pinned to specific commit for maximum reliability</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="test-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium" onclick="window.open('${urls.withFullHash}', '_blank')">
                            <i class="fas fa-external-link-alt mr-1"></i> Test
                        </button>
                        <button class="copy-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium" data-url="${urls.withFullHash}">
                            <i class="far fa-copy mr-1"></i> Copy
                        </button>
                    </div>
                    </div>
                    <div class="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                    <code class="text-sm text-gray-800 whitespace-nowrap">${urls.withFullHash}</code>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-medium text-gray-700">Direct link with latest commit (short hash)</h3>
                        <p class="text-xs text-gray-500 mt-1">Pinned to specific commit but with shorter URL</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="test-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium" onclick="window.open('${urls.withShortHash}', '_blank')">
                            <i class="fas fa-external-link-alt mr-1"></i> Test
                        </button>
                        <button class="copy-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium" data-url="${urls.withShortHash}">
                            <i class="far fa-copy mr-1"></i> Copy
                        </button>
                    </div>
                    </div>
                    <div class="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                    <code class="text-sm text-gray-800 whitespace-nowrap">${urls.withShortHash}</code>
                    </div>
                </div>
                
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-medium text-gray-700">Direct link without latest commit</h3>
                        <p class="text-xs text-gray-500 mt-1">Will always serve the latest version from the branch</p>
                    </div>
                    <div class="flex space-x-2">
                        <button class="test-btn bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium" onclick="window.open('${urls.withoutHash}', '_blank')">
                            <i class="fas fa-external-link-alt mr-1"></i> Test
                        </button>
                        <button class="copy-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium" data-url="${urls.withoutHash}">
                            <i class="far fa-copy mr-1"></i> Copy
                        </button>
                    </div>
                    </div>
                    <div class="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                    <code class="text-sm text-gray-800 whitespace-nowrap">${urls.withoutHash}</code>
                    </div>
                </div>
            </div>
        `;

        // Add event listeners to copy buttons
        document.querySelectorAll(".copy-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const url = this.getAttribute("data-url");
            copyToClipboard(url);

            // Visual feedback
            this.classList.add("copied");
            this.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';

            setTimeout(() => {
            this.classList.remove("copied");
            this.innerHTML = '<i class="far fa-copy mr-1"></i> Copy';
            }, 2000);
        });
        });
    }

    // Display embed code for the URLs
    function displayEmbedCode(data) {
        const fileExt = data.path.split(".").pop().toLowerCase();
        let fileType = "file";
        let embedTags = [];

        if (["js", "mjs"].includes(fileExt)) {
        fileType = "JavaScript";
        embedTags = [
            {
            title: "Script tag with full commit hash",
            code: `<script src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.commitHash}/${data.path}"><\/script>`,
            },
            {
            title: "Script tag with short commit hash",
            code: `<script src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.shortHash}/${data.path}"><\/script>`,
            },
            {
            title: "Script tag without commit hash",
            code: `<script src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.branch}/${data.path}"><\/script>`,
            },
            {
            title: "ES Module import",
            code: `import { /* your imports */ } from 'https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.commitHash}/${data.path}';`,
            },
        ];
        } else if (["css", "scss", "less"].includes(fileExt)) {
        fileType = "CSS";
        embedTags = [
            {
            title: "Stylesheet link with full commit hash",
            code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.commitHash}/${data.path}">`,
            },
            {
            title: "Stylesheet link with short commit hash",
            code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.shortHash}/${data.path}">`,
            },
            {
            title: "Stylesheet link without commit hash",
            code: `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.branch}/${data.path}">`,
            },
        ];
        } else if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(fileExt)) {
        fileType = "Image";
        embedTags = [
            {
            title: "Image tag with full commit hash",
            code: `<img src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.commitHash}/${data.path}" alt="Image">`,
            },
            {
            title: "Image tag with short commit hash",
            code: `<img src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.shortHash}/${data.path}" alt="Image">`,
            },
            {
            title: "Image tag without commit hash",
            code: `<img src="https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.branch}/${data.path}" alt="Image">`,
            },
        ];
        } else {
        embedTags = [
            {
            title: "Direct link with full commit hash",
            code: `https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.commitHash}/${data.path}`,
            },
            {
            title: "Direct link with short commit hash",
            code: `https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.shortHash}/${data.path}`,
            },
            {
            title: "Direct link without commit hash",
            code: `https://cdn.jsdelivr.net/gh/${data.user}/${data.repo}@${data.branch}/${data.path}`,
            },
        ];
        }

        let embedHTML = `
            <div class="mb-4">
                <p class="text-sm text-gray-600">File type detected: <span class="font-medium">${fileType}</span></p>
            </div>
            <div class="space-y-4 fade-in">
        `;

        embedTags.forEach((tag) => {
        embedHTML += `
                <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div class="flex justify-between items-start mb-2">
                    <div>
                        <h3 class="font-medium text-gray-700">${tag.title}</h3>
                    </div>
                    <button class="copy-btn bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium" data-url="${escapeHtml(
                        tag.code
                    )}">
                        <i class="far fa-copy mr-1"></i> Copy
                    </button>
                    </div>
                    <div class="bg-white p-3 rounded border border-gray-300 overflow-x-auto">
                    <code class="text-sm text-gray-800 whitespace-nowrap">${escapeHtml(
                        tag.code
                    )}</code>
                    </div>
                </div>
            `;
        });

        embedHTML += `</div>`;
        embedResults.innerHTML = embedHTML;

        document.querySelectorAll("#embed-results .copy-btn").forEach((btn) => {
        btn.addEventListener("click", function () {
            const code = this.getAttribute("data-url");
            copyToClipboard(code);

            this.classList.add("copied");
            this.innerHTML = '<i class="fas fa-check mr-1"></i> Copied!';

            setTimeout(() => {
            this.classList.remove("copied");
            this.innerHTML = '<i class="far fa-copy mr-1"></i> Copy';
            }, 2000);
        });
        });
    }

    // Show error message
    function showError(message, duration = 5000) {
        const notification = document.createElement("div");
        notification.className = "notification error fade-in";
        notification.innerHTML = `
            <i class="fas fa-exclamation-circle"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById("notification-container");
        container.appendChild(notification);

        setTimeout(() => {
        notification.style.animation = "fadeOut 0.3s ease-out forwards";
        notification.addEventListener("animationend", () => {
            notification.remove();
        });
        }, duration);

        notification.addEventListener("click", () => {
        notification.style.animation = "fadeOut 0.3s ease-out forwards";
        notification.addEventListener("animationend", () => {
            notification.remove();
        });
        });
    }

    function showSuccess(message, duration = 5000) {
        const notification = document.createElement("div");
        notification.className = "notification success fade-in";
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        const container = document.getElementById("notification-container");
        container.appendChild(notification);

        setTimeout(() => {
        notification.style.animation = "fadeOut 0.3s ease-out forwards";
        notification.addEventListener("animationend", () => {
            notification.remove();
        });
        }, duration);

        notification.addEventListener("click", () => {
        notification.style.animation = "fadeOut 0.3s ease-out forwards";
        notification.addEventListener("animationend", () => {
            notification.remove();
        });
        });
    }

    // Helper function to copy text to clipboard
    function copyToClipboard(text) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        showSuccess("URL copied to clipboard!", 3000);
    }

    // Helper function to escape HTML
    function escapeHtml(unsafe) {
        return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
});