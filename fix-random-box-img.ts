import fs from 'fs';

let content = fs.readFileSync('src/components/RandomBoxModal.tsx', 'utf8');

const targetStr = `            {/* Description matching screenshot format */}
            <div className="text-zinc-400 text-[13px] leading-relaxed whitespace-pre-wrap mb-5 mt-3 font-medium">
              {item.description /* custom description here */}
              {item.description && <div className="h-px bg-zinc-800/50 my-3" />}`;

const replacementStr = targetStr + `\n\n              {/* Additional Images */}\n              {item.imageUrls && item.imageUrls.length > 0 && (\n                <div className="mb-4">\n                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1.5 font-sans">📸 รูปภาพเพิ่มเติม:</span>\n                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-zinc-800">\n                    {item.imageUrls.map((url, idx) => (\n                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex-shrink-0 w-20 h-20 bg-zinc-950 border border-zinc-850 rounded-lg overflow-hidden group cursor-pointer">\n                        <img src={url} alt={\`Additional \${idx+1}\`} referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />\n                      </a>\n                    ))}\n                  </div>\n                </div>\n              )}`;


if (content.includes(`{item.description && <div className="h-px bg-zinc-800/50 my-3" />}`)) {
    content = content.replace(targetStr, replacementStr);
    fs.writeFileSync('src/components/RandomBoxModal.tsx', content);
    console.log('Fixed RandomBoxModal');
} else {
    console.log('targetStr not found inside RandomBoxModal');
}
