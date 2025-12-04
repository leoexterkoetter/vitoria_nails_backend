import { verifyToken } from '../config/auth.js';

export const authMiddleware = (req, res, next) => {
  try {
    // Pegar token do header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        error: 'Token não fornecido'
      });
    }

    // Formato: Bearer TOKEN
    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({
        error: 'Token mal formatado'
      });
    }

    const [scheme, token] = parts;

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({
        error: 'Token mal formatado'
      });
    }

    // Verificar token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        error: 'Token inválido ou expirado'
      });
    }

    // Adicionar userId e userRole ao request
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({
      error: 'Falha na autenticação'
    });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({
        error: 'Acesso negado. Apenas administradores.'
      });
    }

    next();
  } catch (error) {
    console.error('Erro na verificação de admin:', error);
    return res.status(403).json({
      error: 'Acesso negado'
    });
  }
};
