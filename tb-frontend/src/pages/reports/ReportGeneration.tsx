import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Printer, Activity, FileText, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { getPatients } from '../../services/patients';
import { setPatients } from '../../store/patientSlice';

const ReportGeneration = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const reportRef = useRef<HTMLDivElement>(null);

    const [selectedPatientId, setSelectedPatientId] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const { list: patients } = useSelector((state: RootState) => state.patients);

    // Auto-search filtered array (display all initially, then filter)
    const filteredPatients = patients.filter(p => {
        if (!searchTerm) return true;
        return p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || p.contactNumber.includes(searchTerm);
    });
    const selectedPatient = patients.find(p => p.id === selectedPatientId);

    useEffect(() => {
        // If patients list is empty, fetch them
        if (patients.length === 0) {
            getPatients().then(data => dispatch(setPatients(data)));
        }
    }, [patients.length, dispatch]);

    useEffect(() => {
        // Check if patientId was passed in URL query
        const params = new URLSearchParams(location.search);
        const id = params.get('patientId');
        if (id) {
            setSelectedPatientId(id);
        }
    }, [location]);

    const generatePDF = async () => {
        if (!reportRef.current || !selectedPatient) return;

        setIsGenerating(true);
        try {
            toast.info('Generating PDF Report...');

            const canvas = await html2canvas(reportRef.current, { scale: 2 });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`TB_Report_${selectedPatient.id}_${new Date().toISOString().split('T')[0]}.pdf`);

            toast.success('Report generated successfully!');
        } catch (error) {
            toast.error('Failed to generate PDF. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handlePrint = () => {
        // simple print approach using browser API
        window.print();
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 pb-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/patients')} className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-600 shadow-sm transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Generate Report</h1>
                        <p className="mt-1 text-sm text-gray-500">Create comprehensive clinical PDF reports for patients.</p>
                    </div>
                </div>

                {selectedPatient && (
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <Printer className="mr-2 h-4 w-4" />
                            Print
                        </button>
                        <button
                            onClick={generatePDF}
                            disabled={isGenerating}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 disabled:opacity-75"
                        >
                            <Download className="mr-2 h-4 w-4" />
                            {isGenerating ? 'Generating...' : 'Download PDF'}
                        </button>
                    </div>
                )}
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4 relative">
                <label className="block text-sm font-medium text-gray-700">Search Patient for Report</label>
                <div className="max-w-md space-y-2 relative">
                    <input
                        type="text"
                        placeholder="Search by name or TB-ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && filteredPatients.length > 0) {
                                setSelectedPatientId(filteredPatients[0].id);
                                setSearchTerm(filteredPatients[0].fullName);
                            }
                        }}
                        className="block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    />
                </div>
            </div>

            {selectedPatient ? (
                <div className="bg-white shadow-xl max-w-4xl mx-auto border border-gray-200" id="report-container">
                    {/* Printable Report View (A4 Aspect Ratio Approximation) */}
                    <div
                        ref={reportRef}
                        className="p-8 sm:p-12 bg-white text-black"
                        style={{ minHeight: '1056px' }} // Approx A4 height at 96 DPI
                    >
                        {/* Report Header */}
                        <div className="border-b-2 border-primary-600 pb-6 mb-8 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Activity className="h-10 w-10 text-primary-600" />
                                <div>
                                    <h2 className="text-2xl font-bold uppercase tracking-wider text-gray-900">TB Detect Pro</h2>
                                    <p className="text-sm text-gray-500">Automated Tuberculosis Clinical Report</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-bold text-gray-800">Report Date: {new Date().toLocaleDateString()}</p>
                                <p className="text-sm text-gray-600">Generated by: System</p>
                            </div>
                        </div>

                        {/* Patient Info Section */}
                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Patient Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Patient ID:</span> TB-{selectedPatient.id.slice(-5).toUpperCase()}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Full Name:</span> {selectedPatient.fullName}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Age / Gender:</span> {selectedPatient.age} yrs / {selectedPatient.gender}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Contact:</span> {selectedPatient.contactNumber}</div>
                                <div className="col-span-2"><span className="font-semibold text-gray-600 w-32 inline-block">Registration:</span> {new Date(selectedPatient.createdAt).toLocaleString()}</div>
                            </div>
                        </section>



                        {/* Analysis Results (The core of report) */}
                        <section className="mb-8">
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Deep Learning Diagnosis & Test Results</h3>
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 flex items-center justify-between">
                                <div className="space-y-4 flex-1">
                                    <div>
                                        <h4 className="text-xs uppercase font-bold text-gray-500 tracking-wider">TB ANALYSIS RESULT</h4>
                                        <div className="mt-1 flex items-baseline">
                                            <span className="text-4xl font-extrabold text-primary-600 tracking-tight">
                                                {selectedPatient.tbProbabilityScore !== undefined ? (selectedPatient.tbProbabilityScore > 0.5 ? 'Positive' : 'Negative') : 'Pending'}
                                            </span>
                                            {selectedPatient.tbProbabilityScore !== undefined && (
                                                <span className="ml-2 text-sm text-gray-500 font-medium">({(selectedPatient.tbProbabilityScore * 100).toFixed(1)}%)</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {selectedPatient.xrayImage && (
                                    <div className="w-32 h-32 ml-8 border-2 border-gray-200 rounded-md overflow-hidden bg-black flex-shrink-0">
                                        <img src={selectedPatient.xrayImage} alt="Chest X-Ray Thumbnail" className="w-full h-full object-cover opacity-80" />
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* AI Recommendations */}
                        <section>
                            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">Recommendations</h3>
                            <div className="text-sm text-gray-800 leading-relaxed bg-blue-50 p-4 border border-blue-100 rounded-lg">
                                {(selectedPatient.tbProbabilityScore || 0) > 0.6 || selectedPatient.sputumTestResult === 'Positive' ? (
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li><strong>Urgent Action Required:</strong> Patient exhibits high probability of Tuberculosis.</li>
                                        <li>Initiate patient isolation immediately to prevent exposure.</li>
                                        <li>Consult pulmonologist for initiation of anti-TB therapy.</li>
                                        <li>Conduct further confirmatory NAAT / GeneXpert testing.</li>
                                        <li>Screen close family contacts.</li>
                                    </ul>
                                ) : (
                                    <ul className="list-disc pl-5 space-y-2">
                                        <li>Patient currently shows low probability of active Tuberculosis.</li>
                                        <li>Continue symptomatic treatment and observation.</li>
                                        <li>Reschedule for follow-up in 2 weeks if symptoms persist.</li>
                                        <li>Ensure general sanitary precautions.</li>
                                    </ul>
                                )}
                            </div>
                        </section>

                        {/* Footer */}
                        <div className="mt-16 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
                            <p>This report is auto-generated by the TB Detect Pro System.</p>
                            <p>Clinical decisions should be made by certified healthcare professionals considering full patient context.</p>
                            <p className="mt-2">Doc ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden text-left">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient Info</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age/Gender</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredPatients.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                                            No patients found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPatients.map((patient) => (
                                        <tr 
                                            key={patient.id} 
                                            onClick={() => setSelectedPatientId(patient.id)}
                                            className="hover:bg-primary-50 cursor-pointer transition-colors"
                                        >
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
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">TB-{patient.id.slice(-5).toUpperCase()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.age} / {patient.gender}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(patient.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportGeneration;
