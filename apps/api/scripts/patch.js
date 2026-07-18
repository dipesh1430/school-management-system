const fs = require('fs');
const data = require('./teacherSeedData.js');
data.forEach((t, i) => {
  const year = 1970 + (i % 25);
  const month = (i % 12) + 1;
  const day = (i % 28) + 1;
  t.dob = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
});
const output = `const teacherData = ${JSON.stringify(data, null, 2)};\n\nmodule.exports = teacherData;`;
fs.writeFileSync(__dirname + '/teacherSeedData.js', output);
console.log('Patched DOB!');
