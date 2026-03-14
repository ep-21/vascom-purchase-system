// script.js
const API_BASE = "http://localhost:5000/api"; // Correct API base

document.addEventListener("DOMContentLoaded", () => {
    fetchRequests();
    setCurrentDate();
});

// Show today's date in header
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

        updateStats(requests);

    } catch (err) {
        console.error(err);
        loading.style.display = "none";
        error.style.display = "flex";
        document.getElementById("error-message").textContent =
            "Failed to load requests from server";
    }
}
// Priority filter buttons
const priorityPills = document.querySelectorAll(".priority-pill");

priorityPills.forEach(pill => {
    pill.addEventListener("click", () => {
        // Remove active class from all pills
        priorityPills.forEach(p => p.classList.remove("active"));
        // Add active to the clicked pill
        pill.classList.add("active");

        // Get the selected priority
        const priority = pill.getAttribute("data-priority");
        filterByPriority(priority);
    });
});

// Function to filter table rows based on priority
function filterByPriority(priority) {
    const tbody = document.getElementById("requests-tbody");
    const rows = tbody.querySelectorAll("tr");

    rows.forEach(row => {
        const rowPriority = row.querySelector(".priority").textContent.toLowerCase();
        if (priority === "all" || rowPriority === priority) {
            row.style.display = ""; // show row
        } else {
            row.style.display = "none"; // hide row
        }
    });
}

// Format date for table
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString();
}

// Update stats cards
function updateStats(requests) {
    const total = requests.length;
    document.getElementById("stat-from-technical").textContent = total;
    document.getElementById("stat-pending").textContent = total;
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