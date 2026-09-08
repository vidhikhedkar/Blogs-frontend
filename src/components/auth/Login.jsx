import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../service/auth.service';
// import logo from '../assets/logo.png';

export default function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [showPassword, setShowPassword] = useState(false);

    const [passwordError, setPasswordError] = useState('');
    const [submitError, setSubmitError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Forbidden password characters
    const FORBIDDEN_REGEX = /[\s<>'"\\]/g;

    // Email handler
    const handleEmailChange = (e) => {
        const value = e.target.value;

        const sanitizedValue = value.replace(
            /[^a-zA-Z0-9@._-]/g,
            ''
        );

        setEmail(sanitizedValue);

        // Clear API error when user starts typing
        if (submitError) {
            setSubmitError('');
        }
    };

    // Password key protection
    const handlePasswordKeyDown = (e) => {
        const blockedKeys = [
            ' ',
            '<',
            '>',
            '"',
            "'",
            '\\',
        ];

        if (
            blockedKeys.includes(e.key) ||
            e.code === 'Space'
        ) {
            e.preventDefault();

            setPasswordError(
                `Characters < > ' " \\ and spaces are disabled.`
            );
        }
    };

    // Password change
    const handlePasswordChange = (e) => {
        const rawValue = e.target.value;

        const sanitizedValue = rawValue.replace(
            FORBIDDEN_REGEX,
            ''
        );

        setPassword(sanitizedValue);

        if (rawValue !== sanitizedValue) {
            setPasswordError(
                `Forbidden characters (<, >, ', ", \\, or spaces) were removed.`
            );
        } else if (
            sanitizedValue.length > 0 &&
            sanitizedValue.length < 8
        ) {
            setPasswordError(
                'Password must be at least 8 characters long.'
            );
        } else {
            setPasswordError('');
        }

        // Clear API error when user changes password
        if (submitError) {
            setSubmitError('');
        }
    };

    // Toggle password
    const togglePasswordVisibility = () => {
        setShowPassword((prev) => !prev);
    };

    // Submit login
    const handleSubmit = async (event) => {
        event.preventDefault();

        setSubmitError('');

        // Password validation
        if (!password) {
            setPasswordError(
                'Please enter your password.'
            );
            return;
        }

        if (password.length < 8) {
            setPasswordError(
                'Password must be at least 8 characters long.'
            );
            return;
        }

        if (passwordError) {
            return;
        }

        setIsSubmitting(true);

        try {
            // Calls:
            // POST /api/auth/login
            //
            // Payload:
            // {
            //     email,
            //     password
            // }

            await login(email, password);

            // Backend sets authentication token
            // in cookie because api.service.js
            // uses withCredentials: true.

            navigate('/dashboard');

        } catch (error) {
            console.error(
                'Login Error:',
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Invalid email or password. Please try again.';

            setSubmitError(message);

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 px-3 py-6 sm:p-4 overflow-x-hidden">

            <div className="bg-[linear-gradient(to_bottom,#000000_0%,#80808094_30%,#FFFFFF_100%)] p-6 sm:p-10 rounded-3xl shadow-sm w-full max-w-md box-border">

                {/* Logo */}
                {/* <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Company Logo"
                        className="w-48 max-w-full rounded-lg px-2 py-2 object-contain"
                    />
                </div> */}

                {/* Header */}
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                        Welcome Back
                    </h2>

                    <p className="text-gray-600 text-sm sm:text-base mt-2">
                        Please enter your details to sign in
                    </p>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">
                            EMAIL ADDRESS
                        </label>

                        <input
                            type="email"
                            inputMode="email"
                            autoComplete="email"
                            autoCapitalize="none"
                            autoCorrect="off"
                            spellCheck="false"
                            placeholder="Enter your email"
                            value={email}
                            onChange={handleEmailChange}
                            required
                            className="w-full px-4 py-3.5 bg-blue-50 border border-transparent rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition duration-200"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-gray-700 tracking-wider uppercase mb-2">
                            PASSWORD
                        </label>

                        <div className="relative">

                            <input
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                placeholder="Enter your password"
                                value={password}
                                onKeyDown={
                                    handlePasswordKeyDown
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                autoComplete="current-password"
                                enterKeyHint="go"
                                required
                                className="w-full pl-4 pr-12 py-3.5 bg-blue-50 border border-transparent rounded-2xl text-gray-800 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-indigo-400 transition duration-200 "
                            />

                            {/* Password toggle */}
                            <button
                                type="button"
                                onClick={
                                    togglePasswordVisibility
                                }
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-sm font-medium text-gray-500 hover:text-indigo-600 focus:outline-none cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.03 10.03 0 013.982-.863c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-2.182-1.222a4 4 0 11-5.656-5.656"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M3 3l18 18"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="w-5 h-5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />

                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                )}
                            </button>
                        </div>

                        {/* Password error */}
                        {passwordError && (
                            <p className="text-xs text-red-600 font-medium mt-2">
                                {passwordError}
                            </p>
                        )}
                    </div>

                    {/* API Error */}
                    {submitError && (
                        <p className="text-xs text-red-600 font-medium">
                            {submitError}
                        </p>
                    )}

                    {/* Login button */}
                    <button
                        type="submit"
                        disabled={
                            isSubmitting ||
                            Boolean(passwordError)
                        }
                        aria-busy={isSubmitting}
                        className="w-full py-4 bg-[#009FEF] text-white font-medium rounded-2xl hover:bg-[#028FEC] disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-sm mt-2 cursor-pointer"
                    >
                        {isSubmitting
                            ? 'Signing In...'
                            : 'Sign In'}
                    </button>

                </form>

                {/* Register */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    Create an account?{' '}

                    <Link
                        to="/register"
                        className="text-indigo-600 font-semibold hover:underline"
                    >
                        Register
                    </Link>
                </p>

            </div>
        </div>
    );
}