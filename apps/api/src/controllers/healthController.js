const os = require('os');
const mongoose = require('mongoose');

const getSystemHealth = async (req, res) => {
  try {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memUsagePercent = ((usedMem / totalMem) * 100).toFixed(2);
    
    const cpus = os.cpus();
    const loadAvg = os.loadavg();
    // Use 1 min load avg normalized by cpu count for a percentage
    const cpuUsagePercent = Math.min(((loadAvg[0] / cpus.length) * 100), 100).toFixed(2);

    const dbState = mongoose.connection.readyState;
    let dbStatus = 'Disconnected';
    if (dbState === 1) dbStatus = 'Connected';
    else if (dbState === 2) dbStatus = 'Connecting';

    res.json({
      status: 'ok',
      metrics: {
        memory: `${memUsagePercent}%`,
        cpu: `${cpuUsagePercent}%`,
        uptime: `${(os.uptime() / 3600).toFixed(1)} hrs`,
        database: dbStatus
      }
    });
  } catch (error) {
    console.error('Error fetching health:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getSystemHealth };
