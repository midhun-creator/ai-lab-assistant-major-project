import { useState, useEffect } from "react";
import { Search, UploadCloud, Plus, MoreVertical, Shield, GraduationCap, User } from "lucide-react";
import { api } from "../../lib/api";
import type { User as UserType, Role } from "../../lib/types";

export default function AdminUsers() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const allUsers = await api.users.getAll();
      setUsers(allUsers);
      setLoading(false);
    }
    load();
  }, []);

  const filteredUsers = users.filter(u => 
    (roleFilter === "all" || u.role === roleFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary mt-1">Manage students, teachers, and system administrators.</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg font-semibold shadow-sm flex items-center space-x-2 transition-colors">
            <UploadCloud className="w-4 h-4" />
            <span>Import CSV</span>
          </button>
          <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold shadow-md flex items-center space-x-2 transition-colors">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      <div className="card-container !p-0 overflow-hidden border border-slate-200">
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row gap-4 bg-slate-50/50">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            />
          </div>
          <div className="flex space-x-2">
            {(["all", "student", "teacher", "admin"] as const).map(role => (
              <button 
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
                  roleFilter === role 
                    ? "bg-primary-100 text-primary-700 shadow-sm" 
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 text-sm">
                <th className="px-6 py-4 font-semibold">User</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0
                          ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'teacher' ? 'bg-emerald-100 text-emerald-700' : 
                            'bg-blue-100 text-blue-700'}
                        `}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-text-primary group-hover:text-primary-600 transition-colors">{u.name}</p>
                          <p className="text-sm text-text-secondary">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                        ${u.role === 'admin' ? 'bg-purple-50 text-purple-600 border border-purple-200' : 
                          u.role === 'teacher' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 
                          'bg-blue-50 text-blue-600 border border-blue-200'}
                      `}>
                        {u.role === 'admin' && <Shield className="w-3 h-3" />}
                        {u.role === 'teacher' && <User className="w-3 h-3" />}
                        {u.role === 'student' && <GraduationCap className="w-3 h-3" />}
                        <span>{u.role}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center space-x-1.5 text-emerald-600 text-sm font-semibold">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        <span>Active</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="p-2 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
