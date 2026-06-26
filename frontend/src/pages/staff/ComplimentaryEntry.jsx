// frontend/src/pages/staff/ComplimentaryEntry.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const ComplimentaryEntry = () => {
  const today = new Date().toISOString().split('T')[0];
  const [compDate, setCompDate] = useState(today);
  const [infoMessage, setInfoMessage] = useState('');
  
  const [baseMenuItems, setBaseMenuItems] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch menu items on component load
  useEffect(() => {
    fetchBaseItems();
  }, []);

  const fetchBaseItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items`);
      const data = await response.json();
      setBaseMenuItems(data);
    } catch (error) {
      console.error("Error fetching menu items:", error);
      toast.error("Failed to fetch menu items.");
    }
  };

  // 2. Fetch existing complimentary records when date changes
  useEffect(() => {
    if (baseMenuItems.length > 0) {
      fetchComplimentaryForDate(compDate);
    }
  }, [compDate, baseMenuItems]);

  const fetchComplimentaryForDate = async (selectedDate) => {
    setIsLoading(true);
    setInfoMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/complimentary/${selectedDate}`);
      let previousCompSales = [];
      
      if (response.ok) {
        previousCompSales = await response.json(); // Array format: [{item_id: 1, quantity_complimentary: 3}]
      }

      // Merge base menu items with loaded complimentary sales data
      const mergedItems = baseMenuItems.map(item => {
        const foundSale = previousCompSales.find(c => c.item_id === item.item_id);
        return { 
          ...item, 
          quantity: foundSale ? foundSale.quantity_complimentary : "" 
        };
      });

      setItemsList(mergedItems);
      
      if (previousCompSales.length > 0) {
        setInfoMessage('ℹ️ Complimentary log for this date already exists. You can edit and update it.');
      }
    } catch (error) {
      console.error("Error fetching complimentary data:", error);
      toast.error("Error fetching previous complimentary data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuantityChange = (id, value) => {
    setItemsList(itemsList.map(item => item.item_id === id ? { ...item, quantity: value } : item));
  };

  // 3. Save or Update Complimentary Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const complimentaryItems = itemsList.filter(item => item.quantity && parseInt(item.quantity) > 0)
                                        .map(item => ({ itemId: item.item_id, quantity: parseInt(item.quantity) }));

    if (complimentaryItems.length === 0) {
      toast.error("Please enter quantity for at least one item before saving.");
      return;
    }

    const payload = {
      comp_date: compDate,
      items: complimentaryItems,
      logged_by: parseInt(localStorage.getItem('id')) || 1
    };
    
    const savingToast = toast.loading('Saving complimentary entries...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/complimentary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Complimentary logs saved/updated successfully!', { id: savingToast });
        setSearchQuery('');
        setInfoMessage('ℹ️ Complimentary log for this date already exists. You can edit and update it.');
      } else {
        toast.error('Server error processing request.', { id: savingToast });
      }
    } catch (error) {
      toast.error('Server connection error.', { id: savingToast });
    }
  };

  // Search and Sort (A to Z)
  const filteredAndSortedItems = itemsList
    .filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.item_name.localeCompare(b.item_name));

  return (
    <DashboardLayout role="staff">
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">🎁 Complimentary / Home Consumption Log</h2>
        </div>
        
        {infoMessage && (
          <div className="mb-6 p-3 rounded-lg font-medium border bg-blue-50 text-blue-700 border-blue-200">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Date & Search Bar Box */}
          <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <label className="font-bold text-amber-900 whitespace-nowrap">Select Date:</label>
              <input 
                type="date" 
                value={compDate} 
                onChange={(e) => setCompDate(e.target.value)} 
                className="border border-gray-300 rounded-lg p-2.5 w-full sm:w-auto focus:ring-amber-500 font-medium bg-white" 
                required 
              />
            </div>
            
            <div className="w-full sm:w-1/2 lg:w-1/3">
              <input 
                type="text" 
                placeholder="🔍 Search items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-amber-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-amber-600 font-bold animate-pulse">
              🔄 Loading records for {compDate}...
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900 text-white rounded-t-xl font-bold text-sm md:text-base">
                <div className="col-span-8 md:col-span-9">Item Name (A-Z)</div>
                <div className="col-span-4 md:col-span-3 text-center">Qty Given</div>
              </div>
              
              <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
                {filteredAndSortedItems.length > 0 ? (
                  filteredAndSortedItems.map((item) => (
                    <div key={item.item_id} className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition ${item.quantity ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'}`}>
                      <div className="col-span-8 md:col-span-9 font-medium text-gray-800">
                        {item.item_name}
                      </div>
                      <div className="col-span-4 md:col-span-3">
                        <input 
                          type="number" 
                          min="0" 
                          value={item.quantity} 
                          onChange={(e) => handleQuantityChange(item.item_id, e.target.value)} 
                          placeholder="0" 
                          className={`w-full border rounded-lg p-2 text-center focus:ring-2 focus:outline-none ${item.quantity ? 'border-emerald-300 focus:ring-emerald-500 font-bold text-emerald-700 bg-white' : 'border-gray-300 focus:ring-amber-500'}`} 
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500 font-medium">
                    No menu items found.
                  </div>
                )}
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-amber-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-amber-700 transition shadow-md"
          >
            Save / Update Complimentary Data
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default ComplimentaryEntry;