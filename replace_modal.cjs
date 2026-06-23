const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const loginBlock = `
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAuthModal(false)}
              className="absolute inset-0 bg-black/60"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative max-w-sm w-full rounded-xl bg-white p-6 md:p-8 shadow-2xl z-10 text-black font-sans"
            >
              <div className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer" onClick={() => setShowAuthModal(false)}>
                <X className="w-5 h-5" />
              </div>

              <div className="mb-6">
                <h3 className="text-2xl font-bold text-black mb-1">
                  เข้าสู่ระบบ
                </h3>
                <p className="text-sm text-gray-500">
                  กรุณาเข้าสู่ระบบเพื่อดำเนินการต่อ
                </p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="text-[14px] font-bold text-black block mb-2">
                    อีเมลหรือชื่อผู้ใช้
                  </label>
                  <input
                    type="text"
                    value={authUsername}
                    onChange={(e) => {
                      setAuthUsername(e.target.value);
                      setAuthError('');
                    }}
                    placeholder="username หรือ email"
                    required
                    autoFocus
                    autoComplete="username"
                    className="w-full bg-white border border-gray-300 text-black px-4 py-3 rounded-lg focus:outline-none focus:border-[#0ea5e9] transition-all text-sm placeholder-gray-400 font-medium"
                  />
                </div>

                <div>
                  <label className="text-[14px] font-bold text-black block mb-2">
                    รหัสผ่าน
                  </label>
                  <div className="relative">
                    <input
                      type={showAuthPassword ? 'text' : 'password'}
                      value={authPassword}
                      onChange={(e) => {
                        setAuthPassword(e.target.value);
                        setAuthError('');
                      }}
                      placeholder="........"
                      required
                      autoComplete="current-password"
                      className="w-full bg-white border border-gray-300 text-black px-4 py-3 rounded-lg focus:outline-none focus:border-[#0ea5e9] transition-all text-sm placeholder-gray-400 font-medium pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAuthPassword(!showAuthPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showAuthPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-4 mb-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className="relative flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={rememberAuth}
                        onChange={(e) => setRememberAuth(e.target.checked)}
                        className="appearance-none w-4 h-4 rounded border border-gray-300 bg-white checked:bg-[#0ea5e9] checked:border-[#0ea5e9] transition-colors cursor-pointer"
                      />
                      <Check className={\`w-3 h-3 text-white absolute pointer-events-none transition-opacity \${rememberAuth ? 'opacity-100' : 'opacity-0'}\`} />
                    </div>
                    <span className="text-sm text-gray-500 font-medium select-none">จดจำฉันไว้</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('forgot');
                      setAuthError('');
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
                  >
                    ลืมรหัสผ่าน?
                  </button>
                </div>

                {authError && (
                  <div className="text-sm text-red-500 text-center bg-red-50 p-2 rounded-lg border border-red-200 mt-2 mb-2">
                    {authError}
                  </div>
                )}

                <FakeTurnstile />

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-lg bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-bold cursor-pointer transition-all mt-4"
                >
                  เข้าสู่ระบบ
                </button>

                <div className="text-center mt-6 text-sm">
                  <span className="text-gray-500">ยังไม่มีบัญชี? </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError('');
                    }}
                    className="text-black font-bold hover:underline ml-1"
                  >
                    สมัครสมาชิก
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
`;

const startIndex = content.indexOf('{showAuthModal && (');
if (startIndex === -1) {
    console.error('Cannot find start');
    process.exit(1);
}

let balance = 0;
let endIndex = -1;
let started = false;

for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') {
        balance++;
        started = true;
    } else if (content[i] === '}') {
        balance--;
    }
    
    if (started && balance === 0) {
        endIndex = i;
        break;
    }
}

if (endIndex === -1) {
    console.error('Cannot find end');
    process.exit(1);
}

const originalModal = content.substring(startIndex, endIndex + 1);
const innerOriginal = originalModal.substring(20, originalModal.length - 2);

const replacement = `{showAuthModal && (
  authMode === 'login' ? (
    ${loginBlock.trim()}
  ) : (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      ${innerOriginal}
    </div>
  )
)}`;

content = content.substring(0, startIndex) + replacement + content.substring(endIndex + 1);

fs.writeFileSync('src/App.tsx', content, 'utf8');
