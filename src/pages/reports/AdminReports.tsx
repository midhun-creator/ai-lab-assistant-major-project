import { Activity, Users, BookOpen, Clock, Download, TrendingUp } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">System Analytics</h1>
          <p className="text-text-secondary mt-1">Global platform statistics across all departments.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-2 transition-colors">
            <Download className="w-4 h-4" />
            <span>Export Full Report</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-container flex items-center p-6 space-x-4">
          <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Platform Activity</p>
            <p className="text-2xl font-bold text-text-primary mt-1">+12% <span className="text-sm font-normal text-slate-400">vs last wk</span></p>
          </div>
        </div>

        <div className="card-container flex items-center p-6 space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Active Students</p>
            <p className="text-2xl font-bold text-text-primary mt-1">1,245</p>
          </div>
        </div>

        <div className="card-container flex items-center p-6 space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Active Courses</p>
            <p className="text-2xl font-bold text-text-primary mt-1">24</p>
          </div>
        </div>

        <div className="card-container flex items-center p-6 space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary">Avg System Uptime</p>
            <p className="text-2xl font-bold text-text-primary mt-1">99.9%</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card-container">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-bold text-text-primary">Department Performance</h2>
            <TrendingUp className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-text-primary">Computer Engineering</span>
                <span className="font-bold text-slate-500">82% Avg</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-primary-500 h-2 rounded-full" style={{ width: '82%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-text-primary">Electronics Engineering</span>
                <span className="font-bold text-slate-500">76% Avg</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '76%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-text-primary">Mechanical Engineering</span>
                <span className="font-bold text-slate-500">71% Avg</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '71%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-text-primary">Civil Engineering</span>
                <span className="font-bold text-slate-500">78% Avg</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '78%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="card-container bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl">
          <h2 className="font-serif text-xl font-bold mb-6 text-white">System Resource Usage</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-300">Database Storage</span>
                <span className="font-bold text-white">45%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-300">File Storage (Code & PDFs)</span>
                <span className="font-bold text-white">62%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '62%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-300">Code Execution (Judge0) Load</span>
                <span className="font-bold text-white">28%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-amber-400 h-2 rounded-full" style={{ width: '28%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-semibold text-slate-300">AI Inference Server Load</span>
                <span className="font-bold text-white">85%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-2">
                <div className="bg-red-400 h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
              <p className="text-xs text-red-300 mt-2 flex items-center">
                <Activity className="w-3 h-3 mr-1" /> High AI Server utilization detected
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
