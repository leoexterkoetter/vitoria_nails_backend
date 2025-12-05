import { verifyToken } from "../config/auth.js";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: "Token não fornecido" });
    }

    // Esperado: "Bearer TOKEN"
    const [scheme, token] = authHeader.split(" ");

    if (!scheme || !token) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    if (!/^Bearer$/i.test(scheme)) {
      return res.status(401).json({ error: "Token mal formatado" });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      console.error("Erro ao verificar token:", err.message);

      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ error: "Token expirado" });
      }
      if (err.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "Token inválido" });
      }

      return res.status(401).json({ error: "Falha ao validar token" });
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: "Token inválido ou incompleto" });
    }

    // Adiciona informações no request
    req.userId = decoded.userId;
    req.userRole = decoded.role || "client"; // fallback seguro

    next();
  } catch (error) {
    console.error("Erro inesperado na autenticação:", error);
    return res.status(500).json({ error: "Erro interno na autenticação" });
  }
};

export const adminMiddleware = (req, res, next) => {
  try {
    if (req.userRole !== "admin") {
      return res.status(403).json({
        error: "Acesso negado. Apenas administradores."
      });
    }

    next();
  } catch (error) {
    console.error("Erro na verificação de admin:", error);
    return res.status(403).json({ error: "Acesso negado" });
  }
};
