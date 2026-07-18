const TransportRoute = require('../models/TransportRoute');

const getRoutes = async (req, res) => {
  try {
    const routes = await TransportRoute.find({ schoolId: req.schoolId }).populate('assignedStudents.studentId', 'name classId sectionId rollNo');
    res.json(routes);
  } catch (error) {
    console.error('Error fetching routes:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const createRoute = async (req, res) => {
  try {
    const { routeName, vehicleNumber, driverName, driverPhone, stops } = req.body;
    const newRoute = new TransportRoute({
      schoolId: req.schoolId,
      routeName,
      vehicleNumber,
      driverName,
      driverPhone,
      stops: stops || []
    });
    await newRoute.save();
    res.status(201).json({ message: 'Route created successfully', route: newRoute });
  } catch (error) {
    console.error('Error creating route:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const assignStudentToRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId, stopId } = req.body;

    const route = await TransportRoute.findOne({ _id: id, schoolId: req.schoolId });
    if (!route) return res.status(404).json({ message: 'Route not found' });

    // Check if student is already assigned
    if (route.assignedStudents.some(s => s.studentId.toString() === studentId)) {
      return res.status(400).json({ message: 'Student is already assigned to this route' });
    }

    route.assignedStudents.push({ studentId, stopId });
    await route.save();

    res.json({ message: 'Student assigned to route successfully', route });
  } catch (error) {
    console.error('Error assigning student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const removeStudentFromRoute = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;

    const route = await TransportRoute.findOne({ _id: id, schoolId: req.schoolId });
    if (!route) return res.status(404).json({ message: 'Route not found' });

    route.assignedStudents = route.assignedStudents.filter(s => s.studentId.toString() !== studentId);
    await route.save();

    res.json({ message: 'Student removed from route', route });
  } catch (error) {
    console.error('Error removing student:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getRoutes, createRoute, assignStudentToRoute, removeStudentFromRoute };
