// Get token and username from localStorage
const token = localStorage.getItem("token");
const userName = localStorage.getItem("name");

// Redirect to login if no token
if (!token) {
    alert("You must login first");
    window.location.href = "login.html";
}

// Elements for the dashboard cards
const totalCard = document.getElementById("totalRequests");
const pendingCard = document.getElementById("pendingRequests");
const approvedCard = document.getElementById("approvedRequests");
const rejectedCard = document.getElementById("rejectedRequests");

// Table body for recent requests
const tableBody = document.getElementById("requestsTable");

// Load requests from backend
async function loadRequests() {
    try {
        const response = await fetch("http://localhost:5000/api/requests", {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to fetch requests: ${errorText}`);
        }

        const requests = await response.json();

        // Filter requests created by this technical user
        const userRequests = requests.filter(r => r.requester === userName);

        // Count requests by status
        const total = userRequests.length;
        const pending = userRequests.filter(r => r.status === "pending").length;
        const approved = userRequests.filter(r => r.status === "approved").length;
        const rejected = userRequests.filter(r => r.status === "rejected").length;

        // Update dashboard cards
        totalCard.innerText = total;
        pendingCard.innerText = pending;
        approvedCard.innerText = approved;
        rejectedCard.innerText = rejected;

        // Populate recent requests table
        tableBody.innerHTML = "";
        userRequests.forEach(r => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${r.id}</td>
                <td>${r.title}</td>
                <td>${r.requester}</td>
                <td style="color: ${statusColor(r.status)}">${capitalize(r.status || "Pending")}</td>
                <td>$${r.total_amount || calculateTotal(r.items)}</td>
                <td>${new Date(r.request_date).toLocaleDateString()}</td>
            `;
            tableBody.appendChild(tr);
        });

    } catch (err) {
        console.error("Load Requests Error:", err);
        alert("Failed to load requests. Please check your login or server.");
    }
}

// Helper: color code status
function statusColor(status) {
    if (!status) return "orange"; // default to pending color
    switch (status.toLowerCase()) {
        case "approved": return "green";
        case "rejected": return "red";
        case "pending": return "orange";
        default: return "black";
    }
}

// Helper: capitalize first letter
function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Helper: calculate total if backend doesn't provide total_amount
function calculateTotal(items) {
    if (!items || !items.length) return 0;
    return items.reduce((sum, item) => sum + (item.total || (item.quantity * item.unit_price)), 0);
}

// Logout button
const logoutBtn = document.querySelector(".logout-btn");
logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    window.location.href = "login.html";
});

// Load requests when page loads
loadRequests();