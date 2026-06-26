// frontend/src/pages/staff/InventoryLog.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast'; 

// Base URL from .env file
const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const InventoryLog = () => {
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for persistent info banner
  const [infoMessage, setInfoMessage] = useState('');
  
  // 💡 New Logic: Save original inventory items in a separate state
  const [baseInventoryItems, setBaseInventoryItems] = useState([]);
  const [invList, setInvList] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', unit: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch only BASE items from the Database on component load
  useEffect(() => {
    fetchBaseItems();
  }, []);

  const fetchBaseItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory-items`);
      const data = await response.json();
      setBaseInventoryItems(data);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast.error("Failed to fetch inventory items.");
    }
  };

  // 2. 💡 WHENEVER DATE CHANGES, fetch that day's data and auto-fill inputs
  useEffect(() => {
    if (baseInventoryItems.length > 0) {
      fetchInventoryForDate(logDate);
    }
  }, [logDate, baseInventoryItems]);

  const fetchInventoryForDate = async (selectedDate) => {
    setIsLoading(true);
    setInfoMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/inventory-log/${selectedDate}`);
      let previousLogs = [];
      
      if (response.ok) {
        previousLogs = await response.json(); // Returns array like: [{inv_item_id: 1, quantity_logged: 15}]
      }

      // Merge previous logs with base items
      const mergedItems = baseInventoryItems.map(item => {
        const foundLog = previousLogs.find(l => l.inv_item_id === item.inv_item_id);
        return { 
          ...item, 
          quantity: foundLog ? foundLog.quantity_logged : "" 
        };
      });

      setInvList(mergedItems);
      
      if (previousLogs.length > 0) {
        setInfoMessage('ℹ️ Data for this date already exists. You can edit and update it.');
      }
    } catch (error) {
      console.error("Error fetching date inventory:", error);
      toast.error("Error fetching previous inventory data.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Function to Add New Item
  const handleAddNewItem = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding new item...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/inventory-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: newItem.item_name, unit: newItem.unit })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update base list with new item
        setBaseInventoryItems([...baseInventoryItems, data.item]);
        setNewItem({ item_name: '', unit: '' });
        setShowAddItem(false);
        toast.success(`'${data.item.item_name}' successfully added!`, { id: loadingToast });
      } else {
        toast.error("Failed to add item.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Server connection error.", { id: loadingToast });
    }
  };

  const handleQuantityChange = (id, value) => {
    setInvList(invList.map(item => item.inv_item_id === id ? { ...item, quantity: value } : item));
  };

  // 4. Final Inventory Submit (Save or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const loggedItems = invList.filter(item => item.quantity && parseFloat(item.quantity) > 0)
                               .map(item => ({ inv_item_id: item.inv_item_id, quantity_logged: parseFloat(item.quantity) }));

    if (loggedItems.length === 0) {
      toast.error("Please enter the quantity for at least one item before saving.");
      return;
    }

    const payload = {
      log_date: logDate,
      items: loggedItems,
      logged_by: parseInt(localStorage.getItem('id')) || 1
    };
    
    const savingToast = toast.loading('Saving inventory log...');
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/inventory-log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Inventory log saved/updated successfully!', { id: savingToast });
        setSearchQuery(''); // Clear search box
        setInfoMessage('ℹ️ Data for this date already exists. You can edit and update it.'); // Update banner status
      } else {
        toast.error('Server error processing request.', { id: savingToast });
      }
    } catch (error) {
      toast.error('Server connection error.', { id: savingToast });
    }
  };

  // MAGIC HAPPENS HERE: Filtering & Sorting (A to Z)
  const filteredAndSortedItems = invList
    .filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.item_name.localeCompare(b.item_name));

  return (
    <DashboardLayout role="staff">
      {/* Toaster Component for popup notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">📦 Daily Inventory Log</h2>
          <button onClick={() => setShowAddItem(!showAddItem)} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
            {showAddItem ? 'Close Form' : '+ Add New Item'}
          </button>
        </div>

        {/* Persistent Info Banner */}
        {infoMessage && (
          <div className="mb-6 p-3 rounded-lg font-medium border bg-blue-50 text-blue-700 border-blue-200">
            {infoMessage}
          </div>
        )}

        {/* --- Add New Item Form --- */}
        {showAddItem && (
          <form onSubmit={handleAddNewItem} className="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row gap-4 items-end animate-fade-in-up">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Ingredient Name</label>
              <input type="text" required value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500" placeholder="e.g. Sugar" />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-bold text-gray-700 mb-1">Unit</label>
              <input type="text" required value={newItem.unit} onChange={(e) => setNewItem({...newItem, unit: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500" placeholder="Kg, Liters, etc." />
            </div>
            <button type="submit" className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-amber-700 w-full sm:w-auto transition shadow-sm">Save Item</button>
          </form>
        )}

        {/* --- Inventory Log List Form --- */}
        <form onSubmit={handleSubmit}>
          
          {/* Date & Search Box Container */}
          <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <label className="font-bold text-amber-900 whitespace-nowrap">Select Date:</label>
              <input type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 w-full sm:w-auto focus:ring-amber-500 font-medium" required />
            </div>
            
            {/* 🔍 Search Box */}
            <div className="w-full sm:w-1/2 lg:w-1/3">
              <input 
                type="text" 
                placeholder="🔍 Search ingredients..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-amber-600 font-bold animate-pulse">
              🔄 Loading data for {logDate}...
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900 text-white rounded-t-xl font-bold text-sm md:text-base">
                <div className="col-span-7 md:col-span-8">Ingredient Name (A-Z)</div>
                <div className="col-span-5 md:col-span-4 text-center">Qty Logged</div>
              </div>
              
              <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
                {filteredAndSortedItems.length > 0 ? (
                  filteredAndSortedItems.map((item) => (
                    <div key={item.inv_item_id} className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition ${item.quantity ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'}`}>
                      <div className="col-span-7 md:col-span-8 font-medium text-gray-800">
                        {item.item_name} <span className="text-xs text-gray-400">({item.unit})</span>
                      </div>
                      <div className="col-span-5 md:col-span-4">
                        <input 
                          type="number" 
                          step="0.01" 
                          min="0" 
                          value={item.quantity} 
                          onChange={(e) => handleQuantityChange(item.inv_item_id, e.target.value)} 
                          placeholder={`0`} 
                          className={`w-full border rounded-lg p-2 text-center focus:ring-2 focus:outline-none ${item.quantity ? 'border-emerald-300 focus:ring-emerald-500 font-bold text-emerald-700 bg-white' : 'border-gray-300 focus:ring-amber-500 focus:border-amber-500'}`} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 font-medium">
                    Item not found. Please add a new item.
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-amber-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-amber-700 transition shadow-md">
            Save / Update Inventory Log
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default InventoryLog;