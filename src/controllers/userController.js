import User from '../models/User.js';
import bcrypt from 'bcryptjs';

class UserController {
  static async getProfile(req, res) {
    try {
      const user = await User.findById(req.userId).select('-password');
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      res.json({ user });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  }

  static async updateProfile(req, res) {
    try {
      const { name, phone, currentPassword, newPassword } = req.body;
      
      const user = await User.findById(req.userId);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      if (name) user.name = name;
      if (phone !== undefined) user.phone = phone;

      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Senha atual é obrigatória' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password);
        if (!validPassword) {
          return res.status(401).json({ error: 'Senha atual incorreta' });
        }

        user.password = await bcrypt.hash(newPassword, 10);
      }

      await user.save();

      const updatedUser = await User.findById(req.userId).select('-password');

      res.json({
        message: 'Perfil atualizado com sucesso',
        user: updatedUser
      });
    } catch (error) {
      console.error('Erro:', error);
      res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
  }
}

export default UserController;