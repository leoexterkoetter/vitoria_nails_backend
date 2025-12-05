import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

export const JWT_SECRET = process.env.JWT_SECRET || 'vitoria-nail-designer-secret-key-2024';
export const JWT_EXPIRES_IN = '7d';

// Gera token
export const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Agora deixa o erro subir corretamente para ser tratado no middleware
export const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};
