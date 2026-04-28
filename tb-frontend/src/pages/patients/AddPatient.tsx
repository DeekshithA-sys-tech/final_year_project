import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { User, Activity, FileText, Camera, ArrowLeft, ScanLine, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { createPatient } from '../../services/patients';
import { addPatient } from '../../store/patientSlice';
import { analyzeXray } from '../../services/inference';

type AnalysisState = 'idle' | 'analyzing' | 'completed';

interface ModelResult {
    name: string;
    probability: number;
    status: 'pending' | 'analyzing' | 'completed';
}


const validationSchema = Yup.object().shape({
    fullName: Yup.string().matches(/^[a-zA-Z\s]+$/, 'Full name must contain only characters').required('Full name is required'),
    age: Yup.number().typeError('Age is required').min(1, 'Age must be between 1 and 100').max(100, 'Age must be between 1 and 100').required('Age is required'),
    gender: Yup.string().oneOf(['Male', 'Female', 'Other']).required('Gender is required'),
    contactNumber: Yup.string().matches(/^\d{10}$/, 'Must be exactly 10 digits').required('Contact number is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),

    // Clinical
    additionalNotes: Yup.string()
});

const AddPatient = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [analysisState, setAnalysisState] = useState<AnalysisState>('idle');
    const [models, setModels] = useState<ModelResult[]>([
        { name: 'ResNet-50', probability: 0, status: 'pending' },
        { name: 'DenseNet-121', probability: 0, status: 'pending' },
        { name: 'GAN Enhance + Classify', probability: 0, status: 'pending' },
    ]);
    const [finalProbability, setFinalProbability] = useState<number>(0);
    const [isTbPositive, setIsTbPositive] = useState<boolean>(false);

    useEffect(() => {
        if (analysisState === 'analyzing') {
            const runAnalysis = async () => {
                // Set all to analyzing so user knows they are all running in the backend
                setModels(m => m.map((mod) => ({ ...mod, status: 'analyzing' })));
                
                try {
                    if (!imagePreview) throw new Error("No image found");
                    
                    const result = await analyzeXray(imagePreview);
                    
                    const p1 = result.resnet_prob_tb;
                    const p2 = result.densenet_prob_tb;
                    const p3 = result.gan_prob_tb;
                    
                    setModels(m => m.map((mod, i) => {
                        if (i === 0) return { ...mod, status: 'completed', probability: p1 };
                        if (i === 1) return { ...mod, status: 'completed', probability: p2 };
                        if (i === 2) return { ...mod, status: 'completed', probability: p3 };
                        return mod;
                    }));

                    const tbProbs = [p1, p2, p3];
                    // Better Logic: Dynamic Ensemble Checking
                    // 1. Filter out models returning ~0% (which isolates the GAN exception fallback)
                    const validProbs = tbProbs.filter(p => p > 0.01);
                    
                    let calculatedProb = 0;
                    if (validProbs.length > 0) {
                        // 2. Compute average among the responsive models
                        const avgProb = validProbs.reduce((acc, curr) => acc + curr, 0) / validProbs.length;
                        
                        // 3. High Sensitivity Medical Override: 
                        // If ANY individual model is highly confident (> 70%) of Tuberculosis, 
                        // prioritize that maximum signal to prevent false negatives.
                        const maxProb = Math.max(...validProbs);
                        calculatedProb = maxProb >= 0.70 ? maxProb : avgProb;
                    }
                    
                    const finalProb = calculatedProb;
                    setFinalProbability(finalProb);
                    setIsTbPositive(finalProb > 0.5);
                    setAnalysisState('completed');
                    toast.success("AI Analysis complete!");

                } catch (error: any) {
                    toast.error(error.message || "AI Analysis failed");
                    setAnalysisState('idle');
                    setModels(m => m.map((mod) => ({ ...mod, status: 'pending', probability: 0 })));
                }
            };
            runAnalysis();
        }
    }, [analysisState, imagePreview]);

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'onChange',
        defaultValues: {
        }
    });



    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setAnalysisState('idle');
                setModels(m => m.map(mod => ({ ...mod, status: 'pending', probability: 0 })));
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data: any) => {
        setIsSubmitting(true);

        // Transform string "Yes"/"No" back to boolean where needed for the backend
        const formattedData = {
            ...data,

            xrayImage: imagePreview,
            tbProbabilityScore: analysisState === 'completed' ? finalProbability : undefined,
            aiAnalysisStatus: analysisState === 'completed' ? 'Completed' : 'Pending',
        };

        try {
            const newPatient = await createPatient(formattedData);
            dispatch(addPatient(newPatient));
            toast.success('Patient record created successfully!');
            navigate('/patients');
        } catch (err) {
            toast.error('Failed to create patient record.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-12">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/patients')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Patient</h1>
                    <p className="mt-1 text-sm text-gray-500">Enter complete patient details including medical history and clinical data.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white px-6 py-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                        <User className="text-primary-600" size={20} /> Personal Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Full Name *</label>
                            <input
                                type="text"
                                {...register('fullName', {
                                    onChange: (e) => {
                                        e.target.value = e.target.value.replace(/[^A-Za-z\s]/g, '');
                                    }
                                })}
                                className={`mt-1 block w-full border ${errors.fullName ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Age *</label>
                            <input type="number" {...register('age')} className={`mt-1 block w-full border ${errors.age ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`} />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Gender *</label>
                            <select {...register('gender')} className={`mt-1 block w-full border ${errors.gender ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`}>
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Contact Number *</label>
                            <input type="text" {...register('contactNumber')} className={`mt-1 block w-full border ${errors.contactNumber ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`} />
                            {errors.contactNumber && <p className="text-red-500 text-xs mt-1">{errors.contactNumber.message as string}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address *</label>
                            <input type="email" {...register('email')} className={`mt-1 block w-full border ${errors.email ? 'border-red-300' : 'border-gray-300'} rounded-lg shadow-sm py-2 px-3 focus:ring-primary-500 focus:border-primary-500 sm:text-sm`} />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message as string}</p>}
                        </div>
                    </div>
                </div>



                {/* Clinical Data & Imaging */}
                <div className="bg-white px-6 py-6 shadow-sm rounded-xl border border-gray-100">
                    <h2 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4 flex items-center gap-2">
                        <Camera className="text-primary-600" size={20} /> Clinical Data & Deep Learning Input
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Chest X-Ray Upload * (JPG, PNG, DICOM)</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:bg-gray-50 transition-colors">
                                    <div className="space-y-1 text-center">
                                        <Camera className="mx-auto h-12 w-12 text-gray-400" />
                                        <div className="flex text-sm text-gray-600 justify-center">
                                            <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                                                <span>Upload a file</span>
                                                <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/jpeg, image/png, application/dicom" onChange={handleImageChange} required={!imagePreview} />
                                            </label>
                                        </div>
                                        <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Medical Notes</label>
                                <textarea rows={3} {...register('additionalNotes')} className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 sm:text-sm focus:ring-primary-500 focus:border-primary-500"></textarea>
                            </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 h-full flex flex-col justify-center items-center">
                            <h3 className="text-sm font-medium text-gray-700 mb-2 w-full text-left">Image Preview & Analysis</h3>
                            {imagePreview ? (
                                <div className="flex flex-col flex-1 w-full space-y-4">
                                    <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-300 bg-black">
                                        <img src={imagePreview} alt="X-Ray preview" className="object-contain w-full h-full" />
                                        {analysisState === 'analyzing' && (
                                            <div className="absolute inset-0 bg-primary-600/20 z-10">
                                                <div className="absolute top-0 left-0 w-full h-1 bg-primary-400 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(59,130,246,0.8)]"></div>
                                            </div>
                                        )}
                                    </div>
                                    {analysisState === 'idle' && (
                                        <button
                                            type="button"
                                            onClick={() => setAnalysisState('analyzing')}
                                            className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                                        >
                                            <ScanLine className="mr-2 h-5 w-5" /> Run AI Analysis
                                        </button>
                                    )}
                                    {analysisState === 'analyzing' && (
                                        <div className="space-y-4 w-full">
                                            {models.map(model => (
                                                <div key={model.name} className="flex flex-col">
                                                    <div className="flex justify-between text-xs mb-1">
                                                        <span className="flex items-center gap-1">
                                                            {model.status === 'analyzing' && <RefreshCw className="w-3 h-3 text-primary-600 animate-spin" />}
                                                            {model.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                                                            {model.name}
                                                        </span>
                                                        {model.status === 'completed' && <span className="font-bold">{(model.probability * 100).toFixed(1)}%</span>}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 border border-gray-100">
                                                        <div
                                                            className={`h-1.5 rounded-full transition-all duration-1000 ease-out ${model.probability > 0.5 ? 'bg-red-500' : 'bg-green-500'}`}
                                                            style={{ width: model.status === 'completed' ? `${model.probability * 100}%` : '0%' }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {analysisState === 'completed' && (
                                        <div className={`mt-auto p-4 rounded-xl border flex flex-col justify-center items-center text-center ${isTbPositive ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                            <h4 className={`text-xs uppercase font-bold tracking-wider mb-1 ${isTbPositive ? 'text-red-800' : 'text-green-800'}`}>AI Result</h4>
                                            <div className="text-xl font-black text-gray-900 flex items-center gap-2">
                                                {isTbPositive ? (
                                                    <><AlertTriangle className="text-red-600 w-5 h-5" /> TB POSITIVE</>
                                                ) : (
                                                    <><CheckCircle2 className="text-green-600 w-5 h-5" /> TB NEGATIVE</>
                                                )}
                                            </div>
                                            <p className="text-xs mt-1 text-gray-700 font-medium">Confidence Score: {(finalProbability * 100).toFixed(2)}%</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-full flex-1 min-h-[300px] aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                                    <FileText size={48} className="mb-2 opacity-50" />
                                    <p className="text-sm">No image uploaded</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-4 space-x-4">
                    <button type="button" onClick={() => navigate('/patients')} className="bg-white py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                        Cancel
                    </button>
                    <button type="submit" disabled={isSubmitting} className="flex justify-center py-2 px-6 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors disabled:opacity-75">
                        {isSubmitting ? 'Saving...' : 'Save Patient Record'}
                    </button>
                </div>
            </form>
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes scan {
                0% { transform: translateY(0); }
                50% { transform: translateY(1000%); }
                100% { transform: translateY(0); }
                }
            `}} />
        </div>
    );
};

export default AddPatient;
