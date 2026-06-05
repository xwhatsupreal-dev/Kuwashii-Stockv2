import fs from 'fs';

let content = fs.readFileSync('src/components/AdminModal.tsx', 'utf8');

// 1. Add state variable
content = content.replace("const [imageUrl, setImageUrl] = useState('');", "const [imageUrl, setImageUrl] = useState('');\n  const [imageUrlsText, setImageUrlsText] = useState('');");

// 2. Set value on edit
let initValue = `      const isBase64 = editingItem.imageUrl?.startsWith('data:image/');`;
let replaceInitValue = `      setImageUrlsText(editingItem.imageUrls ? editingItem.imageUrls.join('\\n') : '');\n` + initValue;
content = content.replace(initValue, replaceInitValue);

// Clear value on new
content = content.replace("setImageUrl('');\n      setUploadBase64('');", "setImageUrl('');\n      setUploadBase64('');\n      setImageUrlsText('');");

// 3. Process value on save
let saveValueFrom = `    const accCreds = accountCredentialsText.trim().split('\\n').map(c => c.trim()).filter(c => c.length > 0);`;
let saveValueTo = `    const addImgs = imageUrlsText.trim().split('\\n').map(c => c.trim()).filter(c => c.length > 0);\n` + saveValueFrom;
content = content.replace(saveValueFrom, saveValueTo);

let passToSaveFrom = `imageUrl: finalImageUrl || undefined,`;
let passToSaveTo = passToSaveFrom + `\n      imageUrls: addImgs.length > 0 ? addImgs : undefined,`;
content = content.replace(passToSaveFrom, passToSaveTo);

// 4. Add UI field
let uiFrom = `{/* Submit and Cancel items */}`;
let uiTo = `{/* Additional Images */}\n            <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-850 space-y-3">\n              <div className="flex items-center justify-between mb-2">\n                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block font-sans">\n                  รูปภาพเพิ่มเติม (Additional Images URL)\n                </span>\n                <span className="text-[10px] text-zinc-500">1 บรรทัดต่อ 1 ลิงก์</span>\n              </div>\n              <textarea\n                value={imageUrlsText}\n                onChange={e => setImageUrlsText(e.target.value)}\n                placeholder="https://images.unsplash.com/...\\nhttps://images.unsplash.com/..."\n                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 px-3 py-2 rounded-xl text-xs sm:text-sm font-mono focus:outline-none focus:border-amber-500 h-24 resize-y"\n              />\n            </div>\n\n            ` + uiFrom;

content = content.replace(uiFrom, uiTo);

fs.writeFileSync('src/components/AdminModal.tsx', content);
console.log('Saved AdminModal');
