import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  timeSlot: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TimeSlot',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled', 'completed'],
    default: 'pending'
  },
  notes: String,
  admin_notes: String
}, {
  timestamps: true
});

appointmentSchema.index({ user: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

appointmentSchema.statics.countByStatus = async function() {
  return await this.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);
};

appointmentSchema.statics.getTotalRevenue = async function(startDate, endDate) {
  const appointments = await this.find({
    status: 'completed',
    createdAt: { $gte: startDate, $lte: endDate }
  }).populate('service');
  
  return appointments.reduce((sum, apt) => sum + (apt.service?.price || 0), 0);
};

appointmentSchema.statics.findAll = async function(status) {
  const query = status ? { status } : {};
  return await this.find(query)
    .populate('user', 'name email phone')
    .populate('service', 'name price duration')
    .populate('timeSlot', 'date start_time end_time')
    .sort({ createdAt: -1 });
};

appointmentSchema.statics.updateStatus = async function(id, status, admin_notes) {
  return await this.findByIdAndUpdate(
    id,
    { status, admin_notes },
    { new: true }
  );
};

appointmentSchema.statics.findByIdWithDetails = async function(id) {
  return await this.findById(id)
    .populate('user', 'name email phone')
    .populate('service', 'name price duration')
    .populate('timeSlot', 'date start_time end_time');
};

appointmentSchema.statics.findByMonth = async function(year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);
  
  return await this.find({
    createdAt: { $gte: startDate, $lte: endDate }
  })
    .populate('user', 'name')
    .populate('service', 'name')
    .populate('timeSlot', 'date start_time')
    .sort({ createdAt: -1 });
};

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;