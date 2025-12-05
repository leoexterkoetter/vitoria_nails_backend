import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
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
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

// Índices
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

// Hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const hash = await bcrypt.hash(this.password, SALT_ROUNDS);
    this.password = hash;
    next();
  } catch (err) {
    next(err);
  }
});

// Métodos estáticos
userSchema.statics.createUser = async function({ name, email, password, phone, role = 'user' }) {
  try {
    const user = new this({
      name,
      email,
      password,
      phone,
      role
    });
    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (error) {
    throw error;
  }
};

userSchema.statics.findByEmail = async function(email) {
  try {
    return await this.findOne({ email: email.toLowerCase().trim() });
  } catch (error) {
    throw error;
  }
};

userSchema.statics.findByIdWithoutPassword = async function(id) {
  try {
    return await this.findById(id).select('-password');
  } catch (error) {
    throw error;
  }
};

userSchema.statics.updateUser = async function(id, data) {
  try {
    const { name, email, phone, avatar_url } = data;
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

    const user = await this.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return user;
  } catch (error) {
    throw error;
  }
};

// CORRIGIDO: Método estático para verificar senha
userSchema.statics.verifyPassword = async function(plainPassword, hashedPassword) {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword);
  } catch (error) {
    console.error('Erro ao verificar senha:', error);
    return false;
  }
};

// CORRIGIDO: Adicionado método findAll que era chamado mas não existia
userSchema.statics.findAll = async function() {
  try {
    return await this.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
  } catch (error) {
    throw error;
  }
};

// Manter compatibilidade com nome antigo
userSchema.statics.findAllUsers = async function() {
  return this.findAll();
};

userSchema.statics.countClients = async function() {
  try {
    return await this.countDocuments({ role: 'user' });
  } catch (error) {
    throw error;
  }
};

const User = mongoose.model('User', userSchema);

export default User;