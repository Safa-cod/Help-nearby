const API_URL = "http://127.0.0.1:8000";

const helpForm = document.getElementById("helpForm");
const requestList = document.getElementById("requestList");
const filter = document.getElementById("filter");
const message = document.getElementById("message");


// Load requests when page opens
loadRequests();


// Create new help request
helpForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const requestData = {
        help_type: document.getElementById("helpType").value,
        description: document.getElementById("description").value,
        location: document.getElementById("location").value,
        contact: document.getElementById("contact").value,
        urgency: document.getElementById("urgency").value
    };

    try {

        const response = await fetch(`${API_URL}/requests`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (!response.ok) {
            throw new Error("Failed to create request");
        }

        message.textContent = "Help request posted successfully!";
        message.style.color = "green";

        helpForm.reset();

        loadRequests();

    } catch (error) {

        message.textContent = "Could not connect to the server.";
        message.style.color = "red";

        console.error(error);
    }
});


// Filter requests
filter.addEventListener("change", loadRequests);


// Get requests from backend
async function loadRequests() {

    try {

        const response = await fetch(`${API_URL}/requests`);

        const requests = await response.json();

        displayRequests(requests);

    } catch (error) {

        requestList.innerHTML =
            "<p>Backend is not running. Please start the FastAPI server.</p>";

        console.error(error);
    }
}


// Display requests
function displayRequests(requests) {

    const selectedFilter = filter.value;

    requestList.innerHTML = "";

    const filteredRequests = requests.filter(request => {

        if (selectedFilter === "All") {
            return true;
        }

        return request.status === selectedFilter;
    });


    if (filteredRequests.length === 0) {

        requestList.innerHTML =
            "<p>No help requests found.</p>";

        return;
    }


    filteredRequests.forEach(request => {

        const card = document.createElement("div");

        card.className = "request-card";

        let statusClass = "";

        if (request.status === "Open") {
            statusClass = "status-open";
        }
        else if (request.status === "Accepted") {
            statusClass = "status-accepted";
        }
        else {
            statusClass = "status-completed";
        }


        card.innerHTML = `

            <h3>${escapeHTML(request.help_type)}</h3>

            <p>
                <strong>Description:</strong>
                ${escapeHTML(request.description)}
            </p>

            <p>
                <strong>📍 Location:</strong>
                ${escapeHTML(request.location)}
            </p>

            <p>
                <strong>📞 Contact:</strong>
                ${escapeHTML(request.contact)}
            </p>

            <p>
                <strong>Urgency:</strong>
                <span class="urgency-${request.urgency.toLowerCase()}">
                    ${escapeHTML(request.urgency)}
                </span>
            </p>

            <p>
                <strong>Status:</strong>
                <span class="status ${statusClass}">
                    ${escapeHTML(request.status)}
                </span>
            </p>

            <div class="actions">

                ${
                    request.status === "Open"
                    ?
                    `<button class="accept-btn"
                        onclick="acceptRequest(${request.id})">
                        🤝 Accept Help
                    </button>`
                    :
                    ""
                }

                ${
                    request.status === "Accepted"
                    ?
                    `<button class="complete-btn"
                        onclick="completeRequest(${request.id})">
                        ✅ Mark Completed
                    </button>`
                    :
                    ""
                }

                ${
                    request.status !== "Completed"
                    ?
                    `<button class="delete-btn"
                        onclick="deleteRequest(${request.id})">
                        🗑️ Delete
                    </button>`
                    :
                    ""
                }

            </div>
        `;

        requestList.appendChild(card);

    });
}


// Accept request
async function acceptRequest(id) {

    try {

        const response = await fetch(
            `${API_URL}/requests/${id}/accept`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            throw new Error("Failed");
        }

        loadRequests();

    } catch (error) {

        alert("Could not accept the request.");

    }
}


// Complete request
async function completeRequest(id) {

    try {

        const response = await fetch(
            `${API_URL}/requests/${id}/complete`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            throw new Error("Failed");
        }

        loadRequests();

    } catch (error) {

        alert("Could not complete the request.");

    }
}


// Delete request
async function deleteRequest(id) {

    const confirmDelete =
        confirm("Are you sure you want to delete this request?");

    if (!confirmDelete) {
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/requests/${id}`,
            {
                method: "DELETE"
            }
        );

        if (!response.ok) {
            throw new Error("Failed");
        }

        loadRequests();

    } catch (error) {

        alert("Could not delete the request.");

    }
}


// Prevent HTML injection
function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}