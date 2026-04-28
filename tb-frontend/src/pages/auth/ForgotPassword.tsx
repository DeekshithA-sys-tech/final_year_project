import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { Activity, Mail, ArrowLeft, KeyRound, Lock } from 'lucide-react';
import { forgotPassword, verifyOTP, resetPassword } from '../../services/auth';

const emailSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
});

const otpSchema = Yup.object().shape({
    otp: Yup.string().required('OTP is required'),
});

const passwordSchema = Yup.object().shape({
    password: Yup.string()
        .matches(
            /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,
            'Must contain min 8 chars, 1 uppercase, 1 number, 1 special character'
        )
        .required('New Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
        .required('Confirm Password is required'),
});

type Step = 'email' | 'otp' | 'password';

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { register: registerEmail, handleSubmit: handleEmailSubmit, formState: { errors: emailErrors } } = useForm({
        resolver: yupResolver(emailSchema),
    });

    const { register: registerOTP, handleSubmit: handleOTPSubmit, formState: { errors: otpErrors } } = useForm({
        resolver: yupResolver(otpSchema),
    });

    const { register: registerPassword, handleSubmit: handlePasswordSubmit, formState: { errors: passwordErrors } } = useForm({
        resolver: yupResolver(passwordSchema),
    });

    const onEmailSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            const res = await forgotPassword(data.email);
            setEmail(data.email);
            setStep('otp');
            toast.success('OTP sent to your email.');
            if ((res as any).otp) {
                toast.info(`(Mock) Your OTP is: ${(res as any).otp}`, { autoClose: false });
            }
        } catch (err: any) {
            toast.error('Failed to send OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const onOTPSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await verifyOTP(email, data.otp);
            setStep('password');
            toast.success('OTP verified successfully.');
        } catch (err: any) {
            toast.error(err.message || 'Invalid OTP.');
        } finally {
            setIsLoading(false);
        }
    };

    const onPasswordSubmit = async (data: any) => {
        setIsLoading(true);
        try {
            await resetPassword(email, data.password);
            toast.success('Password reset successfully. Please sign in.');
            navigate('/login');
        } catch (err: any) {
            toast.error('Failed to reset password.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8">
            <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto w-16 h-16 bg-primary-100 flex items-center justify-center rounded-full mb-4">
                        <Activity className="text-primary-600 w-10 h-10" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reset Password</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        {step === 'email' && 'Enter your email to receive an OTP'}
                        {step === 'otp' && 'Enter the OTP sent to your email'}
                        {step === 'password' && 'Enter your new password'}
                    </p>
                </div>

                {step === 'email' && (
                    <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit(onEmailSubmit)}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    {...registerEmail('email')}
                                    className={`block w-full pl-10 pr-3 py-2 border ${emailErrors.email ? 'border-red-300 ring-red-300' : 'border-gray-300'
                                        } rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                    placeholder="admin@tbdetect.com"
                                />
                            </div>
                            {emailErrors.email && (
                                <p className="mt-1 text-sm text-red-600">{emailErrors.email.message as string}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                            >
                                {isLoading ? 'Sending...' : 'Send OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'otp' && (
                    <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit(onOTPSubmit)}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="otp">
                                Enter OTP
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <KeyRound className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="otp"
                                    type="text"
                                    {...registerOTP('otp')}
                                    className={`block w-full pl-10 pr-3 py-2 border ${otpErrors.otp ? 'border-red-300 ring-red-300' : 'border-gray-300'
                                        } rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                    placeholder="123456"
                                />
                            </div>
                            {otpErrors.otp && (
                                <p className="mt-1 text-sm text-red-600">{otpErrors.otp.message as string}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                            >
                                {isLoading ? 'Verifying...' : 'Verify OTP'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 'password' && (
                    <form className="mt-8 space-y-6" onSubmit={handlePasswordSubmit(onPasswordSubmit)}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                                New Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    {...registerPassword('password')}
                                    className={`block w-full pl-10 pr-3 py-2 border ${passwordErrors.password ? 'border-red-300 ring-red-300' : 'border-gray-300'
                                        } rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                    placeholder="New Password"
                                />
                            </div>
                            {passwordErrors.password && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.password.message as string}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="confirmPassword">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="confirmPassword"
                                    type="password"
                                    {...registerPassword('confirmPassword')}
                                    className={`block w-full pl-10 pr-3 py-2 border ${passwordErrors.confirmPassword ? 'border-red-300 ring-red-300' : 'border-gray-300'
                                        } rounded-lg shadow-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                                    placeholder="Confirm Password"
                                />
                            </div>
                            {passwordErrors.confirmPassword && (
                                <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword.message as string}</p>
                            )}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'
                                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                            >
                                {isLoading ? 'Resetting...' : 'Reset Password'}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 flex items-center justify-center">
                    <Link to="/login" className="flex items-center text-sm font-medium text-primary-600 hover:text-primary-500">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to sign in
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
