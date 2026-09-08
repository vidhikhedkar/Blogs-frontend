
import React, {
    useEffect,
    useRef,
    useState,
} from 'react';

import {
    useLocation,
    useNavigate,
} from 'react-router-dom';

import {
    FiMail,
    FiRefreshCw,
    FiArrowLeft,
} from 'react-icons/fi';
import { forgotPassword, verifyResetOtp } from '../service/auth.service';

// import {
//     forgotPassword,
//     // verifyResetOtp,
// } from '../service/auth.service';


export default function VerifyOtp() {

    const navigate = useNavigate();
    const location = useLocation();

    const email = location.state?.email || '';


    const [otp, setOtp] = useState([
        '',
        '',
        '',
        '',
        '',
        '',
    ]);


    const [submitError, setSubmitError] =
        useState('');

    const [successMessage, setSuccessMessage] =
        useState('');

    const [isSubmitting, setIsSubmitting] =
        useState(false);

    const [isResending, setIsResending] =
        useState(false);


    const inputRefs = useRef([]);


    // ==========================================
    // OTP INPUT
    // ==========================================

    const handleChange = (index, value) => {

        const sanitizedValue = value
            .replace(/[^0-9]/g, '');


        const newOtp = [...otp];

        newOtp[index] =
            sanitizedValue.slice(-1);


        setOtp(newOtp);

        setSubmitError('');
        setSuccessMessage('');


        if (
            sanitizedValue !== '' &&
            index < 5
        ) {

            inputRefs.current[
                index + 1
            ]?.focus();

        }
    };


    // ==========================================
    // KEYBOARD NAVIGATION
    // ==========================================

    const handleKeyDown = (index, e) => {

        if (e.key === 'Backspace') {

            if (
                !otp[index] &&
                index > 0
            ) {

                inputRefs.current[
                    index - 1
                ]?.focus();

            }

        }


        if (
            e.key === 'ArrowLeft' &&
            index > 0
        ) {

            inputRefs.current[
                index - 1
            ]?.focus();

        }


        if (
            e.key === 'ArrowRight' &&
            index < 5
        ) {

            inputRefs.current[
                index + 1
            ]?.focus();

        }
    };


    // ==========================================
    // PASTE OTP
    // ==========================================

    const handlePaste = (e) => {

        e.preventDefault();


        const pastedData = e.clipboardData
            .getData('text')
            .replace(/[^0-9]/g, '')
            .slice(0, 6);


        if (!pastedData) {
            return;
        }


        const newOtp = [
            '',
            '',
            '',
            '',
            '',
            '',
        ];


        pastedData
            .split('')
            .forEach((char, index) => {

                newOtp[index] = char;

            });


        setOtp(newOtp);

        setSubmitError('');
        setSuccessMessage('');


        const focusIndex = Math.min(
            pastedData.length,
            5
        );


        inputRefs.current[
            focusIndex
        ]?.focus();
    };


    // ==========================================
    // VERIFY OTP
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();

        setSubmitError('');
        setSuccessMessage('');


        const code = otp.join('');


        if (code.length !== 6) {

            setSubmitError(
                'Please enter the complete 6-digit verification code.'
            );

            return;
        }


        if (!email) {

            setSubmitError(
                'Email address is missing. Please request a new OTP.'
            );

            return;
        }


        setIsSubmitting(true);


        try {

            /*
             * Backend:
             *
             * POST /api/auth/verify-reset-otp
             *
             * {
             *     email,
             *     otp
             * }
             */

            const response =
                await verifyResetOtp(
                    email,
                    code
                );


            console.log(
                'OTP Verification Success:',
                response
            );


            /*
             * Backend returns:
             *
             * {
             *     message:
             *       "OTP verified successfully.",
             *
             *     resetSessionToken:
             *       "..."
             * }
             */

            const resetSessionToken =
                response?.resetSessionToken ||
                response?.data?.resetSessionToken;


            if (!resetSessionToken) {

                throw new Error(
                    'Reset session token was not returned by the server.'
                );

            }


            setSuccessMessage(
                'OTP verified successfully.'
            );


            /*
             * Navigate to reset password page
             */

            navigate('/reset-password', {

                state: {
                    email,
                    resetSessionToken,
                },

            });

        } catch (error) {

            console.error(
                'OTP Verification Error:',
                error
            );


            setSubmitError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                'Invalid or expired verification code. Please try again.'
            );

        } finally {

            setIsSubmitting(false);

        }
    };


    // ==========================================
    // RESEND OTP
    // ==========================================

    const handleResendCode = async () => {

        if (
            !email ||
            isResending
        ) {

            return;

        }


        setSubmitError('');
        setSuccessMessage('');
        setIsResending(true);


        try {

            const response =
                await forgotPassword(email);


            console.log(
                'Resend OTP Response:',
                response
            );


            setOtp([
                '',
                '',
                '',
                '',
                '',
                '',
            ]);


            setSuccessMessage(
                'A new verification code has been sent to your email.'
            );


            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 50);

        } catch (error) {

            console.error(
                'Resend OTP Error:',
                error
            );


            setSubmitError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Unable to resend the verification code.'
            );

        } finally {

            setIsResending(false);

        }
    };


    // ==========================================
    // EMAIL DISPLAY
    // ==========================================

    const maskedEmail = email
        ? email.replace(
            /^(.{1})(.*)(@.*)$/,
            (_, first, middle, domain) =>
                `${ first }${
    '•'.repeat(
        Math.min(
            middle.length,
            4
        )
    )
}${ domain } `
        )
        : 'your email';


    // ==========================================
    // NO EMAIL
    // ==========================================

    useEffect(() => {

        if (!email) {

            setSubmitError(
                'Email address is missing. Please go back and enter your email.'
            );

        }

    }, [email]);


    return (

        <div className="min-h-screen w-full flex items-center justify-center bg-[#f8fafe] px-3 py-6 sm:p-4 overflow-x-hidden">

            <div className="bg-[linear-gradient(to_bottom,#000000_0%,#80808094_15%,#FFFFFF_100%)] p-6 sm:p-10 rounded-2xl sm:rounded-3xl shadow-sm w-full max-w-md box-border">

                <form
                    onSubmit={handleSubmit}
                    className="flex flex-col items-start sm:items-center w-full"
                >


                    {/* Email Icon */}

                    <div className="w-10 h-10 bg-blue-50/80 rounded-xl flex items-center justify-center text-[#009FEF] mb-4 sm:mb-6 self-start sm:self-center">

                        <FiMail className="w-5 h-5 sm:w-6 sm:h-6" />

                    </div>


                    {/* Heading */}

                    <div className="w-full text-left sm:text-center mb-5 sm:mb-6">

                        <h2 className="text-xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-1 sm:mb-2">

                            Verify Your Email

                        </h2>


                        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">

                            We've sent a 6-digit verification code to your work email.

                        </p>

                    </div>


                    {/* Email */}

                    <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50/50 border border-blue-100 rounded-full text-slate-700 text-xs sm:text-sm font-semibold mb-5 sm:mb-8 self-start sm:self-center">

                        <FiMail className="text-blue-600 w-3.5 h-3.5 sm:w-4 sm:h-4" />

                        <span className="truncate max-w-[200px]">

                            {maskedEmail}

                        </span>

                    </div>


                    {/* OTP */}

                    <div className="w-full mb-4">

                        <div className="grid grid-cols-6 gap-1.5 sm:gap-2.5">

                            {otp.map(
                                (digit, index) => (

                                    <input
                                        key={index}
                                        ref={(element) => {
                                            inputRefs.current[index] =
                                                element;
                                        }}
                                        type="text"
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        autoComplete={
                                            index === 0
                                                ? 'one-time-code'
                                                : 'off'
                                        }
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) =>
                                            handleChange(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        onKeyDown={(e) =>
                                            handleKeyDown(
                                                index,
                                                e
                                            )
                                        }
                                        onPaste={
                                            handlePaste
                                        }
                                        disabled={
                                            isSubmitting
                                        }
                                        className="w-full aspect-square text-center text-base sm:text-xl font-bold bg-white border border-slate-200 rounded-xl sm:rounded-2xl text-slate-800 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition duration-200 p-0 disabled:opacity-60"
                                    />

                                )
                            )}

                        </div>

                    </div>


                    {/* Expiry */}

                    <p className="w-full text-left sm:text-center text-xs text-slate-400 font-medium mb-5 sm:mb-6">

                        This verification code expires in 10 minutes.

                    </p>


                    {/* Error */}

                    {submitError && (

                        <p className="w-full text-xs text-red-600 font-medium text-center mb-4">

                            {submitError}

                        </p>

                    )}


                    {/* Success */}

                    {successMessage && (

                        <p className="w-full text-xs text-green-600 font-medium text-center mb-4">

                            {successMessage}

                        </p>

                    )}


                    {/* Verify */}

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 sm:py-4 bg-[#009FEF] text-white font-semibold rounded-xl sm:rounded-2xl hover:bg-[#028FEC] disabled:opacity-60 disabled:cursor-not-allowed transition duration-200 shadow-lg shadow-indigo-600/25 mb-5 sm:mb-6 text-sm sm:text-base cursor-pointer"
                    >

                        {isSubmitting
                            ? 'Verifying...'
                            : 'Verify OTP'}

                    </button>


                    {/* Actions */}

                    <div className="flex flex-col items-start sm:items-center w-full gap-2.5 sm:gap-3 mb-6 sm:mb-8 text-xs sm:text-sm font-semibold text-slate-500">


                        {/* Resend */}

                        <button
                            type="button"
                            onClick={
                                handleResendCode
                            }
                            disabled={
                                isResending ||
                                isSubmitting ||
                                !email
                            }
                            className="inline-flex items-center gap-2 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition py-1 cursor-pointer"
                        >

                            <FiRefreshCw
                                className={`w - 4 h - 4 ${
    isResending
        ? 'animate-spin'
        : ''
} `}
                            />


                            {isResending
                                ? 'Sending...'
                                : 'Resend Code'}

                        </button>


                        {/* Change Email */}

                        <button
                            type="button"
                            onClick={() =>
                                navigate(
                                    '/forgot-password'
                                )
                            }
                            className="inline-flex items-center gap-2 hover:text-slate-800 transition py-1 cursor-pointer"
                        >

                            <FiArrowLeft className="w-4 h-4" />

                            Change Email

                        </button>

                    </div>

                </form>

            </div>

        </div>
    );
}

