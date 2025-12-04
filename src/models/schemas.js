// ============================================
// VITORIA NAIL DESIGNER - MongoDB Schemas
// ============================================

import mongoose from 'mongoose';

// Schema de Usuário
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  avatar_url: String
}, {
  timestamps: true
});

// Schema de Serviço
const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  image_url: String,
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['alongamento', 'manutencao', 'esmaltacao', 'spa'],
    required: true
  }
}, {
  timestamps: true
});

// Schema de Horário Disponível
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

// Índice único para evitar duplicatas de data/hora
timeSlotSchema.index({ date: 1, start_time: 1 }, { unique: true });

// Schema de Agendamento
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

// Índices para melhor performance
appointmentSchema.index({ user: 1, createdAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ createdAt: -1 });

// Schema de Notificação
const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Criar Models
const User = mongoose.model('User', userSchema);
const Service = mongoose.model('Service', serviceSchema);
const TimeSlot = mongoose.model('TimeSlot', timeSlotSchema);
const Appointment = mongoose.model('Appointment', appointmentSchema);
const Notification = mongoose.model('Notification', notificationSchema);

export { User, Service, TimeSlot, Appointment, Notification };
