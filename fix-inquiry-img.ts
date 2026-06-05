import fs from 'fs';

let content = fs.readFileSync('src/components/InquiryModal.tsx', 'utf8');

const targetStr = `            {/* Dedicated full item description wrapper */}
            {item.description && (
              <div className="bg-zinc-900/20 p-3 rounded-xl border border-zinc-900 text-xs leading-relaxed">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1 font-sans">📝 คำอธิบายสินค้า / รายละเอียด:</span>
                <p className="text-zinc-200 whitespace-pre-wrap font-sans font-medium text-[11px] leading-relaxed break-words">
                  {item.description}
                </p>
              </div>
            )}`;

const replaceStr = targetStr + `\n\n            {/* Additional Images */}\n            {item.imageUrls && item.imageUrls.length > 0 && (\n              <div className="mt-2">\n                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5 font-sans">📸 รูปภาพเพิ่มเติม (คลิกเพื่อขยาย):</span>\n                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">\n                  {item.imageUrls.map((url, idx) => (\n                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-20 h-20 bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden group cursor-pointer">\n                      <img src={url} alt={\`Additional \${idx+1}\`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />\n                    </a>\n                  ))}\n                </div>\n              </div>\n            )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, replaceStr);
    fs.writeFileSync('src/components/InquiryModal.tsx', content);
    console.log('Fixed InquiryModal');
} else {
    console.log('targetStr not found');
}
