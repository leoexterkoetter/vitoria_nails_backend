import User from '../models/User.js';
import { generateToken } from '../config/auth.js';

class AuthController {
  // Registro de novo usuário
  static async register(req, res) {
    try {
      const { name, email, password, phone } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'Email já cadastrado' });
      }

      // Criar usuário (hash automático no model)
      const user = await User.createUser({ name, email, password, phone });

      // Gerar token
      const token = generateToken(user._id, user.role);

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso',
        user,
        token
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ error: 'Erro ao cadastrar usuário' });
    }
  }

  // Login
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
      }

      const user = await User.findByEmail(email);
      if (!user) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const validPassword = await User.verifyPassword(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Email ou senha inválidos' });
      }

      const token = generateToken(user._id, user.role || 'user');

      // Retorna sem senha
      const { password: _, ...userWithoutPassword } = user.toObject();

      res.json({
        message: 'Login realizado com sucesso',
        user: userWithoutPassword,
        token
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ error: 'Erro ao fazer login' });
    }
  }

  // Obter dados do usuário autenticado
  static async me(req, res) {
    try {
      const user = await User.findByIdWithoutPassword(req.userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ error: 'Erro ao buscar dados do usuário' });
    }
  }
}

export default AuthController;
