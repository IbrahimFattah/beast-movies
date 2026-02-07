import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface User {
    id: number;
    username: string;
    email: string;
}

export interface SignupData {
    username: string;
    email: string;
    password: string;
}

export interface LoginData {
    username: string;
    password: string;
}

export const authService = {
    async signup(data: SignupData): Promise<User> {
        const response = await axios.post(`${API_URL}/auth/signup`, data, {
            withCredentials: true,
            timeout: 10000, // 10 second timeout
        });
        return response.data.user;
    },

    async login(data: LoginData): Promise<User> {
        const response = await axios.post(`${API_URL}/auth/login`, data, {
            withCredentials: true,
            timeout: 10000, // 10 second timeout
        });
        return response.data.user;
    },

    async logout(): Promise<void> {
        await axios.post(`${API_URL}/auth/logout`, {}, {
            withCredentials: true,
            timeout: 5000,
        });
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true,
                timeout: 5000, // 5 second timeout - never hang forever
            });
            return response.data.user;
        } catch (error) {
            // Silently return null - user is simply not logged in
            return null;
        }
    },
};
