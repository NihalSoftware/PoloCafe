// frontend/src/pages/staff/FinancialEntry.jsx
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import toast, { Toaster } from 'react-hot-toast';

// Base URL from .env file
const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const FinancialEntry = () => {
  const [finDate, setFinDate] = useState(new Date().toISOString().split('T')[0]);
  
  // State for persistent info banner
  const [infoMessage, setInfoMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [financials, setFinancials] = useState({
    cash_amount: "",
    credit_amount: "",
    paytm_amount: "",
    card_amount: ""
  });

  // 💡 WHENEVER DATE CHANGES, fetch that day's financial data to auto-fill
  useEffect(() => {
    fetchFinancialsForDate(finDate);
  }, [finDate]);

  const fetchFinancialsForDate = async (selectedDate) => {
    setIsLoading(true);
    setInfoMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/financial-entry/${selectedDate}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data) {
          // Data exists for this date, populate the inputs
          setFinancials({
            cash_amount: data.cash_amount || "",
            credit_amount: data.credit_amount || "",
            paytm_amount: data.paytm_amount || "",
            card_amount: data.card_amount || ""
          });
          setInfoMessage('ℹ️ Data for this date already exists. You can edit and update it.');
        } else {
          // No data found, reset inputs
          setFinancials({ cash_amount: "", credit_amount: "", paytm_amount: "", card_amount: "" });
        }
      } else {
        setFinancials({ cash_amount: "", credit_amount: "", paytm_amount: "", card_amount: "" });
      }
    } catch (error) {
      console.error("Error fetching financial data:", error);
      toast.error("Error fetching previous financial data.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFinancials({ ...financials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cash = parseFloat(financials.cash_amount) || 0;
    const credit = parseFloat(financials.credit_amount) || 0;
    const paytm = parseFloat(financials.paytm_amount) || 0;
    const card = parseFloat(financials.card_amount) || 0;
    const total = cash + credit + paytm + card;

    const payload = {
      fin_date: finDate,
      cash_amount: cash,
      credit_amount: credit,
      paytm_amount: paytm,
      card_amount: card,
      total_revenue: total,
      logged_by: parseInt(localStorage.getItem('id')) || 1
    };
    
    const savingToast = toast.loading('Saving financial log...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/staff/financial-entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (response.ok) {
        toast.success(`Success! Total Revenue: ₹${total}`, { id: savingToast });
        setInfoMessage('ℹ️ Data for this date already exists. You can edit and update it.');
      } else {
        toast.error('Server error processing request.', { id: savingToast });
      }
    } catch (error) {
      toast.error('Server connection error.', { id: savingToast });
    }
  };

  return (
    <DashboardLayout role="staff">
      {/* Toaster Component for popup notifications */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-2xl mx-auto bg-white p-4 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 border-b pb-4">💰 Financial Entry</h2>
        
        {/* Persistent Info Banner */}
        {infoMessage && (
          <div className="mb-6 p-3 rounded-lg font-medium border bg-blue-50 text-blue-700 border-blue-200">
            {infoMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="font-bold text-amber-900 whitespace-nowrap">Select Date:</label>
            <input 
              type="date" 
              value={finDate} 
              onChange={(e) => setFinDate(e.target.value)} 
              className="border border-gray-300 rounded-lg p-2.5 w-full sm:w-auto focus:ring-amber-500 font-medium bg-white" 
              required 
            />
          </div>

          {isLoading ? (
            <div className="text-center py-10 text-amber-600 font-bold animate-pulse">
              🔄 Loading data for {finDate}...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Cash Amount (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="cash_amount" 
                  value={financials.cash_amount} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Credit (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="credit_amount" 
                  value={financials.credit_amount} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">PayTM / UPI (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="paytm_amount" 
                  value={financials.paytm_amount} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500" 
                  placeholder="0.00" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Card / POS (₹)</label>
                <input 
                  type="number" 
                  step="0.01"
                  min="0"
                  name="card_amount" 
                  value={financials.card_amount} 
                  onChange={handleChange} 
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500" 
                  placeholder="0.00" 
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full text-white font-bold text-lg py-3.5 rounded-xl transition shadow-md ${isLoading ? 'bg-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800'}`}
          >
            Save / Update Financial Log
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default FinancialEntry;