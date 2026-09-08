import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// import logo from '../assets/logo.png';

import {
    FiUser,
    FiMail,
    FiLock,
    FiEye,
    FiEyeOff,
} from 'react-icons/fi';
import { register } from '../service/auth.service';

export default function Register() {
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [passwordError, setPasswordError] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const FORBIDDEN_REGEX = /[\s<>'"\\]/g;

    // Username
    const handleUsernameChange = (e) => {
        const value = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');

        setFormData((prev) => ({
            ...prev,
            username: value,
        }));
    };

    // Email
    const handleEmailChange = (e) => {
        const value = e.target.value.replace(
            /[^a-zA-Z0-9@._-]/g,
            ''
        );

        setFormData((prev) => ({
            ...prev,
            email: value,
        }));
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
                `Characters < > ' " \\ and spaces are disabled for security.`
            );
        }
    };

    // Password change
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        const sanitizedValue = value.replace(
            FORBIDDEN_REGEX,
            ''
        );

        if (value !== sanitizedValue) {
            setPasswordError(
                `Forbidden characters (<, >, ', ", \\, or spaces) were removed.`
            );
        } else {
            setPasswordError('');
        }

        setFormData((prev) => ({
            ...prev,
            [name]: sanitizedValue,
        }));
    };

    // Submit
    const handleSubmit = async (event) => {
        event.preventDefault();

        const {
            username,
            email,
            password,
            confirmPassword,
        } = formData;

        setPasswordError('');
        setSubmitError('');

        // Username validation
        if (username.length < 3) {
            setSubmitError(
                'Username must be at least 3 characters long.'
            );
            return;
        }

        // Password validation
        if (password.length < 8) {
            setPasswordError(
                'Password must be at least 8 characters long.'
            );
            return;
        }

        // Confirm password validation
        if (password !== confirmPassword) {
            setPasswordError(
                'Passwords do not match.'
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // API payload:
            // {
            //     username: username,
            //     email: email,
            //     password: password
            // }

            await register(
                username,
                email,
                password
            );

            // Registration successful
            navigate('/login');

        } catch (error) {
            console.error(
                'Register Error:',
                error
            );

            const message =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Unable to create the account. Please try again.';

            setSubmitError(message);

        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafe] px-3 py-6 sm:p-4 overflow-x-hidden">

            <div className="bg-[linear-gradient(to_bottom,#000000_0%,#80808094_18%,#FFFFFF_100%)] p-6 sm:p-10 rounded-3xl shadow-sm w-full max-w-md box-border">

                {/* Logo */}
                {/* <div className="flex justify-center mb-6">
                    <img
                        src={logo}
                        alt="Company Logo"
                        className="w-48 max-w-full rounded-lg px-2 py-2 object-contain"
                    />
                </div> */}

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4"
                >

                    {/* Username */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                            USERNAME
                        </label>

                        <div className="relative">

                            <FiUser
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                            />

                            <input
                                type="text"
                                placeholder="Enter your username"
                                value={formData.username}
                                onChange={handleUsernameChange}
                                autoComplete="username"
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
                            />

                        </div>
                    </div>

                    {/* Email */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                            EMAIL
                        </label>

                        <div className="relative">

                            <FiMail
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                            />

                            <input
                                type="email"
                                inputMode="email"
                                autoComplete="email"
                                autoCapitalize="none"
                                autoCorrect="off"
                                spellCheck="false"
                                placeholder="Enter your work email"
                                value={formData.email}
                                onChange={handleEmailChange}
                                required
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
                            />

                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                            PASSWORD
                        </label>

                        <div className="relative">

                            <FiLock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                            />

                            <input
                                type={
                                    showPassword
                                        ? 'text'
                                        : 'password'
                                }
                                name="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onKeyDown={handlePasswordKeyDown}
                                onChange={handlePasswordChange}
                                autoComplete="new-password"
                                required
                                className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
                            />

                            <button
                                type="button"
                                aria-label={
                                    showPassword
                                        ? 'Hide password'
                                        : 'Show password'
                                }
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 tracking-wider uppercase mb-2">
                            CONFIRM PASSWORD
                        </label>

                        <div className="relative">

                            <FiLock
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5"
                            />

                            <input
                                type={
                                    showConfirmPassword
                                        ? 'text'
                                        : 'password'
                                }
                                name="confirmPassword"
                                placeholder="Confirm your password"
                                value={
                                    formData.confirmPassword
                                }
                                onKeyDown={
                                    handlePasswordKeyDown
                                }
                                onChange={
                                    handlePasswordChange
                                }
                                autoComplete="new-password"
                                required
                                className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition duration-200"
                            />

                            <button
                                type="button"
                                aria-label={
                                    showConfirmPassword
                                        ? 'Hide confirm password'
                                        : 'Show confirm password'
                                }
                                onClick={() =>
                                    setShowConfirmPassword(
                                        !showConfirmPassword
                                    )
                                }
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                                {showConfirmPassword ? (
                                    <FiEyeOff className="w-5 h-5" />
                                ) : (
                                    <FiEye className="w-5 h-5" />
                                )}
                            </button>

                        </div>
                    </div>

                    {/* Password Error */}
                    {passwordError && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                            {passwordError}
                        </p>
                    )}

                    {/* Submit Error */}
                    {submitError && (
                        <p className="text-xs text-red-600 font-medium mt-1">
                            {submitError}
                        </p>
                    )}

                    {/* Create Account */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        aria-busy={isSubmitting}
                        className="w-full py-4 bg-[#009FEF] text-white font-medium rounded-2xl hover:bg-[#028FEC] disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-indigo-600/30 mt-4 cursor-pointer"
                    >
                        {isSubmitting
                            ? 'Creating Account...'
                            : 'Create Account'}
                    </button>

                </form>

                {/* Sign In */}
                <p className="mt-6 text-center text-sm text-slate-500">
                    Already have an account?{' '}

                    <Link
                        to="/login"
                        className="text-indigo-600 font-semibold hover:underline cursor-pointer"
                    >
                        Sign In
                    </Link>
                </p>

            </div>
        </div>
    );
}