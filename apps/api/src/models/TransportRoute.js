const mongoose = require('mongoose');

const transportRouteSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School', required: true },
  routeName: { type: String, required: true },
  vehicleNumber: { type: String, required: true },
  driverName: { type: String },
  driverPhone: { type: String },
  
  stops: [{
    name: { type: String, required: true },
    pickupTime: { type: String, required: true }, // e.g., "07:15 AM"
    dropTime: { type: String, required: true }   // e.g., "03:45 PM"
  }],
  
  // Passenger manifest
  assignedStudents: [{
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stopId: { type: mongoose.Schema.Types.ObjectId }
  }]
}, { timestamps: true });

transportRouteSchema.index({ schoolId: 1 });

module.exports = mongoose.model('TransportRoute', transportRouteSchema);
