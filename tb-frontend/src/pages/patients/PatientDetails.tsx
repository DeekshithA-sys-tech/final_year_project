import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPatientById } from '../../services/patients';
import { Patient } from '../../types';
import { toast } from 'react-toastify';
import { ArrowLeft, User, Activity, FileText, Camera, ShieldAlert } from 'lucide-react';

const PatientDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [patient, setPatient] = useState<Patient | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPatient = async () => {
            try {
                if (id) {
                    const data = await getPatientById(id);
                    setPatient(data);
                }
            } catch (err: any) {
                toast.error('Patient not found');
                navigate('/patients');
            } finally {
                setLoading(false);
            }
        };

        fetchPatient();
    }, [id, navigate]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!patient) return null;

    return (
        <div className="max-w-6xl mx-auto space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/patients')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{patient.fullName}</h1>
                        <p className="mt-1 text-sm text-gray-500">ID: TB-{patient.id.slice(-5).toUpperCase()} • Registered: {new Date(patient.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <Link
                        to={`/reports?patientId=${patient.id}`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Generate Report
                    </Link>
                    <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
                        Edit Patient
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-white px-6 py-6 shadow-sm rounded-xl border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                            <User className="text-primary-600" size={20} /> Personal Information
                        </h2>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Age</dt>
                                <dd className="mt-1 text-sm text-gray-900">{patient.age} years</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Gender</dt>
                                <dd className="mt-1 text-sm text-gray-900">{patient.gender}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Contact Number</dt>
                                <dd className="mt-1 text-sm text-gray-900">{patient.contactNumber}</dd>
                            </div>
                            <div>
                                <dt className="text-sm font-medium text-gray-500">Email Address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{patient.email}</dd>
                            </div>
                            <div className="sm:col-span-2">
                                <dt className="text-sm font-medium text-gray-500">Address</dt>
                                <dd className="mt-1 text-sm text-gray-900">{patient.address || 'N/A'}</dd>
                            </div>
                        </dl>
                    </div>


                </div>

                {/* Right Column - Deep Learning & Clinical Data */}
                <div className="space-y-6">
                    <div className="bg-white px-6 py-6 shadow-sm rounded-xl border border-gray-100">
                        <h2 className="text-lg font-medium text-gray-900 border-b pb-3 mb-4 flex items-center gap-2">
                            <Camera className="text-primary-600" size={20} /> DL Analysis Result
                        </h2>

                        <div className="flex flex-col items-center py-4 text-center">
                            <div className="relative w-48 h-48 mb-4 border border-gray-200 rounded-lg bg-black overflow-hidden flex items-center justify-center">
                                {patient.xrayImage ? (
                                    <img src={patient.xrayImage} alt="Chest X-Ray" className="object-contain w-full h-full" />
                                ) : (
                                    <span className="text-gray-400 text-sm">No X-Ray Image Data</span>
                                )}
                            </div>

                            <div className="w-full">
                                <h3 className="text-sm font-medium text-gray-500 mb-1">TB Likelihood</h3>
                                <div className="text-3xl font-bold text-gray-900 mb-2">
                                    {patient.tbProbabilityScore !== undefined ? (patient.tbProbabilityScore > 0.5 ? 'Positive' : 'Negative') : 'Pending Analysis'}
                                </div>

                                {patient.tbProbabilityScore !== undefined && (
                                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                                        <div
                                            className={`h-2.5 rounded-full ${patient.tbProbabilityScore > 0.7 ? 'bg-red-600' :
                                                    patient.tbProbabilityScore > 0.3 ? 'bg-yellow-400' : 'bg-green-500'
                                                }`}
                                            style={{ width: `${patient.tbProbabilityScore * 100}%` }}
                                        ></div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PatientDetails;
