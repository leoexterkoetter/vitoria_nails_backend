import mongoose from 'mongoose';

const timeSlotSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  start_time: {
    type: String,
    required: true
  },
  end_time: {
    type: String,
    required: true
  },
  available: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

timeSlotSchema.index({ date: 1, start_time: 1 }, { unique: true });

timeSlotSchema.statics.create = async function(data) {
  const slot = new this(data);
  return await slot.save();
};

timeSlotSchema.statics.createBatch = async function(slots) {
  try {
    return await this.insertMany(slots, { ordered: false });
  } catch (error) {
    console.error('Erro no batch:', error);
    throw error;
  }
};
timeSlotSchema.statics.delete = async function(id) {
  return await this.findByIdAndDelete(id);
};

timeSlotSchema.statics.findAll = async function(startDate, endDate) {
  const query = {};
  
  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return await this.find(query).sort({ date: 1, start_time: 1 });
};

timeSlotSchema.statics.findAvailableByDate = async function(date, serviceId) {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  return await this.find({
    date: {
      $gte: startOfDay,
      $lte: endOfDay
    },
    available: true
  }).sort({ start_time: 1 });
};

const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);

export default TimeSlot;