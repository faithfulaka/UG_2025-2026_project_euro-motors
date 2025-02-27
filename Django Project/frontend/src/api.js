import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

export const registerUser = async (email, password) => {
  return axios.post(`${API_URL}/register/`, { email, password });
};

export const loginUser = async (email, password) => {
  const response = await axios.post(`${API_URL}/login/`, { email, password });
  localStorage.setItem("token", response.data.token);
  return response.data;
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No token");
  const response = await axios.get(`${API_URL}/user/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const logoutUser = async () => {
  localStorage.removeItem("token");
};