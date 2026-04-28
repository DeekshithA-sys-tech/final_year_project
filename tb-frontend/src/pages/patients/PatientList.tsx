import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getPatients, deletePatient as deletePatientService } from '../../services/patients';
import { setPatients, setLoading, setError, deletePatient } from '../../store/patientSlice';
import { Patient } from '../../types';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Search, Filter, Trash2, Eye, Plus } from 'lucide-react';

const PatientList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { list: patients, loading } = useSelector((state: RootState) => state.patients);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchPatients();
    }, [dispatch]);

    const fetchPatients = async () => {
        dispatch(setLoading(true));
        try {
            const data = await getPatients();
            dispatch(setPatients(data));
        } catch (err: any) {
            dispatch(setError(err.message));
            toast.error('Failed to load patients');
        }
    };

    const handleConfirmDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) return;
        
        try {
            console.log('Dispatching positive optimistic deletion for', id);
            dispatch(deletePatient(id));
            await deletePatientService(id);
            toast.success('Patient deleted successfully');
        } catch (err: any) {
            toast.error('Failed to sync deletion with server');
        }
    };

    const filteredPatients = patients.filter((p: Patient) => {
        const matchesSearch = p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.id.toLowerCase().includes(searchTerm.toLowerCase());
        
        let testStatus = 'Pending';
        if (p.tbProbabilityScore !== undefined) {
            testStatus = p.tbProbabilityScore > 0.5 ? 'Positive' : 'Negative';
        }

        const matchesFilter = statusFilter === 'All' || testStatus === statusFilter;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
                    <p className="mt-1 text-sm text-gray-500">Manage and view all patient records.</p>
                </div>
                <Link
                    to="/patients/add"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
                >
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    Add Patient
                </Link>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search by name or TB-ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>
                <div className="sm:w-64 relative flex items-center">
                    <Filter className="h-5 w-5 text-gray-400 absolute left-3" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full pl-10 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-lg border appearance-none"
                    >
                        <option value="All">All Statuses</option>
                        <option value="Positive">Positive</option>
                        <option value="Negative">Negative</option>
                        <option value="Pending">Pending</option>
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden text-left">
                {loading ? (
                    <div className="p-8 text-center text-gray-500 flex justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Status</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No patients found matching your search criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient: Patient) => (
                                        <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold">
                                                        {patient.fullName.charAt(0)}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{patient.fullName}</div>
                                                        <div className="text-sm text-gray-500">{patient.contactNumber}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                                TB-{patient.id.slice(-5).toUpperCase()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age} / {patient.gender}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${patient.tbProbabilityScore !== undefined && patient.tbProbabilityScore > 0.5 ? 'bg-red-100 text-red-800' :
                                                        patient.tbProbabilityScore !== undefined && patient.tbProbabilityScore <= 0.5 ? 'bg-green-100 text-green-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}
                                                >
                                                    {patient.tbProbabilityScore !== undefined ? (patient.tbProbabilityScore > 0.5 ? 'Positive' : 'Negative') : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end space-x-3">
                                                    <Link to={`/patients/${patient.id}`} className="text-primary-600 hover:text-primary-900">
                                                        <Eye className="h-5 w-5" />
                                                    </Link>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleConfirmDelete(patient.id)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientList;
