'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const [settings, setSettings] = useState({
    platformName: 'TheoCode Academy',
    maintenanceMode: false,
    defaultLanguage: 'javascript',
    allowPublicRegistration: true,
    maxSubmissionsPerDay: 50,
  });

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setMessage('✅ Settings saved successfully!');
    setSaving(false);
    
    // Clear message after 3 seconds
    setTimeout(() => setMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">⚙️ Platform Settings</h1>
        <p className="text-gray-400">Configure global settings for TheoCode Academy</p>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-600/20 border border-green-500/30 rounded-lg text-green-400 font-bold animate-pulse">
          {message}
        </div>
      )}

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6">General Settings</h2>
        
        <div className="space-y-6">
          {/* Platform Name */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Platform Name</label>
            <input
              type="text"
              value={settings.platformName}
              onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
              className="w-full max-w-md bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            />
          </div>

          {/* Default Language */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Default Challenge Language</label>
            <select
              value={settings.defaultLanguage}
              onChange={(e) => setSettings({ ...settings, defaultLanguage: e.target.value })}
              className="w-full max-w-md bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
          </div>

          {/* Max Submissions */}
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">Max Submissions Per Day (Per User)</label>
            <input
              type="number"
              value={settings.maxSubmissionsPerDay}
              onChange={(e) => setSettings({ ...settings, maxSubmissionsPerDay: parseInt(e.target.value) || 0 })}
              className="w-full max-w-md bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-green-500 focus:outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">Prevents abuse of the code execution engine.</p>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
        <h2 className="text-xl font-bold text-white mb-6">Access & Security</h2>
        
        <div className="space-y-6">
          {/* Maintenance Mode */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Maintenance Mode</div>
              <div className="text-sm text-gray-400">Temporarily disable student access to the platform.</div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.maintenanceMode ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Public Registration */}
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-white">Allow Public Registration</div>
              <div className="text-sm text-gray-400">Let new users sign up without an invite.</div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, allowPublicRegistration: !settings.allowPublicRegistration })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.allowPublicRegistration ? 'bg-green-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  settings.allowPublicRegistration ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-8 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 text-white rounded-lg font-bold transition flex items-center gap-2"
        >
          {saving ? (
            <>
              <span className="animate-spin">⚙️</span>
              Saving...
            </>
          ) : (
            '💾 Save Settings'
          )}
        </button>
      </div>
    </div>
  );
}