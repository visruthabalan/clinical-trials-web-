
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts';
import { ClinicalData, TrialSite } from '../types';
import { COLORS } from '../constants';

interface DashboardProps {
  data: ClinicalData;
  onSiteSelect: (site: TrialSite) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, onSiteSelect }) => {
  const enrollmentData = data.sites.map(s => ({ name: s.id, value: s.enrollmentRate }));
  const riskData = data.sites.map(s => ({ name: s.id, risk: s.riskScore }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Subjects', value: data.totalSubjects, target: data.targetSubjects, color: 'text-blue-600' },
          { label: 'Total Queries', value: data.totalQueries, color: 'text-amber-600' },
          { label: 'Avg Risk Score', value: (data.sites.reduce((a, b) => a + b.riskScore, 0) / data.sites.length).toFixed(1), color: 'text-rose-600' },
          { label: 'Active Sites', value: data.sites.filter(s => s.status === 'Active').length, color: 'text-emerald-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border shadow-sm transition-transform hover:-translate-y-1">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
            <div className="flex items-baseline mt-2">
              <h3 className={`text-3xl font-bold ${stat.color}`}>{stat.value}</h3>
              {stat.target && <span className="text-sm text-slate-400 ml-2">/ {stat.target}</span>}
            </div>
            {stat.target && (
              <div className="mt-4 w-full bg-slate-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full" 
                  style={{ width: `${(stat.value as number / stat.target) * 100}%` }}
                ></div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Enrollment Performance */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Enrollment Velocity by Site</h3>
            <span className="text-xs text-slate-400">Pts / Month</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: '#f8fafc' }} 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                   {enrollmentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.value > 2 ? COLORS.success : entry.value < 1 ? COLORS.danger : COLORS.primary} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="bg-white p-6 rounded-2xl border shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Risk Profile Heatmap</h3>
            <span className="text-xs text-slate-400">Probability of Delay</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={riskData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="risk" 
                  stroke={COLORS.primary} 
                  strokeWidth={3} 
                  dot={{ r: 6, fill: COLORS.primary, strokeWidth: 2, stroke: '#fff' }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Site Table Quick View */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-6 border-b">
          <h3 className="font-bold text-slate-800">Operational Table</h3>
        </div>
        <table className="w-full text-left">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Site Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Open Queries</th>
              <th className="px-6 py-4 text-center">Avg Aging</th>
              <th className="px-6 py-4 text-center">Risk Score</th>
              <th className="px-6 py-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data.sites.map(site => (
              <tr key={site.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-800">{site.name}</div>
                  <div className="text-xs text-slate-400">{site.id} | {site.location}</div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${site.status === 'At Risk' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                    {site.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center font-medium">{site.openQueries}</td>
                <td className="px-6 py-4 text-center text-slate-600">{site.queryAgingDays}d</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="font-bold">{site.riskScore}</span>
                    <div className="w-16 h-1 bg-slate-100 rounded-full">
                      <div 
                        className={`h-1 rounded-full ${site.riskScore > 60 ? 'bg-rose-500' : site.riskScore > 30 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${site.riskScore}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <button 
                    onClick={() => onSiteSelect(site)}
                    className="text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    View Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
