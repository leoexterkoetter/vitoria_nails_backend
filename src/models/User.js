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
    unique: true
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

class UserClass {
  // Criar novo usuário
  static async createUser({ name, email, password, phone, role = 'user' }) {
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
      delete userObj.password; // remover senha do retorno
      return userObj;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      return await this.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por ID
  static async findByIdWithoutPassword(id) {
    try {
      return await this.findById(id).select('-password');
    } catch (error) {
      throw error;
    }
  }

  // Atualizar usuário
  static async updateUser(id, data) {
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
  }

  // Verificar senha
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Listar todos os usuários (admin)
  static async findAllUsers() {
    try {
      return await this.find({ role: 'user' }).select('-password').sort({ createdAt: -1 });
    } catch (error) {
      throw error;
    }
  }

  // Contar total de clientes
  static async countClients() {
    try {
      return await this.countDocuments({ role: 'user' });
    } catch (error) {
      throw error;
    }
  }
}

// Aplicar classe ao schema
userSchema.loadClass(UserClass);

const User = mongoose.model('User', userSchema);

export default User;
