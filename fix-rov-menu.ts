import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const targetStr = `                  <span className="md:hidden">Hub</span>
                </motion.button>
              </div>
            </div>

            {/* Statistics summary row */}`;

if (content.split(targetStr).length === 3) {
  // It appears exactly twice. The second is the one for ROV.
  const parts = content.split(targetStr);
  const replacement = `                  <span className="md:hidden">Hub</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => setIsAstdMenuOpen(!isAstdMenuOpen)}
                  className="py-2.5 px-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition-all duration-300 flex items-center cursor-pointer shadow-xl shadow-black/30 relative"
                >
                  <Menu className="w-5 h-5 text-zinc-400" />
                </motion.button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isAstdMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAstdMenuOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-16 right-4 sm:right-6 lg:right-8 w-64 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden"
                      >
                        <div className="p-3 sm:hidden border-b border-zinc-800/50 mb-2">
                          <div className="flex flex-col gap-2">
                            {currentUser ? (
                              <>
                                <div className="flex items-center gap-2 px-2 py-1.5 mb-1 bg-zinc-950/50 rounded-lg">
                                  {isAdmin ? (
                                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                                  ) : (
                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                  )}
                                  <span className="text-sm font-semibold text-zinc-200">
                                    {currentUser.username}
                                  </span>
                                  {!isAdmin && (
                                    <span className="ml-auto text-xs font-mono text-emerald-400">
                                      ฿
                                      {Number(
                                        (appScreen === 'ROV' ? currentUserData?.balance_rov : currentUserData?.balance) || 0,
                                      ).toLocaleString(undefined, {
                                        maximumFractionDigits: 2,
                                        minimumFractionDigits: 0,
                                      })}
                                    </span>
                                  )}
                                </div>
                                {isAdmin && (
                                  <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    type="button"
                                    onClick={() => {
                                      setEditingItem(null);
                                      setIsFormOpen(true);
                                      setIsAstdMenuOpen(false);
                                    }}
                                    className="py-2 px-4 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                                  >
                                    <Plus className="w-4 h-4 text-indigo-400" />{" "}
                                    ลงขายสินค้า
                                  </motion.button>
                                )}
                              </>
                            ) : (
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                onClick={() => {
                                  setShowAuthModal(true);
                                  setIsAstdMenuOpen(false);
                                }}
                                className="w-full py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-colors shadow-lg shadow-amber-500/20"
                              >
                                เข้าสู่ระบบ / สมัครสมาชิก
                              </motion.button>
                            )}
                          </div>
                        </div>

                        <div className="py-2">
                          {currentUser ? (
                            <>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowTopupModal(true);
                                  setIsAstdMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                              >
                                <Wallet className="w-4 h-4 text-amber-400" />{" "}
                                เติมเงิน
                              </motion.button>
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowHistoryModal(true);
                                  setIsAstdMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                              >
                                <History className="w-4 h-4 text-blue-400" />{" "}
                                ประวัติการทำรายการ
                              </motion.button>
                              <div className="h-px bg-zinc-800/50 my-1" />
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  setShowUserSettingsModal(true);
                                  setIsAstdMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 rounded-xl hover:bg-zinc-800 text-sm text-zinc-300 hover:text-white transition-colors flex items-center gap-3"
                              >
                                <Settings className="w-4 h-4 text-zinc-400" /> ตั้งค่าบัญชี
                              </motion.button>
                              <div className="h-px bg-zinc-800/50 my-1" />
                              <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                  logout();
                                  setIsAstdMenuOpen(false);
                                }}
                                className="w-full text-left px-4 py-2.5 hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors flex items-center gap-3"
                              >
                                <LogOut className="w-4 h-4" /> ออกจากระบบ
                              </motion.button>
                            </>
                          ) : (
                            <div className="px-4 py-3 text-center">
                              <p className="text-xs text-zinc-500 mb-2">
                                กรุณาเข้าสู่ระบบเพื่อใช้งานเมนูอื่นๆ
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Statistics summary row */}`;

  content = parts[0] + targetStr + parts[1] + replacement + parts[2];
  fs.writeFileSync('src/App.tsx', content);
  console.log('Fixed correctly via exact occurrence replacement.');
} else {
  console.log('Target string does not appear exactly twice. Found: ' + (content.split(targetStr).length - 1));
}
