import express from 'express';
import AdminController from '../controllers/adminController.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Todas as rotas requerem autenticação de admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Dashboard
router.get('/dashboard', AdminController.getDashboard);

// Gerenciar Agendamentos
router.get('/appointments', AdminController.getAllAppointments);
router.patch('/appointments/:id/status', AdminController.updateAppointmentStatus);

// Gerenciar Serviços
router.get('/services', AdminController.getAllServices);
router.post('/services', AdminController.createService);
router.put('/services/:id', AdminController.updateService);
router.delete('/services/:id', AdminController.deleteService);

// Gerenciar Horários
router.get('/time-slots', AdminController.getAllTimeSlots);
router.post('/time-slots', AdminController.createTimeSlot);
router.post('/time-slots/batch', AdminController.createTimeSlotsBatch);
router.delete('/time-slots/:id', AdminController.deleteTimeSlot);

// Clientes
router.get('/clients', AdminController.getAllClients);

// Calendário
router.get('/calendar', AdminController.getMonthlyCalendar);

export default router;
