// frontend/src/pages/admin/CreateUser.jsx
import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';

const API_BASE_URL = import.meta.env?.VITE_API_URL || process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";

const CreateUser = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'staff' // Default role staff rahega
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `✅ Success! New ${formData.role} '${formData.username}' created successfully.` });
        setFormData({ username: '', password: '', role: 'staff' }); // Form clear karein
      } else {
        setMessage({ type: 'error', text: `❌ Error: ${data.detail || 'Username already exists!'}` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: '❌ Server connection failed.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management 👥</h1>
      </div>

      <div className="max-w-xl bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-700 mb-6 border-b pb-4">Create New ID</h2>

        {message.text && (
          <div className={`mb-6 p-4 rounded-lg font-medium ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username (Login ID)</label>
            <input 
              type="text" 
              name="username"
              required 
              value={formData.username}
              onChange={handleChange}
              placeholder="e.g., rohit_staff"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required 
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter secure password"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign Role</label>
            <select 
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
            >
              <option value="staff">Staff (Data Entry Only)</option>
              <option value="admin">Admin (Full Access & AI)</option>
            </select>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full font-bold py-3 rounded-xl text-white transition mt-4 ${isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'}`}
          >
            {isLoading ? 'Creating ID...' : 'Create Account'}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default CreateUser;