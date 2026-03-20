import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Briefcase, Users } from 'lucide-react';

const HRSidebar = () => {
  const navItems = [
    { path: '/hr/dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/hr/create-job', name: 'Post a Job', icon: <PlusCircle className="w-5 h-5" /> },
    { path: '/hr/manage-jobs', name: 'Manage Jobs', icon: <Briefcase className="w-5 h-5" /> },
  ];

  return (
    <div className="w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-[calc(100vh-8rem)] sticky top-24">
      <div className="mb-8 px-4">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">HR Portal</h2>
      </div>
      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default HRSidebar;
