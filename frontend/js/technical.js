async function loadDashboard() {

    try {

        const token = localStorage.getItem("token");

        const res = await fetch("https://purchase-system.onrender.com/api/technical/dashboard", {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token
            }
        });

        const data = await res.json();

        if (!data.stats) {
            console.error("Unauthorized or invalid response:", data);
            return;
        }

        // Update cards
        document.getElementById("totalRequests").innerText = data.stats.total;
        document.getElementById("pendingRequests").innerText = data.stats.pending;
        document.getElementById("approvedRequests").innerText = data.stats.approved;
        document.getElementById("rejectedRequests").innerText = data.stats.rejected;

        // Update table
        const table = document.getElementById("requestsTable");
        table.innerHTML = "";

        data.recentRequests.forEach(req => {

            const date = new Date(req.created_at).toLocaleDateString();

            // Determine status class
            let statusClass = "pending";
            if(req.status === "approved") statusClass = "approved";
            if(req.status === "rejected") statusClass = "rejected";

            // Create table row
            table.innerHTML += `
<tr>
    <td>${req.id}</td>
    <td>${req.title}</td>
    <td>${req.requester}</td>
    <td><span class="status ${statusClass}">${req.status}</span></td>
    <td>${req.amount}</td>
    <td>${date}</td>
    <td>
        <button class="delete-btn" onclick="deleteRequest(${req.id})">Delete</button>
    </td>
</tr>
`;
        });

    } catch (err) {
        console.error(err);
    }

}

// Delete single request
async function deleteRequest(id) {

    const token = localStorage.getItem("token");

    if(!confirm("Delete this request?")) return;

    await fetch(`https://purchase-system.onrender.com/api/requests/${id}`,{
        method:"DELETE",
        headers:{
            "Authorization":"Bearer " + token
        }
    });

    loadDashboard(); // reload table
}


// Load dashboard on page load
window.addEventListener("DOMContentLoaded", loadDashboard);