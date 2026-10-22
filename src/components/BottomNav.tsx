import React from 'react';
import { ViewScreen } from '../types/product';
import { LayoutDashboard, Layers, PlusCircle, LogOut } from 'lucide-react';

interface BottomNavProps {
  currentScreen: ViewScreen;
  onNavigate: (screen: ViewScreen) => void;
  onLogout: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentScreen,
  onNavigate,
  onLogout,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-4 py-2 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
        {/* Dashboard button */}
        <button
          onClick={() => onNavigate('dashboard')}
          className={`flex-1 py-2 px-3 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
            currentScreen === 'dashboard'
              ? 'bg-[#315EFB]/10 text-[#315EFB]'
              : 'text-[#6C707A] hover:bg-slate-50'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>Dashboard</span>
        </button>

        {/* Products button matching btnProducts in activity_main.xml */}
        <button
          onClick={() => onNavigate('products')}
          className={`flex-1 py-2 px-3 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
            currentScreen === 'products'
              ? 'bg-[#315EFB]/10 text-[#315EFB]'
              : 'text-[#6C707A] hover:bg-slate-50'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span>Products</span>
        </button>

        {/* Add button matching btnAdd in activity_main.xml */}
        <button
          onClick={() => onNavigate('add')}
          className={`flex-1 py-2 px-3 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 font-semibold text-xs transition-all cursor-pointer ${
            currentScreen === 'add'
              ? 'bg-[#315EFB] text-white shadow-xs'
              : 'bg-[#315EFB]/10 text-[#315EFB] hover:bg-[#315EFB]/20'
          }`}
        >
          <PlusCircle className="w-5 h-5" />
          <span>Add</span>
        </button>

        {/* Logout button matching btnLogout in activity_main.xml */}
        <button
          onClick={onLogout}
          className="flex-1 py-2 px-3 rounded-xl flex flex-col md:flex-row items-center justify-center gap-1 font-semibold text-xs text-[#C62828] hover:bg-red-50 transition-all cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  );
};
