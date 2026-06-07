import * as fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

const target = `      const processBankSlip = async () => {
        try {
          setTopupError("");
          const checkRes = await fetch("/api/easyslip", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              payload: slipPayload,
            }),
          });
          const data = await checkRes.json();
          if (data.status === 200 && data.data) {
            const amount = parseFloat(data.data.amount.amount) || 0;
            const receiverName = data.data.receiver.name || "ไม่ทราบชื่อ";
            const senderName = data.data.sender.name || "ไม่ทราบชื่อ";
            const transRef = data.data.transRef;`;

const replacement = `      const processBankSlip = async () => {
        try {
          setTopupError("");
          
          const qrcode_text = await readQRFromImage(slipFile);
          if (!qrcode_text) {
            showToast("สลิปการโอนเงินไม่ถูกต้อง คิวอาร์โค้ดไม่สมบูรณ์ หรือไม่มีข้อมูล", "error");
            setIsProcessingTopup(false);
            return;
          }

          const checkRes = await fetch("/api/topup/bank", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              qrcode_text,
            }),
          });
          const data = await checkRes.json();
          if (data.status === "success" && data.data) {
            const amount = parseFloat(data.data.amount) || 0;
            const receiverName = data.data.receiver_name || "ไม่ทราบชื่อ";
            const senderName = data.data.sender_name || "ไม่ทราบชื่อ";
            const transRef = data.data.transRef || data.data.ref1;`;

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('src/App.tsx', content);
  console.log("Fixed processBankSlip successfully.");
} else {
  console.log("Target string not found.");
}
