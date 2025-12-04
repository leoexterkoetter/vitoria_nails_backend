export const errorHandler = (err, req, res, next) => {
  console.error('Erro capturado:', err);

  // Erro de validação do PostgreSQL
  if (err.code === '23505') {
    return res.status(400).json({
      error: 'Registro duplicado',
      detail: err.detail
    });
  }

  // Erro de chave estrangeira
  if (err.code === '23503') {
    return res.status(400).json({
      error: 'Referência inválida',
      detail: err.detail
    });
  }

  // Erro genérico
  res.status(500).json({
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

export const notFound = (req, res) => {
  res.status(404).json({
    error: 'Rota não encontrada'
  });
};
