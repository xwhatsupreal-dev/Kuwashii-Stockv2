const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Target the ROV specific code specifically by finding the ROV screen context
const rovSearchIndex = code.indexOf('if (appScreen === "ROV") {');
if (rovSearchIndex === -1) {
    console.error("Could not find ROV screen start");
    process.exit(1);
}

const beforeRov = code.slice(0, rovSearchIndex);
let targetRov = code.slice(rovSearchIndex);

const target1 = `<div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl">
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
                  สินค้าสะสมในสต๊อก
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  {isLoadingStock ? (
                    <div className="h-8 w-12 bg-zinc-850/80 animate-pulse rounded" />
                  ) : (
                    <>
                      <span className="font-mono text-2xl font-black text-yellow-500">
                        {totalStockUnits}
                      </span>
                      <span className="text-xs text-zinc-500">ชิ้น</span>
                    </>
                  )}
                </div>
              </div>`;

const replacement1 = target1 + `

              <div className="bg-zinc-900/40 border border-zinc-900/60 p-4 rounded-xl relative group">
                {isAdmin && (
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        const currentVal = String(globalStats?.global_sales_rov || 0);
                        const newVal = window.prompt("แก้ไขยอดขายไปแล้วทั้งหมด (ROV)", currentVal);
                        if (newVal !== null && !isNaN(parseInt(newVal))) {
                          const val = parseInt(newVal);
                          const { error } = await supabase
                            .from("system_config")
                            .update({ global_sales_rov: val })
                            .eq("id", "main");
                          
                          if (error) {
                             showToast("อัปเดตล้มเหลว กรุณาเพิ่มคอลัมน์ global_sales_rov ในฐานข้อมูล (System Config)", "error");
                             // Still update locally for this session
                             setGlobalStats({ ...globalStats, global_sales_rov: val });
                          } else {
                             setGlobalStats({ ...globalStats, global_sales_rov: val });
                             window.dispatchEvent(new Event("sync-update"));
                             showToast("อัปเดตยอดขายแล้ว (ROV)", "success");
                          }
                        }
                      }}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleHideGlobalStats}
                      className="p-1.5 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white"
                    >
                      {hideGlobalStats ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </motion.button>
                  </div>
                )}
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest font-sans">
                  ยอดขายไปแล้วทั้งหมด
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="font-mono text-2xl font-black text-emerald-400">
                    {hideGlobalStats ? "***" : Number(globalStats?.global_sales_rov || 0).toLocaleString()}
                  </span>
                  <span className="text-xs text-zinc-500">ชิ้น</span>
                </div>
              </div>`;

const targetGrid = `{/* Statistics summary row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">`;
const replacementGrid = `{/* Statistics summary row */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8">`;

targetRov = targetRov.replace(targetGrid, replacementGrid);
targetRov = targetRov.replace(target1, replacement1);

fs.writeFileSync('src/App.tsx', beforeRov + targetRov);
console.log('Fixed ROV sales panel additions');
