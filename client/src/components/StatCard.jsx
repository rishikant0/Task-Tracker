import React from 'react';

const StatCard = ({ title, value, icon, colorClass }) => {
  return (
    <div className="glass-card p-6 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
