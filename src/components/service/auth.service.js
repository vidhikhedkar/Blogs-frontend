
import api from "./api.service";


// ===============================
// REGISTER
// ===============================
export const register = async (name, email, password) => {
    try {
        const payload = {
            username: name,
            email,
            password,
        };

        const response = await api.post(
            "/api/auth/register",
            payload
        );

        console.log("Register Response:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Register Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// LOGIN
// ===============================
export const login = async (email, password) => {
    try {
        const payload = {
            email,
            password,
        };

        const response = await api.post(
            "/api/auth/login",
            payload
        );

        console.log("Login Response:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Login Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// LOGOUT
// ===============================
export const logout = async () => {
    try {
        const response = await api.post(
            "/api/auth/logout"
        );

        console.log("Logout Response:", response.data);

        return response.data;
    } catch (error) {
        console.error(
            "Logout Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// FORGOT PASSWORD
// SEND OTP
// ===============================
export const forgotPassword = async (email) => {
    try {
        const payload = {
            email,
        };

        const response = await api.post(
            "/api/auth/forgot-password",
            payload
        );

        console.log(
            "Forgot Password / Send OTP Response:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Forgot Password Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// VERIFY RESET OTP
// ===============================
export const verifyResetOtp = async (email, otp) => {
    try {
        const payload = {
            email,
            otp,
        };

        const response = await api.post(
            "/api/auth/verify-reset-otp",
            payload
        );

        console.log(
            "Verify Reset OTP Response:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Verify Reset OTP Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// RESET PASSWORD
// ===============================
export const resetPassword = async (
    resetSessionToken,
    newPassword
) => {
    try {
        const payload = {
            resetSessionToken,
            newPassword,
        };

        const response = await api.post(
            "/api/auth/reset-password",
            payload
        );

        console.log(
            "Reset Password Response:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Reset Password Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};


// ===============================
// VERIFY AUTH
// ===============================
export const verifyAuth = async () => {
    try {
        const response = await api.get(
            "/api/auth/check-auth"
        );

        console.log(
            "Verify Auth Response:",
            response.data
        );

        return response.data;
    } catch (error) {
        console.error(
            "Verify Auth Error:",
            error.response?.data || error.message
        );

        throw error;
    }
};

