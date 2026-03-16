// ----------------------------
// Load Audit Data
// ----------------------------
async function loadAuditData() {
    const token = localStorage.getItem("token"); // Manager JWT token

    const loadingContainer = document.getElementById("loadingContainer");
    const errorContainer = document.getElementById("errorContainer");
    const emptyContainer = document.getElementById("emptyContainer");
    const tableWrapper = document.getElementById("tableWrapper");
    const auditTableBody = document.getElementById("auditTableBody");
    const resultCount = document.getElementById("resultCount");
    const showingCount = document.getElementById("showingCount");

    loadingContainer.style.display = "block";
    errorContainer.style.display = "none";
    emptyContainer.style.display = "none";
    tableWrapper.style.display = "none";

    try {
        const res = await fetch("http://localhost:5000/api/manager/audit", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        if (res.status === 403) throw new Error("Forbidden: You are not a manager");
        if (!res.ok) throw new Error("Failed to fetch audit data");

        const data = await res.json();
        loadingContainer.style.display = "none";

        if (!data || data.length === 0) {
            emptyContainer.style.display = "block";
            return;
        }

        tableWrapper.style.display = "block";
        auditTableBody.innerHTML = "";

        data.forEach(req => {
            const date = new Date(req.created_at).toLocaleDateString();
            const statusClass = req.status.toLowerCase() === "approved" ? "approved" : "rejected";

            auditTableBody.innerHTML += `
<tr>
    <td>${req.id}</td>
    <td>${req.title}</td>
    <td>${req.requester}</td>
    <td><span class="status-badge ${statusClass}">${req.status}</span></td>
    <td>${req.amount.toLocaleString()}</td>
    <td>${req.vendor}</td>
    <td>${req.description}</td>
    <td>${date}</td>
</tr>
            `;
        });

        resultCount.innerText = `Showing ${data.length} records`;
        showingCount.innerText = `Showing ${data.length} of 50 requests`;

    } catch (err) {
        console.error(err);
        loadingContainer.style.display = "none";
        errorContainer.style.display = "block";
        document.getElementById("errorMessage").innerText = err.message;
    }
}
// Function to export table to CSV
function exportTableToCSV(filename = "audit_data.csv") {
    const table = document.getElementById("auditTableBody");
    const rows = Array.from(table.querySelectorAll("tr"));
    
    if (rows.length === 0) {
        alert("No data to export!");
        return;
    }

    // Collect headers
    const headers = ["ID","Title","Requester","Status","Amount","Vendor","Description","Created Date"];
    let csvContent = headers.join(",") + "\n";

    // Collect rows
    rows.forEach(row => {
        const cols = Array.from(row.querySelectorAll("td"));
        const rowData = cols.map(td => {
            // Remove commas from text to avoid CSV breaking
            let text = td.innerText.replace(/,/g, " ");
            return `"${text}"`; // wrap in quotes
        });
        csvContent += rowData.join(",") + "\n";
    });

    // Create a blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// ----------------------------
// Search functionality
// ----------------------------
document.getElementById("searchInput").addEventListener("input", function() {
    const searchValue = this.value.toLowerCase();
    const rows = document.querySelectorAll("#auditTableBody tr");
    let visibleCount = 0;

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        if (text.includes(searchValue)) {
            row.style.display = "";
            visibleCount++;
        } else {
            row.style.display = "none";
        }
    });

    document.getElementById("resultCount").innerText = `Showing ${visibleCount} records`;
    document.getElementById("clearSearch").style.display = searchValue ? "inline-flex" : "none";
});

// Clear search input
document.getElementById("clearSearch").addEventListener("click", function() {
    document.getElementById("searchInput").value = "";
    this.style.display = "none";
    loadAuditData();
});

// ----------------------------
// Display current date
// ----------------------------
document.getElementById("current-date").innerText = new Date().toLocaleDateString();
document.getElementById("exportBtn").addEventListener("click", () => {
    exportTableToCSV();
});

// Load data when page loads
window.addEventListener("DOMContentLoaded", loadAuditData);