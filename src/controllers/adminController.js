import Appointment from '../models/Appointment.js';
import Service from '../models/Service.js';
import TimeSlot from '../models/TimeSlot.js';
import User from '../models/User.js';

class AdminController {
  // Dashboard - estatísticas gerais
  static async getDashboard(req, res) {
    try {
      // Buscar estatísticas
      const [
        totalClients,
        appointmentsByStatus,
        monthRevenue
      ] = await Promise.all([
        User.countClients(),
        Appointment.countByStatus(),
        Appointment.getTotalRevenue(
          new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          new Date()
        )
      ]);

      // Organizar contagens por status
      const totalAppointments = appointmentsByStatus.reduce((sum, item) => sum + item.count, 0);
      const pendingAppointments = appointmentsByStatus.find(item => item.status === 'pending')?.count || 0;

      res.json({
        totalAppointments,
        pendingAppointments,
        totalClients,
        monthRevenue: monthRevenue || 0 // CORRIGIDO: nome da propriedade e valor padrão
      });
    } catch (error) {
      console.error('Erro ao buscar dashboard:', error);
      res.status(500).json({
        error: 'Erro ao buscar estatísticas'
      });
    }
  }

  // Listar todos os agendamentos
  static async getAllAppointments(req, res) {
    try {
      const { status } = req.query;

      const appointments = await Appointment.findAll(status);

      res.json({ appointments });
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      res.status(500).json({
        error: 'Erro ao buscar agendamentos'
      });
    }
  }

  // Atualizar status do agendamento
  static async updateAppointmentStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      // Validar status
      const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          error: 'Status inválido'
        });
      }

      const appointment = await Appointment.updateStatus(id, status, admin_notes);

      if (!appointment) {
        return res.status(404).json({
          error: 'Agendamento não encontrado'
        });
      }

      // Buscar detalhes completos
      const appointmentDetails = await Appointment.findByIdWithDetails(id);

      res.json({
        message: 'Status atualizado com sucesso',
        appointment: appointmentDetails
      });
    } catch (error) {
      console.error('Erro ao atualizar agendamento:', error);
      res.status(500).json({
        error: 'Erro ao atualizar agendamento'
      });
    }
  }

  // Gerenciar Serviços
  static async createService(req, res) {
    try {
      const { name, description, price, duration, category, image_url } = req.body;

      if (!name || !price || !duration || !category) {
        return res.status(400).json({
          error: 'Nome, preço, duração e categoria são obrigatórios'
        });
      }

      const service = await Service.create({
        name,
        description,
        price,
        duration,
        category,
        image_url
      });

      res.status(201).json({
        message: 'Serviço criado com sucesso',
        service
      });
    } catch (error) {
      console.error('Erro ao criar serviço:', error);
      res.status(500).json({
        error: 'Erro ao criar serviço'
      });
    }
  }

  static async updateService(req, res) {
    try {
      const { id } = req.params;
      const { name, description, price, duration, category, image_url, active } = req.body;

      const service = await Service.update(id, {
        name,
        description,
        price,
        duration,
        category,
        image_url,
        active
      });

      if (!service) {
        return res.status(404).json({
          error: 'Serviço não encontrado'
        });
      }

      res.json({
        message: 'Serviço atualizado com sucesso',
        service
      });
    } catch (error) {
      console.error('Erro ao atualizar serviço:', error);
      res.status(500).json({
        error: 'Erro ao atualizar serviço'
      });
    }
  }

  static async deleteService(req, res) {
    try {
      const { id } = req.params;

      const service = await Service.delete(id);

      if (!service) {
        return res.status(404).json({
          error: 'Serviço não encontrado'
        });
      }

      res.json({
        message: 'Serviço deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar serviço:', error);
      res.status(500).json({
        error: 'Erro ao deletar serviço'
      });
    }
  }

  static async getAllServices(req, res) {
    try {
      const services = await Service.findAllAdmin();

      res.json({ services });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      res.status(500).json({
        error: 'Erro ao buscar serviços'
      });
    }
  }

  // Gerenciar Horários
  static async createTimeSlot(req, res) {
    try {
      const { date, start_time, end_time } = req.body;

      if (!date || !start_time || !end_time) {
        return res.status(400).json({
          error: 'Data, horário inicial e final são obrigatórios'
        });
      }

      // CORRIGIDO: Converter data corretamente
      const slot = await TimeSlot.create({ 
        date: new Date(date + 'T00:00:00'), 
        start_time, 
        end_time 
      });

      res.status(201).json({
        message: 'Horário criado com sucesso',
        slot
      });
    } catch (error) {
      console.error('Erro ao criar horário:', error);
      res.status(500).json({
        error: 'Erro ao criar horário'
      });
    }
  }

  static async createTimeSlotsBatch(req, res) {
    try {
      const { slots } = req.body;

      if (!Array.isArray(slots) || slots.length === 0) {
        return res.status(400).json({
          error: 'Lista de horários inválida'
        });
      }

      const createdSlots = await TimeSlot.createBatch(slots);

      res.status(201).json({
        message: `${createdSlots.length} horários criados com sucesso`,
        slots: createdSlots
      });
    } catch (error) {
      console.error('Erro ao criar horários em lote:', error);
      res.status(500).json({
        error: 'Erro ao criar horários'
      });
    }
  }

  static async deleteTimeSlot(req, res) {
    try {
      const { id } = req.params;

      const slot = await TimeSlot.delete(id);

      if (!slot) {
        return res.status(404).json({
          error: 'Horário não encontrado'
        });
      }

      res.json({
        message: 'Horário deletado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao deletar horário:', error);
      res.status(500).json({
        error: 'Erro ao deletar horário'
      });
    }
  }

  static async getAllTimeSlots(req, res) {
    try {
      const { startDate, endDate } = req.query;

      let slots;
      if (startDate && endDate) {
        slots = await TimeSlot.findAll(startDate, endDate);
      } else {
        slots = await TimeSlot.find().sort({ date: 1, start_time: 1 });
      }

      res.json({ slots });
    } catch (error) {
      console.error('Erro ao buscar horários:', error);
      res.status(500).json({
        error: 'Erro ao buscar horários'
      });
    }
  }

  // Listar clientes
  static async getAllClients(req, res) {
    try {
      const clients = await User.findAll();

      res.json({ clients });
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      res.status(500).json({
        error: 'Erro ao buscar clientes'
      });
    }
  }

  // Calendário mensal
  static async getMonthlyCalendar(req, res) {
    try {
      const { year, month } = req.query;

      const currentYear = year || new Date().getFullYear();
      const currentMonth = month || new Date().getMonth() + 1;

      const appointments = await Appointment.findByMonth(currentYear, currentMonth);

      res.json({ appointments });
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      res.status(500).json({
        error: 'Erro ao buscar calendário'
      });
    }
  }
}

export default AdminController;