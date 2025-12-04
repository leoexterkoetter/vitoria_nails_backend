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

class UserClass {
  // Criar novo usuário
  static async create({ name, email, password, phone, role = 'user' }) {
    try {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      
      const user = await this.model('User').create({
        name,
        email,
        password: hashedPassword,
        phone,
        role
      });

      // Retornar sem a senha
      const userObj = user.toObject();
      delete userObj.password;
      return userObj;
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por email
  static async findByEmail(email) {
    try {
      return await this.model('User').findOne({ email }).lean();
    } catch (error) {
      throw error;
    }
  }

  // Buscar usuário por ID
  static async findById(id) {
    try {
      return await this.model('User')
        .findById(id)
        .select('-password')
        .lean();
    } catch (error) {
      throw error;
    }
  }

  // Listar todos os usuários (admin)
  static async findAll() {
    try {
      return await this.model('User')
        .find({ role: 'user' })
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();
    } catch (error) {
      throw error;
    }
  }

  // Atualizar usuário
  static async update(id, data) {
    try {
      const { name, email, phone, avatar_url } = data;
      const updateData = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      if (avatar_url !== undefined) updateData.avatar_url = avatar_url;

      const user = await this.model('User')
        .findByIdAndUpdate(
          id,
          updateData,
          { new: true, runValidators: true }
        )
        .select('-password')
        .lean();

      return user;
    } catch (error) {
      throw error;
    }
  }

  // Verificar senha
  static async verifyPassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  // Contar total de clientes
  static async countClients() {
    try {
      return await this.model('User').countDocuments({ role: 'user' });
    } catch (error) {
      throw error;
    }
  }
}

// Aplicar a classe ao schema
userSchema.loadClass(UserClass);

const User = mongoose.model('User', userSchema);

export default User;