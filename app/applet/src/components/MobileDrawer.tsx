import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, ShoppingBag, Wallet, Phone, Receipt, Mail, HelpCircle, LogOut, Facebook, MessageSquare, ChevronRight, QrCode, Trash2, UserPlus, Save as SaveIcon, Lock } from 'lucide-react';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  setPage?: (page: string) => void;
  setShowTopupModal?: (show: boolean) => void;
}

export const MobileDrawer = ({ isOpen, onClose, currentUser, onLoginClick, onLogoutClick, setPage, setShowTopupModal }: MobileDrawerProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[100]"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 max-h-[95vh] bg-[#fdfdfd] rounded-t-3xl z-[101] overflow-y-auto font-sans pb-6"
          >
            <div className="p-4 max-w-md mx-auto relative">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6" />
              
              {currentUser ? (
                <>
                  {/* User Profile Card */}
                  <div className="bg-white border border-gray-200 rounded-2xl p-4 flex items-center justify-between shadow-sm mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl border border-gray-200 flex items-center justify-center bg-gray-50 text-[#0ea5e9] font-bold text-xl uppercase shadow-sm">
                        {currentUser.username?.[0] || 'U'}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{currentUser.username}</h4>
                        <p className="text-xs text-gray-400 mb-1.5">{currentUser.email || 'No email'}</p>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 border border-blue-100 text-[#0ea5e9] text-xs font-bold font-mono tracking-tighter">
                            ฿{currentUser.credit?.toLocaleString() || 0}
                          </span>
                          <span className="px-2 py-0.5 rounded-full border border-orange-200 text-orange-500 text-[10px] font-bold">
                            {currentUser.points || 0} pts
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-800" />
                  </div>

                  {/* Main Grid Actions */}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    <button onClick={() => { setPage?.('home'); onClose(); }} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                      <Home className="w-6 h-6 text-[#0ea5e9] mb-2" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium text-gray-800">หน้าหลัก</span>
                    </button>
                    <button onClick={() => { setPage?.('home'); onClose(); }} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                      <ShoppingBag className="w-6 h-6 text-[#0ea5e9] mb-2" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium text-gray-800">ร้านค้า</span>
                    </button>
                    <button onClick={() => { setShowTopupModal?.(true); onClose(); }} className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                      <Wallet className="w-6 h-6 text-[#0ea5e9] mb-2" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium text-gray-800">เติมเงิน</span>
                    </button>
                    <button className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-2xl bg-white shadow-sm hover:bg-gray-50 active:scale-95 transition-all">
                      <Phone className="w-6 h-6 text-[#0ea5e9] mb-2" strokeWidth={1.5} />
                      <span className="text-[11px] font-medium text-gray-800">ติดต่อเรา</span>
                    </button>
                  </div>

                  {/* Menu List */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-sm mb-4 text-gray-700 divide-y divide-gray-100 overflow-hidden">
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Receipt className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-800">ประวัติการสั่งซื้อ</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-800">กล่องข้อความ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 flex items-center justify-center bg-gray-900 text-white text-[10px] font-bold rounded-full">0</span>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <Wallet className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-800">ประวัติการเติมเงิน</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <QrCode className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-800">ประวัติเติมเงิน QRline</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                    <button className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <HelpCircle className="w-5 h-5 text-gray-500" strokeWidth={1.5} />
                        <span className="text-sm font-medium text-gray-800">คำถามที่พบบ่อย</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Contact Section */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 font-medium mb-2 pl-1">ติดต่อเรา</p>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <Facebook className="w-5 h-5 text-blue-600" />
                        <span className="text-xs font-bold text-gray-900">Fetching shop-Thai</span>
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 py-3 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white shadow-sm">
                        <MessageSquare className="w-5 h-5 text-indigo-500" />
                        <span className="text-xs font-bold text-gray-900">Discord</span>
                      </button>
                    </div>
                  </div>

                  {/* Account Switch Section */}
                  <div className="mb-6">
                    <p className="text-xs text-gray-500 font-medium mb-2 pl-1">สลับบัญชี</p>
                    <div className="border border-gray-200 bg-white rounded-2xl p-4 shadow-sm mb-2 relative flex justify-between items-center">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 border border-gray-200">
                           <UserPlus className="w-5 h-5" />
                         </div>
                         <div>
                           <h4 className="font-bold text-gray-900 text-sm">{currentUser.username}</h4>
                           <p className="text-[11px] text-gray-500">{currentUser.email || 'No email'}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1.5 border border-gray-200 text-gray-800 text-[11px] font-bold rounded-lg bg-white">ใช้</span>
                        <button className="w-8 h-8 flex items-center justify-center text-gray-400 border border-gray-200 bg-white hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                       <button className="flex-1 flex items-center justify-center gap-2 py-3.5 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white font-semibold text-xs text-gray-600 shadow-sm">
                         <SaveIcon className="w-4 h-4" />
                         บันทึกบัญชีนี้
                       </button>
                       <button className="flex-1 flex items-center justify-center gap-2 py-3.5 px-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors bg-white font-semibold text-xs text-gray-600 shadow-sm">
                         <UserPlus className="w-4 h-4" />
                         เพิ่มบัญชีอื่น
                       </button>
                    </div>
                  </div>

                  {/* Logout Button */}
                  <button 
                    onClick={() => {
                        onLogoutClick();
                        onClose();
                    }}
                    className="w-full py-4 rounded-xl border border-red-200 bg-white hover:bg-red-50 text-red-500 font-bold flex items-center justify-center gap-2 transition-colors active:scale-95 shadow-sm"
                  >
                    <LogOut className="w-5 h-5" />
                    ออกจากระบบ
                  </button>
                </>
              ) : (
                <div className="py-8 text-center">
                   <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Lock className="w-8 h-8 text-gray-400" />
                   </div>
                   <h3 className="text-lg font-bold text-gray-900 mb-2">ยังไม่ได้เข้าสู่ระบบ</h3>
                   <p className="text-sm text-gray-500 mb-6">กรุณาเข้าสู่ระบบเพื่อดูข้อมูลบัญชีของคุณ</p>
                   <button 
                    onClick={() => { onClose(); onLoginClick(); }}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold transition-all"
                   >
                     เข้าสู่ระบบ / สมัครสมาชิก
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
