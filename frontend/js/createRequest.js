const token = localStorage.getItem("token");
if (!token) window.location.href = "login.html";

const form = document.getElementById("requestForm");
const addItemBtn = document.getElementById("addItemBtn");
const itemsContainer = document.getElementById("itemsContainer");

addItemBtn.addEventListener("click", () => {
    const div = document.createElement("div");
    div.className = "item-row";
    div.innerHTML = `
        <input type="text" placeholder="Item Name" class="item_name" required>
        <input type="number" placeholder="Quantity" class="quantity" required>
        <input type="number" placeholder="Unit Price" class="unit_price" required>
        <button type="button" class="removeItemBtn">Remove</button>
    `;
    itemsContainer.appendChild(div);
    div.querySelector(".removeItemBtn").addEventListener("click", () => div.remove());
});

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const items = [];
    document.querySelectorAll(".item-row").forEach(row => {
        items.push({
            item_name: row.querySelector(".item_name").value,
            quantity: parseFloat(row.querySelector(".quantity").value),
            unit_price: parseFloat(row.querySelector(".unit_price").value)
        });
    });

    const data = {
        title: document.getElementById("title").value,
        department: document.getElementById("department").value,
        vendor: document.getElementById("vendor").value,
        priority: document.getElementById("priority").value,
        request_date: document.getElementById("request_date").value,
        description: document.getElementById("description").value,
        items
    };

    try {
        const response = await fetch("http://localhost:5000/api/requests", {
            method: "POST",
            headers: {
                "Content-Type":"application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const resData = await response.json();
        if (response.ok) {
            alert(`Request created! Total Amount: $${resData.totalAmount}`);
            form.reset();
            window.location.href = "technical.html";
        } else {
            alert(resData.message || "Failed to create request");
        }

    } catch(err){
        console.error(err);
        alert("Server error");
    }
});