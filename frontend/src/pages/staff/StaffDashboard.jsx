import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

const StaffDashboard = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({
    sales_filled: false,
    financial_filled: false,
    inventory_filled: false
  });

  useEffect(() => {
    // Aaj ki date nikalna (YYYY-MM-DD)
    const today = new Date().toISOString().split('T')[0];
    
    // Backend API se check karna ki aaj ki entry hui hai ya nahi
    const fetchStatus = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/staff/status/${today}`);
        const data = await response.json();
        if (response.ok) {
          setStatus(data);
        }
      } catch (error) {
        console.error("Status fetch karne me error:", error);
      }
    };
    fetchStatus();
  }, []);

  const getStatusUI = (isFilled) => {
    if (isFilled) return <span className="text-sm font-bold text-green-600 bg-green-100 px-2 py-1 rounded">🔒 Filled Today</span>;
    return <span className="text-sm font-bold text-amber-600 bg-amber-100 px-2 py-1 rounded">🔓 Not Filled</span>;
  };

  return (
    <DashboardLayout role="staff">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Welcome, {localStorage.getItem('username')}! 👋</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Sales Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">📝 Daily Sales</h3>
            {getStatusUI(status.sales_filled)}
          </div>
          <button 
            onClick={() => navigate('/staff/daily-sales')}
            className={`w-full py-2 rounded-lg font-medium transition ${status.sales_filled ? 'bg-gray-100 text-gray-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {status.sales_filled ? 'Entry Done' : 'Start Entry'}
          </button>
        </div>

        {/* Financial Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">💰 Financials</h3>
            {getStatusUI(status.financial_filled)}
          </div>
          <button 
            onClick={() => navigate('/staff/financial-entry')}
            className={`w-full py-2 rounded-lg font-medium transition ${status.financial_filled ? 'bg-gray-100 text-gray-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {status.financial_filled ? 'Entry Done' : 'Start Entry'}
          </button>
        </div>

        {/* Inventory Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-800">📦 Inventory</h3>
            {getStatusUI(status.inventory_filled)}
          </div>
          <button 
            onClick={() => navigate('/staff/inventory-log')}
            className={`w-full py-2 rounded-lg font-medium transition ${status.inventory_filled ? 'bg-gray-100 text-gray-500' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
          >
            {status.inventory_filled ? 'Entry Done' : 'Log Items'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StaffDashboard;