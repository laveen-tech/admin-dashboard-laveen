import React, { useState } from 'react';
import apiService from '../services/api.service';

const TITLE_MAX = 100;
const MESSAGE_MAX = 500; // ~100 words

const NotificationsPage = ({ token }) => {
  const [notification, setNotification] = useState({
    title: '',
    message: '',
    recipient_type: 'all_users',
    recipient_id: ''
  });
  const [sending, setSending] = useState(false);

  const handleChange = (field, value) => {
    if (field === 'title' && value.length > TITLE_MAX) return;
    if (field === 'message' && value.length > MESSAGE_MAX) return;
    setNotification(prev => ({ ...prev, [field]: value }));
  };

  const handleSend = async () => {
    if (!notification.title.trim()) return alert('Please enter a title.');
    if (!notification.message.trim()) return alert('Please enter a message.');
    try {
      setSending(true);
      await apiService.post('/admin/send-notification', notification);
      alert('Notification sent successfully!');
      setNotification({ title: '', message: '', recipient_type: 'all_users', recipient_id: '' });
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  const titlePct = (notification.title.length / TITLE_MAX) * 100;
  const msgPct   = (notification.message.length / MESSAGE_MAX) * 100;
  const titleColor = titlePct > 90 ? 'text-red-500' : 'text-gray-500';
  const msgColor   = msgPct   > 90 ? 'text-red-500' : 'text-gray-500';

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Send Notifications</h1>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        <div className="space-y-5">

          {/* Title */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Title</label>
              <span className={`text-xs ${titleColor}`}>
                {notification.title.length} / {TITLE_MAX}
              </span>
            </div>
            <input
              type="text"
              value={notification.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Notification title..."
            />
            <div className="mt-1 h-1 rounded bg-gray-200">
              <div
                className={`h-1 rounded transition-all ${titlePct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(titlePct, 100)}%` }}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-sm font-medium text-gray-700">Message</label>
              <span className={`text-xs ${msgColor}`}>
                {notification.message.length} / {MESSAGE_MAX} (~100 words)
              </span>
            </div>
            <textarea
              value={notification.message}
              onChange={(e) => handleChange('message', e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="4"
              placeholder="Notification message..."
            />
            <div className="mt-1 h-1 rounded bg-gray-200">
              <div
                className={`h-1 rounded transition-all ${msgPct > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min(msgPct, 100)}%` }}
              />
            </div>
          </div>

          {/* Recipients */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
            <select
              value={notification.recipient_type}
              onChange={(e) => setNotification({ ...notification, recipient_type: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all_users">All Users</option>
              <option value="all_vendors">All Vendors</option>
              <option value="specific_user">Specific User</option>
              <option value="specific_vendor">Specific Vendor</option>
            </select>
          </div>

          {(notification.recipient_type === 'specific_user' || notification.recipient_type === 'specific_vendor') && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Recipient ID</label>
              <input
                type="number"
                value={notification.recipient_id}
                onChange={(e) => setNotification({ ...notification, recipient_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter user/vendor ID..."
              />
            </div>
          )}

          <button
            onClick={handleSend}
            disabled={sending}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;