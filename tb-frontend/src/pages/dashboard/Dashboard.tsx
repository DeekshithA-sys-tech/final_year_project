import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getPatients } from '../../services/patients';
import { setPatients, setLoading, setError } from '../../store/patientSlice';
import { Users, FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const dispatch = useDispatch();
    const { list: patients, loading } = useSelector((state: RootState) => state.patients);
    const { user } = useSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchPatients = async () => {
            dispatch(setLoading(true));
            try {
                const data = await getPatients();
                dispatch(setPatients(data));
            } catch (err: any) {
                dispatch(setError(err.message || 'Failed to fetch patients'));
            }
        };

        fetchPatients();
    }, [dispatch]);

    const stats = {
        total: patients.length,
        positive: patients.filter(p => p.sputumTestResult === 'Positive').length,
        negative: patients.filter(p => p.sputumTestResult === 'Negative').length,
        pending: patients.filter(p => p.sputumTestResult === 'Pending').length,
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.fullName}</h1>
                <p className="mt-1 text-sm text-gray-500">Here's what's happening today.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Total Patients */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-primary-50 rounded-lg p-3">
                                <Users className="h-6 w-6 text-primary-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Total Patients</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.total}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Pending Tests */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-yellow-50 rounded-lg p-3">
                                <Clock className="h-6 w-6 text-yellow-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Tests</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.pending}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Positive Cases */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-red-50 rounded-lg p-3">
                                <AlertTriangle className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Positive Cases</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.positive}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Negative Cases */}
                <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 bg-green-50 rounded-lg p-3">
                                <CheckCircle className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="text-sm font-medium text-gray-500 truncate">Negative Cases</dt>
                                    <dd className="text-3xl font-semibold text-gray-900">{stats.negative}</dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-100 pb-3">Recent Patients</h2>

                {patients.length === 0 ? (
                    <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No patients</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by creating a new patient record.</p>
                        <div className="mt-6">
                            <Link
                                to="/patients/add"
                                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none"
                            >
                                New Patient
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="flow-root">
                        <ul className="-my-5 divide-y divide-gray-200">
                            {patients.slice(0, 5).map((patient) => (
                                <li key={patient.id} className="py-4">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-medium">
                                                {patient.fullName.charAt(0)}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">{patient.fullName}</p>
                                            <p className="text-sm text-gray-500 truncate">{patient.id} • {patient.age} yrs • {patient.gender}</p>
                                        </div>
                                        <div>
                                            <Link
                                                to={`/patients/${patient.id}`}
                                                className="inline-flex items-center shadow-sm px-3 py-1.5 border border-gray-300 text-sm leading-5 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                                            >
                                                View
                                            </Link>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
