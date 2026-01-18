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
        });
        return response.data.user;
    },

    async login(data: LoginData): Promise<User> {
        const response = await axios.post(`${API_URL}/auth/login`, data, {
            withCredentials: true,
        });
        return response.data.user;
    },

    async logout(): Promise<void> {
        await axios.post(`${API_URL}/auth/logout`, {}, {
            withCredentials: true,
        });
    },

    async getCurrentUser(): Promise<User | null> {
        try {
            const response = await axios.get(`${API_URL}/auth/me`, {
                withCredentials: true,
            });
            return response.data.user;
        } catch (error) {
            return null;
        }
    },
};
