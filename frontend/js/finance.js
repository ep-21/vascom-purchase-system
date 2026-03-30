// finance.js
const API_BASE = "https://purchase-system.onrender.com/api"; // your backend

document.addEventListener("DOMContentLoaded", () => {
    fetchRequests();
    setCurrentDate();
});

// Show today's date
function setCurrentDate() {
    const dateElement = document.getElementById("current-date");
    const today = new Date();
    dateElement.textContent = today.toDateString();
}

// Fetch all finance requests
async function fetchRequests() {
    const loading = document.getElementById("loading-container");
    const error = document.getElementById("error-container");
    const tableContainer = document.getElementById("table-container");
    const tbody = document.getElementById("requests-tbody");
    const empty = document.getElementById("empty-container");

    loading.style.display = "flex";
    tableContainer.style.display = "none";
    error.style.display = "none";
    empty.style.display = "none";

    try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/finance/requests`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Failed to fetch requests");

        const requests = await res.json();

        loading.style.display = "none";

        if (requests.length === 0) {
            empty.style.display = "flex";
            tbody.innerHTML = "";
            updateStats([]);
            return;
        }

        tableContainer.style.display = "block";
        tbody.innerHTML = "";

        requests.forEach(req => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td><input type="checkbox"></td>
                <td>#${req.id}</td>
                <td>${req.title}</td>
                <td><span class="priority ${req.priority}">${req.priority}</span></td>
                <td>${formatDate(req.request_date)}</td>
                <td><span class="status pending">${req.status}</span></td>
                <td>
                    <button class="forward-btn" onclick="forwardRequest(${req.id})">
                        <i class="fas fa-share"></i> Forward
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Update stats cards
        updateStats(requests);

        // Setup priority filter
        setupPriorityFilter();

        // Setup search by ID
        setupSearchFilter();

    } catch (err) {
        console.error(err);
        loading.style.display = "none";
        error.style.display = "flex";
        document.getElementById("error-message").textContent =
            "Failed to load requests from server";
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Update stats cards
function updateStats(requests) {
    const total = requests.length;
    const forwarded = requests.filter(r => r.status === "sent_to_manager").length;
    const pending = requests.filter(r => r.status === "pending").length;

    document.getElementById("stat-from-technical").textContent = total;
    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-forwarded").textContent = forwarded;
    document.getElementById("incoming-count").textContent = total;
}

// Forward request to manager
async function forwardRequest(id) {
    const token = localStorage.getItem("token");
    const finance_comment = prompt("Optional comment for manager:");

    if (!confirm("Forward this request to the manager?")) return;

    try {
        const res = await fetch(`${API_BASE}/finance/forward/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ finance_comment })
        });

        const result = await res.json();
        alert(result.message || "Request forwarded successfully");

        // Refresh table
        fetchRequests();

    } catch (err) {
        console.error(err);
        alert("Failed to forward request");
    }
}


// Priority Filter Setup
function setupPriorityFilter() {
    const priorityPills = document.querySelectorAll(".priority-pill");

    priorityPills.forEach(pill => {
        pill.addEventListener("click", () => {
            priorityPills.forEach(p => p.classList.remove("active"));
            pill.classList.add("active");

            const priority = pill.getAttribute("data-priority");
            filterByPriority(priority);
        });
    });
}

function filterByPriority(priority) {
    const tbody = document.getElementById("requests-tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach(row => {
        const rowPriority = row.querySelector(".priority").textContent.toLowerCase();
        if (priority === "all" || rowPriority === priority) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}


// Search Filter Setup
function setupSearchFilter() {
    const searchInput = document.getElementById("search-input");

    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        filterById(query);
    });
}

function filterById(idQuery) {
    const tbody = document.getElementById("requests-tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach(row => {
        const rowId = row.querySelector("td:nth-child(2)").textContent.replace("#", "");
        if (rowId.includes(idQuery)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}