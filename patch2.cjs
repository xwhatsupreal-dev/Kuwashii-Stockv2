const fs = require('fs');
const content = fs.readFileSync('src/components/SalesChart.tsx', 'utf-8');
console.log("File read successfully, length: ", content.length);
