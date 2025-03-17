const API_URL = "http://localhost:5000/api/users";

// ✅ Register User
async function register() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const phone = document.getElementById("regPhone").value; // New field
    const address = document.getElementById("regAddress").value; // New field

    const res = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone, address }), // Include new fields
    });

    const data = await res.json();
    alert(data.message);
    window.location.href = "login.html"; // Redirect to profile
}

// ✅ Login User
async function login() {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "profile.html"; // Redirect to profile
    } else {
        alert("Invalid login credentials");
    }
}

// ✅ Fetch User Profile
async function loadProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized!");
        window.location.href = "index.html";
        return;
    }

    const res = await fetch(`${API_URL}/profile`, {
        method: "GET",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await res.json();

    if (data.id) {
        document.getElementById("userName").innerText = data.name;
        document.getElementById("userEmail").innerText = data.email;
        document.getElementById("userPhone").innerText = data.phone; // New field
        document.getElementById("userAddress").innerText = data.address; // New field
    } else {
        alert("Session expired! Login again.");
        logout();
    }
}

// ✅ Logout
function logout() {
    localStorage.removeItem("token");
    window.location.href = "index.html";
}

// ✅ Auto Load Profile
if (window.location.pathname.includes("profile.html")) {
    loadProfile();
}

// إنشاء ملف
document.getElementById("createFileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized! Please login.");
        window.location.href = "index.html";
        return;
    }

    const fileName = document.getElementById("fileName").value;
    const fileContent = document.getElementById("fileContent").value;

    const res = await fetch(`${API_URL}/files/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ fileName, content: fileContent }),
    });

    const data = await res.json();
    alert(data.message);
});

// قراءة ملف
document.getElementById("readFileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized! Please login.");
        window.location.href = "index.html";
        return;
    }

    const fileName = document.getElementById("readFileName").value;

    const res = await fetch(`${API_URL}/files/read?fileName=${fileName}`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    const data = await res.json();
    if (data.content) {
        document.getElementById("fileContentDisplay").innerText = data.content;
    } else {
        alert(data.message || "File not found");
    }
});

// حذف ملف
document.getElementById("deleteFileForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
        alert("Not authorized! Please login.");
        window.location.href = "index.html";
        return;
    }

    const fileName = document.getElementById("deleteFileName").value;

    const res = await fetch(`${API_URL}/files/delete?fileName=${fileName}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    const data = await res.json();
    alert(data.message);
});