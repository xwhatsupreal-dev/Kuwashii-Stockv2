import React from 'react';
import { Search, Menu, LogIn, User, CircleDollarSign } from 'lucide-react';

export const ShopHeader = ({ toggleSidebar, onSearchToggle, currentUser, onLoginClick }: { toggleSidebar: () => void, onSearchToggle: () => void, currentUser: any, onLoginClick: () => void }) => {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.href = `/`}>
          {/* Logo Placeholder */}
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-blue-900/40 flex items-center justify-center bg-blue-900/20 overflow-hidden">
            <img src="https://img2.pic.in.th/1000111145.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => window.location.href = `/statement`} className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-full transition-colors font-medium text-sm">
            <CircleDollarSign className="w-4 h-4" />
            <span>Statement</span>
          </button>
          <button onClick={onSearchToggle} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-900/20 rounded-full transition-colors hidden sm:block">
            <Search className="w-5 h-5" />
          </button>
          
          <div className="h-5 w-[1px] bg-zinc-700 hidden sm:block mx-1"></div>

          {currentUser ? (
            <div className="flex items-center gap-3 bg-blue-900/20 border border-blue-900/40 px-3 py-1.5 rounded-full cursor-pointer hover:bg-blue-900/20 transition-colors">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-xs font-bold text-zinc-200">{currentUser.username}</span>
                <span className="text-[10px] text-blue-600 font-semibold">{currentUser.credit?.toLocaleString() || 0} บาท</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <User className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-semibold transition-colors shadow-sm shadow-blue-500/20"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">เข้าสู่ระบบ</span>
            </button>
          )}

          <button onClick={toggleSidebar} className="p-2 text-zinc-400 hover:text-blue-600 hover:bg-blue-900/20 rounded-full transition-colors relative">
            <Menu className="w-6 h-6" />
            {!currentUser && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
          </button>
        </div>
      </div>
    </header>
  );
};

