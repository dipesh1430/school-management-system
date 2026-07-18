export const downloadCSV = (data: any[], filename: string) => {
  if (!data || !data.length) return;

  // Extract all unique headers from the array of objects
  const headers = Array.from(
    new Set(data.flatMap(Object.keys))
  );

  const csvRows = [];
  
  // Add Header Row
  csvRows.push(headers.join(','));

  // Add Data Rows
  for (const row of data) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return '""';
      
      // Convert nested objects to string or handle strings
      let stringVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
      
      // Escape quotes and wrap in quotes to handle commas in the data
      stringVal = stringVal.replace(/"/g, '""');
      return `"${stringVal}"`;
    });
    csvRows.push(values.join(','));
  }

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Trigger download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
