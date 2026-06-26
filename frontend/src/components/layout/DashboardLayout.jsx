// frontend/src/components/layout/DashboardLayout.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// ⚠️ DHYAN DEIN: Apne logo ki image ka naam aur format yahan sahi se check kar lein (.png, .jpg, ya .svg)
import cafeLogo from '../../assets/logo.png'; 

const DashboardLayout = ({ children, role }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Yeh hook batayega ki hum abhi kis page par hain

  const menuItems = role === 'admin' 
    ? [
        { name: 'Dashboard', path: '/admin/dashboard' },
        { name: 'AI Assistant', path: '/admin/ai-assistant' },
        { name: 'stock Tracking', path: '/admin/stock-tracking' },
        { name: 'Create User ID', path: '/admin/create-user' }
      ]
    : [
        { name: 'Home Dashboard', path: '/staff/dashboard' },
        { name: 'Daily Item Sales', path: '/staff/daily-sales' },
        { name: 'Financial Entry', path: '/staff/financial-entry' },
        { name: 'Inventory Log', path: '/staff/inventory-log' },
        { name: 'Complimentary Entry', path: '/staff/complimentary-entry' },
      ];

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans overflow-hidden">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-slate-900 text-white flex flex-col z-30 transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        
        {/* ☕ LOGO SECTION */}
        <div className="p-6 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center gap-3">
            {/* Image tag jo assets se logo uthayega */}
            <img 
              src={cafeLogo} 
              alt="Polo Cafe Logo" 
              className="w-10 h-10 object-cover  bg-white p-0.5" 
            />
            <span className="text-xl font-bold tracking-wider">POLO CAFE</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-300 text-2xl">&times;</button>
        </div>

        {/* 📋 MENU ITEMS WITH ACTIVE STATE */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item, index) => {
            // Check agar current URL item ke path se match karta hai
            const isActive = location.pathname === item.path;

            return (
              <button 
                key={index}
                onClick={() => { navigate(item.path); setIsSidebarOpen(false); }}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  isActive 
                    ? 'bg-amber-600 text-white shadow-md' // Active Menu Styling (Amber Color)
                    : 'text-gray-400 hover:bg-slate-800 hover:text-white' // Normal Menu Styling
                }`}
              >
                {item.name}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Topbar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            {/* 3-Dot / Hamburger Menu for Mobile */}
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden text-2xl text-gray-700 p-1"
            >
              &#8942;
            </button>
            <h2 className="text-xl font-semibold text-gray-800 capitalize hidden sm:block">
              {role} Panel
            </h2>
          </div>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition font-medium text-sm">
            Logout
          </button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;