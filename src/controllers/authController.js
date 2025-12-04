import User from '../models/User.js';
import { generateToken } from '../config/auth.js';
import bcrypt from 'bcryptjs';

class AuthController {
  // Registro de novo usuário
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      // Validar campos obrigatórios
      if (!name || !email || !password) {
        return res.status(400).json({
          error: 'Nome, email e senha são obrigatórios'
        });
      }

      // Verificar se email já existe
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          error: 'Email já cadastrado'
        });
      }

      // Hash da senha
      const hashedPassword = await bcrypt.hash(password, 10);

      // Criar usuário direto
      const user = new User({ 
        name, 
        email, 
        password: hashedPassword, 
        phone 
      });
      await user.save();

      // Gerar token
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({
        error: 'Erro ao cadastrar usuário'
      });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validar campos
      if (!email || !password) {
        return res.status(400).json({
          error: 'Email e senha são obrigatórios'
        });
      }

      // Buscar usuário
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          error: 'Email ou senha inválidos'
        });
      }

      // Verificar senha
      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({
          error: 'Email ou senha inválidos'
        });
      }

      // Gerar token
      const token = generateToken(user._id, user.role);

      res.json({
        message: 'Login realizado com sucesso',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role
        },
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        error: 'Erro ao fazer login'
      });
    }
  }

  // Obter dados do usuário autenticado
  static async me(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password');

      if (!user) {
        return res.status(404).json({
          error: 'Usuário não encontrado'
        });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({
        error: 'Erro ao buscar dados do usuário'
      });
    }
  }
}

export default AuthController;