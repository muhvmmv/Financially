import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  PieChart, 
  TrendingUp, 
  CreditCard, 
  Bell, 
  MoreVertical,
  LogOut
} from 'lucide-react';

function Sidebar({ user, handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', icon: PieChart, path: '/dashboard' },
    { name: 'Transactions', icon: CreditCard, path: '/transactions' },
    { name: 'Budgets', icon: TrendingUp, path: '/budgets' },
    { name: 'Alerts', icon: Bell, path: '/alerts' },
  ];

  return (
    <div className="w-64 bg-blue-900 text-white min-h-screen">
      <div className="p-6 flex items-center gap-3 border-b border-blue-800">
        <PieChart className="text-yellow-400 w-8 h-8" />
        <span className="font-display text-xl font-bold">Financially</span>
      </div>
      <div className="p-4">
        <div className="mb-8">
          <h3 className="text-xs uppercase text-blue-400 tracking-wider mb-3 px-3">Menu</h3>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <button 
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                    location.pathname === item.path
                      ? 'bg-blue-800 text-yellow-400' 
                      : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </button>
              </li>
            ))}
            <li>
              <button 
                onClick={() => navigate('/profile')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${
                  location.pathname === '/profile'
                    ? 'bg-blue-800 text-yellow-400' 
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <MoreVertical className="w-5 h-5" />
                <span>Profile</span>
              </button>
            </li>
            <li>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-red-400 hover:bg-blue-800 hover:text-red-300 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;

export function SidebarContent({ children }) {
  return <div className="p-4">{children}</div>;
}

export function SidebarGroup({ children }) {
  return <div className="mb-6">{children}</div>;
}

export function SidebarGroupLabel({ children }) {
  return <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-2">{children}</div>;
}

export function SidebarGroupContent({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenu({ children }) {
  return <div className="space-y-1">{children}</div>;
}

export function SidebarMenuItem({ children }) {
  return <div>{children}</div>;
}

export function SidebarMenuButton({ children, isActive, asChild, className }) {
  const classes = `${className} ${isActive ? 'bg-primary/10 font-medium' : ''}`;
  return asChild ? (
    children
  ) : (
    <button className={classes}>{children}</button>
  );
}