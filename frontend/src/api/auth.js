
const API_URL = "http://localhost:5000/api/auth";

async function sendAuthRequest(endpoint, userData) {
  const response = await fetch(`${API_URL}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Request failed");
  }

  return data;
}

export function registerUser(userData) {
  return sendAuthRequest("register", userData);
}

export function loginUser(userData) {
  return sendAuthRequest("login", userData);
}
