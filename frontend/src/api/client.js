import { auth } from "../firebase/config";

const API_URL = process.env.REACT_APP_API_URL;

export async function apiFetch(
    endpoint,
    options = {}
) {
    const user = auth.currentUser;

    if (!user) {
        throw new Error(
            "User is not authenticated."
        );
    }

    const token = await user.getIdToken();

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "Content-Type":"application/json",
                Authorization:`Bearer ${token}`,
                ...(options.headers || {}),
            },
        }
    );

    if (response.status === 204) {
        return null;
    }

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {

        const error = new Error(
            data?.detail ||
            "Something went wrong."
        );

        error.status = response.status;
        error.data = data;
        throw error;
    }

    return data;
}

