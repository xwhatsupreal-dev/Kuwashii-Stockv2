import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Settings, KeySquare } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
  onChangePassword: (newPass: string) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePassword,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSave = () => {
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
      }
      onChangePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    }
  };

  if (!isOpen || !currentUser) return null;

  // Retrieve user email
  let userEmail = '-';
  if (currentUser) {
     const v2UsersStr = localStorage.getItem('KUWASHII_V2_USERS');
     if (v2UsersStr) {
       const v2Users = JSON.parse(v2UsersStr);
       const userStr = v2Users[currentUser.username];
       if (userStr && userStr.email) {
          userEmail = userStr.email;
       }
     }
     
     if (userEmail === '-') {
        const v1UsersStr = localStorage.getItem('KUWASHII_USERS');
        if (v1UsersStr) {
           const v1Users = JSON.parse(v1UsersStr);
           const v1User = v1Users[currentUser.username];
           if (v1User && typeof v1User !== 'string' && v1User.email) {
              userEmail = v1User.email;
           }
        }
     }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative max-w-sm w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10 font-sans"
        >
          <button
            type="button"
            className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">ตั้งค่าบัญชี</h2>
              <p className="text-xs text-zinc-400 mt-1">ผู้ใช้: <span className="font-mono text-zinc-200">{currentUser.username}</span></p>
              <p className="text-xs text-zinc-500 mt-0.5">อีเมล: <span className="font-sans text-zinc-400">{userEmail}</span></p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                เปลี่ยนรหัสผ่านใหม่
              </label>
              <div className="space-y-2">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="รหัสผ่านใหม่..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono"
                />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="ยืนยันรหัสผ่านใหม่..."
                  className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleSave}
              className="w-full py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm shadow-md"
            >
              บันทึกการตั้งค่า
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
