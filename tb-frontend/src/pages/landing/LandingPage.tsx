import React from 'react';
import { Link } from 'react-router-dom';
import { Activity, Shield, AlertTriangle, HeartPulse, ArrowRight } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white border-b border-gray-100 shadow-sm fixed w-full z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16 items-center">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <Activity className="text-primary-600 w-6 h-6" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 tracking-tight">TB Detect Pro</span>
                        </div>
                        <div className="flex space-x-4">
                            <Link to="/login" className="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
                                Sign In
                            </Link>
                            <Link to="/register" className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transition-colors">
                                Register
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="pt-24 pb-16 sm:pt-32 sm:pb-24 lg:pb-32 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-8">
                        Advanced <span className="text-primary-600">Tuberculosis</span> Detection
                    </h1>
                    <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
                        Empowering healthcare professionals with AI-driven preliminary diagnosis and comprehensive patient management. Discover TB sooner, treat it better.
                    </p>
                    <div className="mt-10 flex justify-center gap-4">
                        <Link to="/login" className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 md:py-4 md:text-lg md:px-10 transition-colors shadow-md">
                            Get Started
                        </Link>
                        <a href="#learn-more" className="inline-flex items-center justify-center px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors">
                            Learn More
                        </a>
                    </div>
                </div>
            </div>

            {/* Information Section */}
            <div id="learn-more" className="bg-gray-50 py-16 sm:py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900">Understanding Tuberculosis (TB)</h2>
                        <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                            Tuberculosis is a potentially serious infectious bacterial disease that mainly affects the lungs. It is spread through the air when an infected person coughs or sneezes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Quote Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <AlertTriangle className="h-10 w-10 text-yellow-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">The Impact</h3>
                            <blockquote className="italic text-gray-600">
                                "TB remains one of the world's deadliest infectious killers. Each day, nearly 4000 people lose their lives to TB and close to 28,000 people fall ill with this preventable and curable disease."
                            </blockquote>
                        </div>

                        {/* Smoking Risk Card */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <HeartPulse className="h-10 w-10 text-red-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">TB and Smoking</h3>
                            <p className="text-gray-600">
                                Smoking greatly increases the risk of TB and death from TB. Quitting smoking is one of the most effective ways to lower your risk. Keep your lungs clean and healthy.
                            </p>
                        </div>

                        {/* Cautions and Prevention */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <Shield className="h-10 w-10 text-green-500 mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Prevention Methods</h3>
                            <ul className="space-y-2 text-gray-600 list-disc pl-5">
                                <li>BCG vaccination for infants.</li>
                                <li>Cover mouth when coughing or sneezing.</li>
                                <li>Ensure good ventilation in rooms.</li>
                                <li>Isolate active TB patients promptly.</li>
                                <li>Wear protective masks in high-risk areas.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feature Demo Section */}
            <div className="py-16 sm:py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl bg-primary-900 text-white overflow-hidden shadow-xl lg:flex">
                        <div className="p-8 lg:p-12 lg:w-1/2 flex flex-col justify-center">
                            <h2 className="text-3xl font-extrabold mb-4 text-white">AI-Powered Detection</h2>
                            <p className="text-primary-100 mb-8 text-lg">
                                Our platform integrates advanced Deep Learning models including ResNet, DenseNet, and GAN-enhanced pipelines to analyze Chest X-Rays efficiently and accurately, providing preliminary assessments in seconds.
                            </p>
                            <Link to="/login" className="inline-flex items-center text-white font-semibold hover:text-primary-200">
                                Try it now <ArrowRight className="ml-2 w-5 h-5" />
                            </Link>
                        </div>
                        <div className="lg:w-1/2 bg-gray-900 p-8 flex items-center justify-center">
                            {/* Placeholder for Xray demo image */}
                            <div className="w-full max-w-sm aspect-square bg-black border-4 border-gray-800 rounded-lg relative overflow-hidden flex flex-col items-center justify-center text-center p-6">
                                <div className="w-full h-1 bg-primary-500 absolute top-0 left-0 animate-[scan_3s_ease-in-out_infinite] shadow-[0_0_20px_rgba(59,130,246,1)] opacity-70"></div>
                                <Activity className="text-primary-500 w-16 h-16 mb-4 opacity-50" />
                                <div className="space-y-2">
                                    <div className="h-2 w-32 bg-gray-800 rounded mx-auto"></div>
                                    <div className="h-2 w-24 bg-gray-800 rounded mx-auto"></div>
                                    <div className="h-2 w-40 bg-gray-800 rounded mx-auto"></div>
                                </div>
                                <div className="absolute bottom-4 right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded shadow">
                                    Analyzing...
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Inline keyframes for animation in LandingPage */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                0% { transform: translateY(0); }
                50% { transform: translateY(350px); }
                100% { transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default LandingPage;
