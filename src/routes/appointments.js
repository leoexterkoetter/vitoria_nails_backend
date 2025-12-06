import express from 'express';
import AppointmentController from '../controllers/appointmentController.js';
import { authMiddleware } from '../middleware/auth.js';
// ⭐ ADICIONE ESTES IMPORTS:
import Appointment from '../models/Appointment.js';
import TimeSlot from '../models/TimeSlot.js';

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

// Cancelar agendamento (PATCH)
router.patch('/:id/cancel', AppointmentController.cancel);

// ROTA PARA REMANEJAR AGENDAMENTO (ADMIN)
router.patch('/:id/reschedule', async (req, res) => {
  try {
    const { id } = req.params;
    const { newTimeSlotId } = req.body;

    // Verificar se é admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    // Buscar agendamento
    const appointment = await Appointment.findById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificar se novo horário existe e está disponível
    const newTimeSlot = await TimeSlot.findById(newTimeSlotId);
    if (!newTimeSlot) {
      return res.status(404).json({ error: 'Horário não encontrado' });
    }

    if (!newTimeSlot.available) {
      return res.status(400).json({ error: 'Horário não está disponível' });
    }

    // Liberar horário antigo
    const oldTimeSlot = await TimeSlot.findById(appointment.timeSlot);
    if (oldTimeSlot) {
      oldTimeSlot.available = true;
      await oldTimeSlot.save();
    }

    // Ocupar novo horário
    newTimeSlot.available = false;
    await newTimeSlot.save();

    // Atualizar agendamento
    appointment.timeSlot = newTimeSlotId;
    await appointment.save();

    // Buscar agendamento atualizado com populate
    const updatedAppointment = await Appointment.findById(id)
      .populate('user', 'name email')
      .populate('service', 'name price duration')
      .populate('timeSlot', 'date start_time end_time');

    res.json({
      message: 'Agendamento remanejado com sucesso',
      appointment: updatedAppointment
    });

  } catch (error) {
    console.error('Erro ao remanejar:', error);
    res.status(500).json({ error: 'Erro ao remanejar agendamento' });
  }
});

// DELETE - Excluir agendamento
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    
    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    // Verificar permissão: admin ou dono do agendamento
    if (req.user.role !== 'admin' && appointment.user.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Sem permissão para excluir este agendamento' });
    }

    // Liberar horário
    if (appointment.timeSlot) {
      await TimeSlot.findByIdAndUpdate(appointment.timeSlot, { available: true });
    }

    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Excluído com sucesso' });

  } catch (error) {
    console.error('Erro ao excluir:', error);
    res.status(500).json({ error: 'Erro ao excluir' });
  }
});

export default router;