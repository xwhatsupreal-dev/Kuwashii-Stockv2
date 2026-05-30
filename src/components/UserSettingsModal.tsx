import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Settings, AlertTriangle, KeySquare } from 'lucide-react';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
  onDeleteAccount: () => void;
  onChangePassword: (newPass: string) => void;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onDeleteAccount,
  onChangePassword,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

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
              <p className="text-xs text-zinc-500">จัดการข้อมูลผู้ใช้: <span className="font-mono text-zinc-300">{currentUser.username}</span></p>
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

            <hr className="border-zinc-800/50 my-6" />

            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center">
              <AlertTriangle className="w-5 h-5 text-red-400 mx-auto mb-2" />
              <h3 className="text-red-400 text-xs font-bold mb-1">อันตราย</h3>
              <p className="text-[10px] text-red-400/80 mb-3">หากลบบัญชี ข้อมูลเครดิตและประวัติการซื้อทั้งหมดจะสูญหายอย่างถาวร</p>
              
              {showConfirmDelete ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-white">คุณแน่ใจหรือไม่?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowConfirmDelete(false)}
                      className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-lg transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      onClick={() => {
                        setShowConfirmDelete(false);
                        onDeleteAccount();
                      }}
                      className="flex-1 py-1.5 bg-red-600 hover:bg-red-500 text-xs text-white font-bold rounded-lg transition-colors"
                    >
                      ยืนยันลบบัญชี
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="w-full py-1.5 border border-red-500/50 hover:bg-red-500/20 text-red-400 text-[11px] font-bold rounded-lg transition-colors"
                >
                  ลบบัญชีถาวร
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
