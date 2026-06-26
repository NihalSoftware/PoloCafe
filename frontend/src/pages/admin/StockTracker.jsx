import React, { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const StockTracker = () => {
  const today = new Date().toISOString().split('T')[0];
  const lastWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(lastWeek);
  const [endDate, setEndDate] = useState(today);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const [inventoryItems, setInventoryItems] = useState([]);
  const [trackerData, setTrackerData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 1. Fetch Real Inventory Items for Dropdown
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/inventory-items`);
        const data = await response.json();
        setInventoryItems(data);
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      }
    };
    fetchInventory();
  }, []);

  // 🚫 ULTRA-STRICT FILTER: Remove grams, kg, gm, g, liters, l, ml, and bread safely
  const countableItems = inventoryItems.filter(item => {
    if (!item.unit || !item.item_name) return false;
    const unit = item.unit.toLowerCase().trim();
    const name = item.item_name.toLowerCase();
    
    return !unit.includes('kg') && 
           !unit.includes('gram') &&
           !unit.includes('gm') &&
           unit !== 'g' && 
           unit !== 'l' && 
           !unit.includes('liter') &&
           !unit.includes('ml') &&
           !name.includes('bread') &&
           name.includes(searchQuery.toLowerCase());
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 🚀 2. FETCH REAL DATA FROM FASTAPI BACKEND
  useEffect(() => {
    if (!startDate || !endDate) return;

    const fetchTrackerData = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const url = new URL(`${API_BASE_URL}/api/admin/stock-tracker`);
        url.searchParams.append("start_date", startDate);
        url.searchParams.append("end_date", endDate);
        if (selectedItem) {
          url.searchParams.append("item_id", selectedItem.inv_item_id);
        }

        const response = await fetch(url);
        const data = await response.json();
        
        if (response.ok) {
          setTrackerData(data);
        } else {
          setErrorMessage(data.detail || "Failed to fetch tracker data.");
          setTrackerData(null);
        }
      } catch (error) {
        setErrorMessage("Server Connection Error.");
        setTrackerData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrackerData();
  }, [selectedItem, startDate, endDate]);

  const clearSelection = () => {
    setSelectedItem(null);
    setSearchQuery('');
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Smart Stock Tracker 📍</h1>
        <p className="text-gray-500 mt-2">Track the exact flow of items between target dates (Arrived, Sold, and Remaining stock).</p>
      </div>

      {/* 🎛️ CONTROLS SECTION */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4 relative" style={{ zIndex: 50 }}>
        
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">End Date</label>
          <input 
            type="date" 
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>

        <div className="md:col-span-2 relative" ref={dropdownRef}>
          <label className="block text-sm font-bold text-gray-700 mb-1">Select Item (Pcs/Pkts Only)</label>
          <div className="relative">
            <input 
              type="text" 
              placeholder="Leave empty for ALL items, or search..." 
              value={isDropdownOpen ? searchQuery : (selectedItem ? selectedItem.item_name : '')}
              onFocus={() => setIsDropdownOpen(true)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsDropdownOpen(true);
                if (selectedItem) setSelectedItem(null);
              }}
              className="w-full border border-gray-300 rounded-lg p-2.5 pr-10 focus:ring-amber-500 focus:border-amber-500 bg-amber-50 font-medium"
            />
            {selectedItem && (
              <button 
                onClick={clearSelection}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                title="Clear Selection"
              >
                ✖
              </button>
            )}
          </div>
          
          {isDropdownOpen && (
            <div className="absolute w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50">
              <div 
                  onClick={clearSelection}
                  className="p-3 bg-gray-100 hover:bg-gray-200 cursor-pointer font-bold text-gray-700 border-b border-gray-200 text-center"
                >
                  View All Items
              </div>
              {countableItems.length > 0 ? (
                countableItems.map(item => (
                  <div 
                    key={item.inv_item_id} 
                    onClick={() => {
                      setSelectedItem(item);
                      setSearchQuery('');
                      setIsDropdownOpen(false);
                    }}
                    className="p-3 hover:bg-amber-100 cursor-pointer flex justify-between items-center border-b border-gray-50 transition"
                  >
                    <span className="font-bold text-gray-800">{item.item_name}</span>
                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{item.unit}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-red-500 font-medium">Other un-countable items are filtered out.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {isLoading && <p className="text-center text-indigo-600 font-bold animate-pulse text-lg my-10">🔄 Fetching real-time records from database...</p>}
      {errorMessage && <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-bold mb-8">{errorMessage}</div>}

      {/* 📊 RESULTS SECTION */}
      {!isLoading && !errorMessage && trackerData && (
        <div className="animate-fade-in-up">
          
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-blue-50 p-5 rounded-2xl border-l-4 border-l-blue-500 shadow-sm">
              <p className="text-blue-800 text-sm font-bold uppercase tracking-wider">📦 Total Arrived</p>
              <h3 className="text-3xl font-black text-blue-900 mt-1">{trackerData.summary.totalArrived} <span className="text-sm font-normal text-blue-700">{trackerData.unit}</span></h3>
              <p className="text-xs text-blue-600 mt-1">In selected date range</p>
            </div>
            <div className="bg-emerald-50 p-5 rounded-2xl border-l-4 border-l-emerald-500 shadow-sm">
              <p className="text-emerald-800 text-sm font-bold uppercase tracking-wider">🛍️ Total Sold</p>
              <h3 className="text-3xl font-black text-emerald-900 mt-1">{trackerData.summary.totalSold} <span className="text-sm font-normal text-emerald-700">{trackerData.unit}</span></h3>
              <p className="text-xs text-emerald-600 mt-1">In selected date range</p>
            </div>
            <div className={`p-5 rounded-2xl border-l-4 shadow-sm ${trackerData.summary.balance < 0 ? 'bg-red-50 border-l-red-500' : 'bg-amber-50 border-l-amber-500'}`}>
              <p className={`${trackerData.summary.balance < 0 ? 'text-red-800' : 'text-amber-800'} text-sm font-bold uppercase tracking-wider`}>⚖️ Current Balance</p>
              <h3 className={`text-3xl font-black mt-1 ${trackerData.summary.balance < 0 ? 'text-red-600' : 'text-amber-900'}`}>
                {trackerData.summary.balance} <span className="text-sm font-normal opacity-80">{trackerData.unit}</span>
              </h3>
              <p className={`text-xs mt-1 ${trackerData.summary.balance < 0 ? 'text-red-600' : 'text-amber-700'}`}>Unsold / Wastage</p>
            </div>
            <div className="bg-slate-900 p-5 rounded-2xl shadow-sm">
              <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-3xl font-black text-white mt-1">₹{trackerData.summary.totalRevenue}</h3>
              <p className="text-xs text-slate-500 mt-1">From selected items</p>
            </div>
          </div>

          {/* 🛤️ THE TRACKER TIMELINE */}
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-8 border-b pb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Tracker Report: <span className="text-indigo-600">{trackerData.reportName}</span>
                </h2>
                <p className="text-sm text-gray-500 mt-1">From {startDate} to {endDate}</p>
              </div>
            </div>
            
            {trackerData.timeline.length > 0 ? (
              <div className="relative border-l-4 border-gray-100 ml-4 md:ml-8 space-y-8 pb-4">
                {trackerData.timeline.map((event, idx) => (
                  <div key={idx} className="relative pl-8 md:pl-10 hover:transform hover:translate-x-1 transition-transform">
                    
                    <div className={`absolute -left-[14px] top-1 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center
                      ${event.type === 'restock' ? 'bg-blue-500' : 'bg-emerald-500'}
                    `}></div>
                    
                    <div className={`p-5 rounded-xl border ${event.type === 'restock' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">{event.date}</span>
                        <span className={`font-black text-xl ${event.type === 'restock' ? 'text-blue-600' : 'text-emerald-600'}`}>
                          {event.type === 'restock' ? '+' : '-'}{event.qty} <span className="text-sm font-medium">{event.unit}</span>
                        </span>
                      </div>
                      
                      <h3 className={`text-lg font-bold ${event.type === 'restock' ? 'text-blue-900' : 'text-gray-800'}`}>
                        {event.title}
                      </h3>

                      {event.type === 'sale' && (
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                          <div className="bg-white px-3 py-1 rounded border border-gray-200 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">PayTM:</span>
                            <span className="text-sm font-black text-gray-800">{event.payments.paytm}</span>
                          </div>
                          <div className="bg-white px-3 py-1 rounded border border-gray-200 shadow-sm flex items-center gap-2">
                            <span className="text-xs font-bold text-gray-500">Cash:</span>
                            <span className="text-sm font-black text-gray-800">{event.payments.cash}</span>
                          </div>
                          <div className="ml-auto text-sm font-bold text-gray-600 bg-emerald-50 px-2 py-1 rounded">
                            Revenue: ₹{event.revenue}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                <span className="text-3xl">📭</span>
                <p className="text-gray-500 font-bold mt-2">No activity found in the selected date range.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default StockTracker;