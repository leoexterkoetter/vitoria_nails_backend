import express from 'express';
import ServiceController from '../controllers/serviceController.js';

const router = express.Router();

// Rotas públicas (não precisa autenticação para ver serviços)
router.get('/', ServiceController.getAll);
router.get('/:id', ServiceController.getById);
router.get('/category/:category', ServiceController.getByCategory);

export default router;
