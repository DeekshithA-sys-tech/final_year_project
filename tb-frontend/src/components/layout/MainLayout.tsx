import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
    LayoutDashboard,
    Users,
    UserPlus,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    Activity,
    ScanSearch
} from 'lucide-react';
import { logout } from '../../store/authSlice';
import { RootState } from '../../store';

const MainLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'Add New Patient', path: '/patients/add', icon: <UserPlus size={20} /> },
        { name: 'All Patients', path: '/patients', icon: <Users size={20} /> },
        { name: 'Reports', path: '/reports', icon: <FileText size={20} /> },
    ];

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-20 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:inset-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="flex items-center justify-center h-16 border-b border-gray-200 bg-primary-600 text-white shadow-sm">
                    <Activity className="mr-2" size={24} />
                    <span className="text-lg font-bold">TB Detect Pro</span>
                </div>

                <div className="p-4 flex flex-col h-[calc(100vh-4rem)]">
                    <nav className="flex-1 space-y-1">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.name}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-50 text-primary-700'
                                        : 'text-gray-700 hover:bg-gray-100'
                                    }`
                                }
                                onClick={() => setSidebarOpen(false)}
                            >
                                <div className="mr-3">{item.icon}</div>
                                {item.name}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="pt-4 border-t border-gray-200">
                        <div className="px-4 py-3 mb-2 rounded-lg bg-gray-50">
                            <p className="text-sm font-medium text-gray-900 truncate">{user?.fullName}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                            <LogOut size={20} className="mr-3" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex flex-col flex-1 w-0 cursor-default">
                {/* Header */}
                <header className="flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 lg:px-8 shadow-sm z-10 w-full">
                    <button
                        className="p-1 mr-4 text-gray-500 rounded-lg lg:hidden hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center">
                        <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 relative overflow-y-auto focus:outline-none bg-gray-50/50">
                    <div className="py-6 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-full">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MainLayout;
