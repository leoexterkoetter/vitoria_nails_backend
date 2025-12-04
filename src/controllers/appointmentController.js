import Appointment from '../models/Appointment.js';
import TimeSlot from '../models/TimeSlot.js';
import Service from '../models/Service.js';

class AppointmentController {
  
  // Criar novo agendamento
  static async create(req, res) {
    try {
      const { serviceId, timeSlotId, notes } = req.body;
      const userId = req.userId;

      // Validação básica
      if (!serviceId || !timeSlotId) {
        return res.status(400).json({ error: 'Serviço e horário são obrigatórios' });
      }

      // Verificar serviço
      const service = await Service.findById(serviceId);
      if (!service || !service.active) {
        return res.status(404).json({ error: 'Serviço não encontrado ou inativo' });
      }

      // Verificar horário disponível
      const timeSlot = await TimeSlot.findById(timeSlotId);
      if (!timeSlot || !timeSlot.available) {
        return res.status(400).json({ error: 'Horário não disponível' });
      }

      // Criar agendamento
      const appointment = await Appointment.create({
        user: userId,
        service: serviceId,
        timeSlot: timeSlotId,
        notes,
        status: 'pending'
      });

      // Marcar horário como ocupado
      await TimeSlot.findByIdAndUpdate(timeSlotId, { available: false });

      // Buscar detalhes completos
      const appointmentDetails = await Appointment.findById(appointment._id)
        .populate('user', 'name email')
        .populate('service', 'name price duration')
        .populate('timeSlot', 'date start_time end_time');

      return res.status(201).json({
        message: 'Agendamento criado com sucesso! Aguardando confirmação.',
        appointment: appointmentDetails
      });

    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      return res.status(500).json({ error: 'Erro interno ao criar agendamento' });
    }
  }

  // Listar agendamentos do usuário
  static async getUserAppointments(req, res) {
    try {
      const appointments = await Appointment.find({ user: req.userId })
        .populate('service', 'name price duration')
        .populate('timeSlot', 'date start_time end_time')
        .sort({ createdAt: -1 });

      return res.json({ appointments });

    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      return res.status(500).json({ error: 'Erro ao buscar agendamentos' });
    }
  }

  // Buscar agendamento específico
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id)
        .populate('user', 'name email phone')
        .populate('service', 'name price duration')
        .populate('timeSlot', 'date start_time end_time');

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Verificar permissão se não for admin
      if (req.userRole !== 'admin' && appointment.user._id.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      return res.json({ appointment });

    } catch (error) {
      console.error('Erro ao buscar agendamento:', error);
      return res.status(500).json({ error: 'Erro ao buscar agendamento' });
    }
  }

  // Cancelar agendamento
  static async cancel(req, res) {
    try {
      const { id } = req.params;

      const appointment = await Appointment.findById(id);

      if (!appointment) {
        return res.status(404).json({ error: 'Agendamento não encontrado' });
      }

      // Verificar permissão
      if (req.userRole !== 'admin' && appointment.user.toString() !== req.userId.toString()) {
        return res.status(403).json({ error: 'Acesso negado' });
      }

      // Verificar se pode cancelar
      if (appointment.status === 'completed' || appointment.status === 'cancelled') {
        return res.status(400).json({ error: 'Este agendamento não pode ser cancelado' });
      }

      // Atualizar status
      appointment.status = 'cancelled';
      await appointment.save();

      // Liberar horário
      await TimeSlot.findByIdAndUpdate(appointment.timeSlot, { available: true });

      return res.json({
        message: 'Agendamento cancelado com sucesso',
        appointment
      });

    } catch (error) {
      console.error('Erro ao cancelar agendamento:', error);
      return res.status(500).json({ error: 'Erro ao cancelar agendamento' });
    }
  }

  // Buscar horários disponíveis
  static async getAvailableSlots(req, res) {
    try {
      const { date, serviceId } = req.query;

      if (!date) {
        return res.status(400).json({ error: 'Data é obrigatória' });
      }

      const slots = await TimeSlot.findAvailableByDate(date, serviceId);

      return res.json(slots);

    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      return res.status(500).json({ error: 'Erro ao buscar horários disponíveis' });
    }
  }
}

export default AppointmentController;