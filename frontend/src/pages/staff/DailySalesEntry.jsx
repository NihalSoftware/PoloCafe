// frontend/src/pages/staff/DailySalesEntry.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast'; // Imported Toaster

// Base URL from .env file
const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const DailySalesEntry = () => {
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for persistent info banner
  const [infoMessage, setInfoMessage] = useState('');
  
  // 💡 New Logic: Save original menu items in a separate state
  const [baseMenuItems, setBaseMenuItems] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ item_name: '', price: '' });
  const [isLoading, setIsLoading] = useState(false);

  // 1. Fetch only BASE items from the Database on component load
  useEffect(() => {
    fetchBaseItems();
  }, []);

  const fetchBaseItems = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items`);
      const data = await response.json();
      setBaseMenuItems(data);
    } catch (error) {
      console.error("Error fetching items:", error);
      toast.error("Failed to fetch menu items.");
    }
  };

  // 2. 💡 WHENEVER DATE CHANGES, fetch that day's data and auto-fill inputs
  useEffect(() => {
    if (baseMenuItems.length > 0) {
      fetchSalesForDate(saleDate);
    }
  }, [saleDate, baseMenuItems]);

  const fetchSalesForDate = async (selectedDate) => {
    setIsLoading(true);
    setInfoMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/daily-sales/${selectedDate}`);
      let previousSales = [];
      
      if (response.ok) {
        previousSales = await response.json(); // Returns array like: [{item_id: 1, quantity_sold: 5}]
      }

      // Merge previous sales with base items
      const mergedItems = baseMenuItems.map(item => {
        const foundSale = previousSales.find(s => s.item_id === item.item_id);
        return { 
          ...item, 
          quantity: foundSale ? foundSale.quantity_sold : "" 
        };
      });

      setItemsList(mergedItems);
      
      if (previousSales.length > 0) {
        setInfoMessage('ℹ️ Data for this date already exists. You can edit and update it.');
      }
    } catch (error) {
      console.error("Error fetching date sales:", error);
      toast.error("Error fetching previous sales data.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Function to Add New Item
  const handleAddNewItem = async (e) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding new item...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/menu-items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item_name: newItem.item_name, price: parseFloat(newItem.price) })
      });
      
      if (response.ok) {
        const data = await response.json();
        // Update base list with new item
        setBaseMenuItems([...baseMenuItems, data.item]);
        setNewItem({ item_name: '', price: '' });
        setShowAddItem(false);
        toast.success(`'${data.item.item_name}' successfully added to menu!`, { id: loadingToast });
      } else {
        toast.error("Failed to add item.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error adding item:", error);
      toast.error("Server connection error.", { id: loadingToast });
    }
  };

  const handleQuantityChange = (id, value) => {
    setItemsList(itemsList.map(item => item.item_id === id ? { ...item, quantity: value } : item));
  };

  // 4. Final Sales Submit (Save or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    const soldItems = itemsList.filter(item => item.quantity && parseInt(item.quantity) > 0)
                               .map(item => ({ itemId: item.item_id, quantity: parseInt(item.quantity) }));

    if (soldItems.length === 0) {
      toast.error("Please enter the quantity for at least one item before saving.");
      return;
    }

    const payload = {
      sale_date: saleDate,
      items: soldItems,
      logged_by: parseInt(localStorage.getItem('id')) || 1
    };
    
    const savingToast = toast.loading('Saving sales data...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/daily-sales`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success('Sales data saved/updated successfully!', { id: savingToast });
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
  const filteredAndSortedItems = itemsList
    .filter(item => item.item_name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => a.item_name.localeCompare(b.item_name));

  return (
    <DashboardLayout role="staff">
      {/* Toaster Component for popup notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-4xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">📝 Daily Item Sales</h2>
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
              <label className="block text-sm font-bold text-gray-700 mb-1">Item Name</label>
              <input type="text" required value={newItem.item_name} onChange={(e) => setNewItem({...newItem, item_name: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500" placeholder="e.g. Masala Dosa" />
            </div>
            <div className="w-full sm:w-32">
              <label className="block text-sm font-bold text-gray-700 mb-1">Price (₹)</label>
              <input type="number" required value={newItem.price} onChange={(e) => setNewItem({...newItem, price: e.target.value})} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-amber-500 focus:border-amber-500" placeholder="100" />
            </div>
            <button type="submit" className="bg-amber-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-amber-700 w-full sm:w-auto transition shadow-sm">Save Item</button>
          </form>
        )}

        {/* --- Daily Sales List Form --- */}
        <form onSubmit={handleSubmit}>
          
          {/* Date & Search Box Container */}
          <div className="mb-6 bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <label className="font-bold text-amber-900 whitespace-nowrap">Select Date:</label>
              <input type="date" value={saleDate} onChange={(e) => setSaleDate(e.target.value)} className="border border-gray-300 rounded-lg p-2.5 w-full sm:w-auto focus:ring-amber-500 font-medium" required />
            </div>
            
            {/* 🔍 Search Box */}
            <div className="w-full sm:w-1/2 lg:w-1/3">
              <input 
                type="text" 
                placeholder="🔍 Search menu items..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="border border-gray-300 rounded-lg p-2.5 w-full focus:ring-amber-500"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-amber-600 font-bold animate-pulse">
              🔄 Loading data for {saleDate}...
            </div>
          ) : (
            <div className="mb-8">
              <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-slate-900 text-white rounded-t-xl font-bold text-sm md:text-base">
                <div className="col-span-8 md:col-span-9">Item Name (A-Z)</div>
                <div className="col-span-4 md:col-span-3 text-center">Qty Sold</div>
              </div>
              
              <div className="border border-t-0 border-gray-200 rounded-b-xl divide-y divide-gray-100">
                {filteredAndSortedItems.length > 0 ? (
                  filteredAndSortedItems.map((item) => (
                    <div key={item.item_id} className={`grid grid-cols-12 gap-4 px-4 py-3 items-center transition ${item.quantity ? 'bg-emerald-50 hover:bg-emerald-100' : 'hover:bg-gray-50'}`}>
                      <div className="col-span-8 md:col-span-9 font-medium text-gray-800">
                        {item.item_name} <span className="text-gray-400 text-sm ml-2 font-normal">₹{item.price}</span>
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
                    Item not found. Please add a new item.
                  </div>
                )}
              </div>
            </div>
          )}

          <button type="submit" className="w-full bg-amber-600 text-white font-bold text-lg py-3.5 rounded-xl hover:bg-amber-700 transition shadow-md">
            Save / Update Sales Data
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default DailySalesEntry;