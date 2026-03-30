const API_BASE = "https://purchase-system.onrender.com/api/manager";

document.addEventListener("DOMContentLoaded", () => {
    fetchRequests();
    setCurrentDate();
    setupDepartmentFilter();
    setupSearchFilter();
});

function setCurrentDate() {
    document.getElementById("current-date").textContent = new Date().toDateString();
}

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
        const res = await fetch(`${API_BASE}/requests`, { headers: { "Authorization": `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch requests");
        const requests = await res.json();

        for (let req of requests) {
            const itemsRes = await fetch(`https://purchase-system.onrender.com/api/requests/${req.id}`, { headers: { "Authorization": `Bearer ${token}` } });
            const data = await itemsRes.json();
            req.items = data.items || [];
        }

        populateTable(requests);
        updateStats(requests);

        loading.style.display = "none";
        if (requests.length === 0) empty.style.display = "flex";
        else tableContainer.style.display = "block";

    } catch (err) {
        console.error(err);
        loading.style.display = "none";
        error.style.display = "flex";
        document.getElementById("error-message").textContent = "Failed to load requests from server";
    }
}

function populateTable(requests) {
    const tbody = document.getElementById("requests-tbody");
    tbody.innerHTML = "";

    requests.forEach(req => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><input type="checkbox"></td>
            <td>#${req.id}</td>
            <td>${req.title}</td>
            <td>${req.department}</td>
            <td>${req.priority}</td>
            <td>${req.items.map(i => i.item_name).join("<br>")}</td>
            <td>${req.items.map(i => i.quantity).join("<br>")}</td>
            <td>${req.items.map(i => "$" + i.total).join("<br>")}</td>
            <td>${req.status}</td>
            <td>
                ${req.status === "sent_to_manager" ? `
                <button class="approve-btn" onclick="openApproveModal(${req.id})">Approve</button>
                <button class="reject-btn" onclick="openRejectModal(${req.id})">Reject</button>` : ''}
            </td>
        `;
        tbody.appendChild(row);
    });
}

function updateStats(requests) {
    const pending = requests.filter(r => r.status === "sent_to_manager").length;
    const approved = requests.filter(r => r.status === "approved").length;
    const rejected = requests.filter(r => r.status === "rejected").length;
    const totalValue = requests.reduce((sum, r) => sum + r.items.reduce((t,i) => t + Number(i.total),0), 0);

    document.getElementById("stat-pending").textContent = pending;
    document.getElementById("stat-approved").textContent = approved;
    document.getElementById("stat-rejected").textContent = rejected;
    document.getElementById("stat-total").textContent = "$" + totalValue.toFixed(2);
}

let currentRequestId = null;

function openApproveModal(id) {
    currentRequestId = id;
    document.getElementById("approve-modal").style.display = "flex";
}

function closeApproveModal() {
    document.getElementById("approve-modal").style.display = "none";
    currentRequestId = null;
}

async function confirmApprove() {
    const token = localStorage.getItem("token");
    const notes = document.getElementById("approve-notes").value;
    try {
        const res = await fetch(`${API_BASE}/approve/${currentRequestId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ notes })
        });
        if (!res.ok) throw new Error("Failed to approve request");
        closeApproveModal();
        showToast("Request approved successfully");
        fetchRequests();
    } catch (err) { console.error(err); alert("Failed to approve request"); }
}

function openRejectModal(id) {
    currentRequestId = id;
    document.getElementById("reject-modal").style.display = "flex";
}

function closeRejectModal() {
    document.getElementById("reject-modal").style.display = "none";
    currentRequestId = null;
}

async function confirmReject() {
    const token = localStorage.getItem("token");
    const reason = document.getElementById("reject-reason").value.trim();
    if (!reason) { alert("Please provide a rejection reason"); return; }
    try {
        const res = await fetch(`${API_BASE}/reject/${currentRequestId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ reason })
        });
        if (!res.ok) throw new Error("Failed to reject request");
        closeRejectModal();
        showToast("Request rejected successfully");
        fetchRequests();
    } catch (err) { console.error(err); alert("Failed to reject request"); }
}

function showToast(message) {
    const toast = document.getElementById("success-toast");
    document.getElementById("toast-message").textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 3000);
}

function setupDepartmentFilter() {
    const buttons = document.querySelectorAll(".dept-pill");
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            const dept = btn.dataset.dept;
            filterByDepartment(dept);
        });
    });
}

function filterByDepartment(dept) {
    const rows = document.querySelectorAll("#requests-tbody tr");
    rows.forEach(row => {
        const department = row.children[3].textContent;
        row.style.display = (dept === "all" || department === dept) ? "" : "none";
    });
}

function setupSearchFilter() {
    const searchInput = document.getElementById("search-input");
    searchInput.addEventListener("input", () => {
        const query = searchInput.value.trim();
        const rows = document.querySelectorAll("#requests-tbody tr");
        rows.forEach(row => {
            const id = row.children[1].textContent.replace("#", "");
            row.style.display = id.includes(query) ? "" : "none";
        });
    });
}