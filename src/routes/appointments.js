import express from 'express';
import AppointmentController from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Horários disponíveis
router.get('/available-slots', AppointmentController.getAvailableSlots);

// Agendamentos do usuário autenticado
router.get('/my-appointments', AppointmentController.getUserAppointments);

// Criar novo agendamento
router.post('/', AppointmentController.create);

// Buscar agendamento específico por ID
router.get('/:id', AppointmentController.getById);

// Cancelar agendamento
router.put('/:id/cancel', AppointmentController.cancel);

// Verificar meus agendamentos
router.get('/my-appointments', authMiddleware, AppointmentController.getUserAppointments);

// Cancelar agendamento
router.patch('/:id/cancel', authMiddleware, AppointmentController.cancel);

export default router;
