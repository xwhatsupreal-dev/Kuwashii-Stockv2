import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Settings, KeySquare, Eye, EyeOff, Save, CheckCircle } from 'lucide-react';
import { supabase } from '../supabase';

interface UserSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { username: string } | null;
  onChangePassword: (newPass: string) => void;
  onChangeUsername: (newUsername: string) => Promise<boolean>;
  onChangeEmail: (newEmail: string) => Promise<boolean>;
}

export const UserSettingsModal: React.FC<UserSettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onChangePassword,
  onChangeUsername,
  onChangeEmail,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [editUsername, setEditUsername] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [userEmail, setUserEmail] = useState('-');

  useEffect(() => {
    if (isOpen && currentUser) {
      setEditUsername(currentUser.username);
      supabase.from('profiles').select('email').eq('username', currentUser.username).single().then(({ data }) => {
        if (data && data.email) {
          setUserEmail(data.email);
          setEditEmail(data.email);
        } else {
          setUserEmail('-');
          setEditEmail('');
        }
      });
    } else {
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [isOpen, currentUser]);

  const handleSavePassword = () => {
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        alert('รหัสผ่านไม่ตรงกัน');
        return;
      }
      onChangePassword(newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveUsername = async () => {
    if (editUsername !== currentUser?.username) {
      const success = await onChangeUsername(editUsername);
      if (!success) {
        setEditUsername(currentUser?.username || '');
      }
    }
  };

  const handleSaveEmail = async () => {
    if (editEmail !== userEmail) {
      const success = await onChangeEmail(editEmail);
      if (success) {
        setUserEmail(editEmail);
      } else {
        setEditEmail(userEmail);
      }
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
          className="relative max-w-sm sm:max-w-md w-full rounded-2xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl z-10 font-sans max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800"
        >
          <motion.button whileTap={{ scale: 0.95 }}
            type="button"
            className="absolute top-4 right-4 text-zinc-500 hover:text-white p-1 rounded-md hover:bg-zinc-900 transition-colors"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </motion.button>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
              <Settings className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">ตั้งค่าบัญชี</h2>
              <p className="text-xs text-zinc-400 mt-1">จัดการข้อมูลส่วนตัว</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Username Section */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                ชื่อผู้ใช้ (เปลี่ยนได้ทุก 7 วัน)
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  className="flex-1 bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs font-mono"
                />
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleSaveUsername}
                  disabled={editUsername === currentUser.username}
                  className="py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-xs shadow-md flex items-center gap-2"
                >
                  <Save className="w-3.5 h-3.5 max-sm:hidden" /> บันทึก
                </motion.button>
              </div>
            </div>

            {/* Email Section */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                อีเมล
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder={userEmail !== '-' ? userEmail : 'ใส่อีเมลของคุณ...'}
                  className="flex-1 min-w-0 bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs font-sans"
                />
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleSaveEmail}
                  disabled={editEmail === userEmail || !editEmail.includes('@')}
                  className="py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-xs shadow-md flex items-center gap-2 shrink-0"
                >
                  <Save className="w-3.5 h-3.5 max-sm:hidden" /> บันทึก
                </motion.button>
              </div>
            </div>

            <div className="h-px w-full bg-zinc-800/50 my-2" />

            {/* Password Section */}
            <div>
              <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-2">
                เปลี่ยนรหัสผ่านใหม่
              </label>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="รหัสผ่านใหม่..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono pr-10"
                  />
                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="ยืนยันรหัสผ่านใหม่..."
                    className="w-full bg-zinc-900 border border-zinc-800 text-zinc-100 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-indigo-500 transition-all text-xs placeholder-zinc-600 font-mono pr-10"
                  />
                  <motion.button whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
                <motion.button whileTap={{ scale: 0.95 }}
                  onClick={handleSavePassword}
                  disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white transition-all text-sm shadow-md flex items-center justify-center gap-2"
                >
                  <KeySquare className="w-4 h-4" /> อัปเดตรหัสผ่าน
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
