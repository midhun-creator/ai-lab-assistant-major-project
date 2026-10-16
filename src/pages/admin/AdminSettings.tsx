import { Save, ShieldAlert, Key, Database } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="font-serif text-3xl font-bold text-text-primary">System Settings</h1>
        <p className="text-text-secondary mt-1">Configure global application settings and integrations.</p>
      </div>

      <div className="card-container p-8 space-y-8">
        {/* Authentication Settings */}
        <section>
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100">
            <Key className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-lg text-text-primary">Authentication</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">Require Email Verification</p>
                <p className="text-sm text-text-secondary">Force users to verify their email before logging in.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-text-primary">JWT Token Expiry (Hours)</p>
                <p className="text-sm text-text-secondary">How long access tokens remain valid.</p>
              </div>
              <input type="number" defaultValue={24} className="w-20 px-3 py-1.5 border border-slate-200 rounded-lg text-center" />
            </div>
          </div>
        </section>

        {/* AI Integration */}
        <section>
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100">
            <Database className="w-5 h-5 text-slate-400" />
            <h2 className="font-bold text-lg text-text-primary">Local AI Server</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Inference API Endpoint URL</label>
              <input type="text" defaultValue="http://localhost:8000/v1/chat/completions" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Model Name</label>
              <input type="text" defaultValue="Llama-3-8B-Instruct" className="w-full border border-slate-200 rounded-lg px-4 py-2" />
            </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <div className="flex items-center space-x-3 mb-4 pb-4 border-b border-slate-100">
            <ShieldAlert className="w-5 h-5 text-red-400" />
            <h2 className="font-bold text-lg text-red-600">Danger Zone</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
              <div>
                <p className="font-semibold text-red-700">Clear Cache & Sessions</p>
                <p className="text-sm text-red-500">Forces all users to log in again immediately.</p>
              </div>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold text-sm transition-colors">
                Invalidate All
              </button>
            </div>
          </div>
        </section>
        
        <div className="pt-4 flex justify-end">
          <button className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-md transition-colors">
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
}
