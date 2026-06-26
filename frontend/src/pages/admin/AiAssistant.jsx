// frontend/src/pages/admin/AiAssistant.jsx
import React, { useState, useRef, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import * as XLSX from 'xlsx';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const AiAssistant = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', type: 'text', content: 'Hello Admin! I am the Polo Cafe AI Assistant. What data or report would you like to analyze today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [expandedTables, setExpandedTables] = useState({});
  const chatEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // View More / View Less Toggle
  const toggleTableExpand = (index) => {
    setExpandedTables(prev => ({ ...prev, [index]: !prev[index] }));
  };

  // 🔥 MAGIC FUNCTION: Data ko Register (Photo) jaisa format karne ke liye
  const processTableData = (data) => {
    if (!data || data.length === 0) return { columns: [], rows: [] };
    const keys = Object.keys(data[0]);

    // Check agar data mein 'date' aur 'item/name' dono hain
    const dateKey = keys.find(k => k.toLowerCase().includes('date') || k.toLowerCase() === 'day');
    const itemKey = keys.find(k => k.toLowerCase().includes('item') || k.toLowerCase().includes('name') || k.toLowerCase().includes('ingredient'));

    // Agar dono mil gaye, toh data ko Pivot (Cross-tab) format me badal do
    if (dateKey && itemKey && keys.length >= 3) {
      const valKey = keys.find(k => k !== dateKey && k !== itemKey); // Bachi hui value
      
      const uniqueDates = [...new Set(data.map(d => String(d[dateKey])))].sort();
      const groupedData = {};

      data.forEach(row => {
        const item = String(row[itemKey]);
        const date = String(row[dateKey]);
        const val = row[valKey];
        if (!groupedData[item]) groupedData[item] = {};
        groupedData[item][date] = val;
      });

      const pivotRows = Object.keys(groupedData).map(item => {
        const rowObj = { "Item Name": item };
        uniqueDates.forEach(date => {
          rowObj[date] = groupedData[item][date] || '-'; // Agar us din nahi bika to '-'
        });
        return rowObj;
      });

      return { columns: ["Item Name", ...uniqueDates], rows: pivotRows };
    }

    return { columns: keys, rows: data };
  };

  // 🚀 1. EXCEL DOWNLOAD (Screen jaisi exact formatting)
  const downloadFormattedExcel = (rows, filename = 'PoloCafe_Report.xlsx') => {
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, filename);
  };

  // 🚀 2. WORD DOWNLOAD (Proper Table format me)
  const downloadWord = (columns, rows, filename = 'PoloCafe_Report.doc') => {
    let html = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="utf-8"><title>Polo Cafe Report</title>';
    html += '<style>table { width: 100%; border-collapse: collapse; } th, td { border: 1px solid #000; padding: 8px; text-align: center; } th { background-color: #f2f2f2; }</style>';
    html += '</head><body><h2>Polo Cafe - Report</h2><table><thead><tr>';
    columns.forEach(col => { html += `<th>${col.replace(/_/g, ' ')}</th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += '<tr>';
      columns.forEach(col => { html += `<td>${row[col]}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';

    const blob = new Blob(['\ufeff', html], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🚀 3. PDF DOWNLOAD (Print layout se clean PDF)
  const downloadPDF = (columns, rows) => {
    const printWindow = window.open('', '', 'height=800,width=1000');
    let html = '<html><head><title>Polo Cafe Report</title>';
    html += '<style>body { font-family: Arial, sans-serif; padding: 20px; } table { width: 100%; border-collapse: collapse; margin-top: 20px; } th, td { border: 1px solid #ddd; padding: 10px; text-align: center; font-size: 14px; } th { background-color: #f8fafc; color: #333; text-transform: capitalize; } h2 { color: #1e293b; text-align: center; border-bottom: 2px solid #f59e0b; padding-bottom: 10px; }</style>';
    html += '</head><body><h2>Polo Cafe - AI Analytics Report</h2><table><thead><tr>';
    columns.forEach(col => { html += `<th>${col.replace(/_/g, ' ')}</th>`; });
    html += '</tr></thead><tbody>';
    rows.forEach(row => {
      html += '<tr>';
      columns.forEach(col => { html += `<td>${row[col]}</td>`; });
      html += '</tr>';
    });
    html += '</tbody></table></body></html>';
    
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userMsg = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', type: 'text', content: userMsg }]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg })
      });
      
      const result = await response.json();
      setMessages(prev => [...prev, { sender: 'bot', ...result }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: 'bot', type: 'text', content: 'Failed to connect to the server. Please check your backend.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800"> AI Analytics 📈</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[75vh]">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-100 bg-slate-900 text-white rounded-t-xl flex justify-between items-center">
          <h3 className="font-bold flex items-center gap-2">🤖 Polo AI Assistant</h3>
          <span className="text-xs bg-green-500 px-2 py-1 rounded text-white font-medium flex items-center gap-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span> Online
          </span>
        </div>

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50 flex flex-col gap-4">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-full md:max-w-[85%] rounded-lg p-4 shadow-sm ${msg.sender === 'user' ? 'bg-amber-600 text-white rounded-tr-none' : 'bg-white border border-gray-200 text-gray-800 rounded-tl-none'}`}>
                
                {msg.content && <p className="text-sm mb-2">{msg.content}</p>}

                {/* --- SMART TABLE RENDERER --- */}
                {msg.type === 'table' && msg.data && (() => {
                  const { columns, rows } = processTableData(msg.data);
                  const isExpanded = expandedTables[index];
                  const displayRows = isExpanded ? rows : rows.slice(0, 5); 
                  const hasMore = rows.length > 5;

                  return (
                    <div className="mt-4 border-t border-gray-100 pt-4 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-3">
                        <span className="text-xs font-semibold text-gray-500">Database Output:</span>
                        
                        {/* 🚀 DOWNLOAD BUTTONS GROUP */}
                        <div className="flex gap-2 flex-wrap">
                          <button 
                            onClick={() => downloadFormattedExcel(rows)}
                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1"
                          >
                            📊 Excel
                          </button>
                          <button 
                            onClick={() => downloadWord(columns, rows)}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1"
                          >
                            📝 Word
                          </button>
                          <button 
                            onClick={() => downloadPDF(columns, rows)}
                            className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-1.5 rounded text-xs font-bold transition flex items-center gap-1"
                          >
                            📄 PDF
                          </button>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="min-w-full text-xs text-left border-collapse whitespace-nowrap">
                          <thead className="bg-slate-100 text-slate-700">
                            <tr>
                              {columns.map((key, i) => (
                                <th key={i} className={`p-3 border-b border-gray-200 font-bold capitalize ${i !== 0 ? 'text-center' : ''}`}>
                                  {key.replace(/_/g, ' ')}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {displayRows.map((row, i) => (
                              <tr key={i} className="border-b border-gray-100 hover:bg-amber-50 transition">
                                {columns.map((col, j) => (
                                  <td key={j} className={`p-3 ${j !== 0 ? 'text-center font-medium text-gray-600' : 'text-gray-800'}`}>
                                    {row[col]}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* View More / View Less */}
                      {hasMore && (
                        <div className="mt-3 text-center">
                          <button 
                            onClick={() => toggleTableExpand(index)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-xs font-bold transition"
                          >
                            {isExpanded ? '⬆️ View Less' : `⬇️ View ${rows.length - 5} More Rows Inline`}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}

              </div>
            </div>
          ))}

          {/* THINKING ANIMATION */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 text-gray-800 rounded-lg rounded-tl-none p-4 shadow-sm max-w-[85%] flex items-center gap-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
                <p className="text-sm text-gray-500 italic">Processing request and fetching data...</p>
              </div>
            </div>
          )}
          
          <div ref={chatEndRef} />
        </div>

        {/* Chat Input Area */}
        <div className="p-4 border-t border-gray-100 bg-white rounded-b-xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input 
              type="text" 
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="e.g., 'Last 7 days sale register dikhao' or 'What is our top item?'" 
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100" 
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading}
              className={`px-6 py-2 rounded-lg font-medium text-white transition ${isLoading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'}`}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AiAssistant;