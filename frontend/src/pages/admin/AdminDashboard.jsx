import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Initial Empty State (API load hone se pehle)
  const [stats, setStats] = useState({
    yesterdaySales: 0,
    highestSaleDateLastWeek: { date: "Loading...", amount: 0 },
    topItemYesterday: { name: "Loading...", qty: 0 },
    topItemLastWeek: { name: "Loading...", qty: 0 },
    topItemThisMonth: { name: "Loading...", qty: 0 },
    topInventoryLastWeek: { name: "Loading...", qty: 0 },
    topInventoryThisMonth: { name: "Loading...", qty: 0 },
    weeklyRevenueChart: [],
    paymentBreakdown: [],
    yesterdayDetailedSales: [],
    yesterdayDetailedInventory: []
  });

  // Colors for Donut Chart (UPI: Blue, Cash: Green, Card: Orange, Credit: Red)
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // 🚀 ACTUAL API CALL TO BACKEND
  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/admin/dashboard-stats`);
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        // Agar backend band hai toh Dummy Data dikhayenge (Testing ke liye)
        setStats({
          yesterdaySales: 14500,
          highestSaleDateLastWeek: { date: "18-May-2026", amount: 18200 },
          topItemYesterday: { name: "Cold Coffee", qty: 45 },
          topItemLastWeek: { name: "Veg Burger", qty: 210 },
          topItemThisMonth: { name: "Polo Toast", qty: 850 },
          topInventoryLastWeek: { name: "Milk (Liters)", qty: 120 },
          topInventoryThisMonth: { name: "Coffee Beans (gm)", qty: 5000 },
          weeklyRevenueChart: [
            { date: 'Mon', Revenue: 12000 }, { date: 'Tue', Revenue: 14500 },
            { date: 'Wed', Revenue: 11000 }, { date: 'Thu', Revenue: 18200 },
            { date: 'Fri', Revenue: 15600 }, { date: 'Sat', Revenue: 21000 },
            { date: 'Sun', Revenue: 24500 },
          ],
          paymentBreakdown: [
            { name: 'PayTM / UPI', value: 35000 },
            { name: 'Cash', value: 15000 },
            { name: 'Card', value: 5000 },
            { name: 'Credit', value: 2000 },
          ],
          yesterdayDetailedSales: [
            { id: 1, name: "Cold Coffee", qty: 45, rev: 5400 },
            { id: 2, name: "Polo Toast", qty: 38, rev: 3040 },
            { id: 3, name: "Veg Burger", qty: 25, rev: 2250 },
          ],
          yesterdayDetailedInventory: [
            { id: 1, name: "Amul Milk", qty: "15 Liters" },
            { id: 2, name: "Coffee Beans", qty: "2 Kg" },
          ]
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (isLoading) {
    return (
      <DashboardLayout role="admin">
        <div className="flex h-full items-center justify-center">
          <p className="text-xl font-bold text-gray-500 animate-pulse">📊 Loading Real-time Data from Database...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin">
      {/* 🚀 Header & AI Button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Overview 📊</h1>
        </div>
        <button 
          onClick={() => navigate('/admin/ai-assistant')} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transform transition hover:-translate-y-1 flex items-center gap-2"
        >
          ✨ Ask AI Assistant
        </button>
      </div>

      {/* 💰 Section 1: Revenue Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 border-l-4 border-l-emerald-500">
          <p className="text-sm font-medium text-gray-500">Yesterday's Total Sales</p>
          <h3 className="text-3xl font-bold text-emerald-600 mt-2">₹{stats.yesterdaySales?.toLocaleString() || 0}</h3>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-medium text-gray-500">Highest Sale Day (Last 7 Days)</p>
          <h3 className="text-3xl font-bold text-blue-600 mt-2">
            ₹{stats.highestSaleDateLastWeek?.amount?.toLocaleString() || 0} 
            <span className="text-base text-gray-400 font-normal ml-2">on {stats.highestSaleDateLastWeek?.date || 'N/A'}</span>
          </h3>
        </div>
      </div>

      {/* 🏆 Section 2: Sales Champions (Top Items) */}
      <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">🏆 Top Performing Items</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl shadow-sm border border-amber-100">
          <div className="bg-amber-100 w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3">⏱️</div>
          <p className="text-sm font-medium text-gray-600">Top Item (Yesterday)</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{stats.topItemYesterday?.name}</h3>
          <p className="text-amber-600 font-bold mt-1">{stats.topItemYesterday?.qty} Sold</p>
        </div>
        
        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-indigo-100">
          <div className="bg-indigo-100 w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3">📅</div>
          <p className="text-sm font-medium text-gray-600">Top Item (Last 7 Days)</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{stats.topItemLastWeek?.name}</h3>
          <p className="text-indigo-600 font-bold mt-1">{stats.topItemLastWeek?.qty} Sold</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-2xl shadow-sm border border-purple-100">
          <div className="bg-purple-100 w-10 h-10 rounded-full flex items-center justify-center text-xl mb-3">📈</div>
          <p className="text-sm font-medium text-gray-600">Top Item (This Month)</p>
          <h3 className="text-xl font-bold text-gray-800 mt-1">{stats.topItemThisMonth?.name}</h3>
          <p className="text-purple-600 font-bold mt-1">{stats.topItemThisMonth?.qty} Sold</p>
        </div>
      </div>

      {/* 📉 Section 3: Charts (Revenue Trend & Payment Method) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Weekly Revenue Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-700 mb-4">📉 Last 7 Days Revenue Trend</h2>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.weeklyRevenueChart}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="Revenue" fill="#1e293b" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Payment Method Donut Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-gray-700">💳 Payment Methods</h2>
            <span className="bg-blue-50 text-blue-600 text-xs font-bold px-2 py-1 rounded">Last 7 Days</span>
          </div>
          <div className="flex-1 min-h-[250px] relative">
            {stats.paymentBreakdown && stats.paymentBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.paymentBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.paymentBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `₹${value}`} />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Data</div>
            )}
            
            {/* Center Text for Donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
              <span className="text-xs text-gray-400">Top Method</span>
              <span className="text-sm font-bold text-blue-600">
                {stats.paymentBreakdown && stats.paymentBreakdown.length > 0 
                  ? stats.paymentBreakdown.reduce((prev, current) => (prev.value > current.value) ? prev : current).name 
                  : '-'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 Section 4: Yesterday's Detailed Registers (Scrollable) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Yesterday's Sales Register */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
          <div className="p-4 border-b border-gray-100 bg-amber-50 rounded-t-2xl">
            <h2 className="text-lg font-bold text-amber-800">📋 Yesterday's Sales Register</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Item Name</th>
                  <th className="p-3 font-semibold text-gray-600 text-center">Qty</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.yesterdayDetailedSales?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-800 font-medium">{item.name}</td>
                    <td className="p-3 text-center text-gray-600">{item.qty}</td>
                    <td className="p-3 text-right text-emerald-600 font-medium">₹{item.rev}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Yesterday's Inventory Register */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-[350px]">
          <div className="p-4 border-b border-gray-100 bg-slate-100 rounded-t-2xl">
            <h2 className="text-lg font-bold text-slate-800">📦 Yesterday's Inventory Restock</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="p-3 font-semibold text-gray-600">Ingredient Name</th>
                  <th className="p-3 font-semibold text-gray-600 text-right">Qty Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.yesterdayDetailedInventory?.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="p-3 text-gray-800 font-medium">{item.name}</td>
                    <td className="p-3 text-right text-blue-600 font-medium">{item.qty}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;