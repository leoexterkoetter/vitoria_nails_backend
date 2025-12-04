import Service from '../models/Service.js';

class ServiceController {
  // Listar todos os serviços ativos
  static async getAll(req, res) {
    try {
      const services = await Service.findAll();

      res.json({ services });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      res.status(500).json({
        error: 'Erro ao buscar serviços'
      });
    }
  }

  // Buscar serviço por ID
  static async getById(req, res) {
    try {
      const { id } = req.params;

      const service = await Service.findById(id);

      if (!service) {
        return res.status(404).json({
          error: 'Serviço não encontrado'
        });
      }

      res.json({ service });
    } catch (error) {
      console.error('Erro ao buscar serviço:', error);
      res.status(500).json({
        error: 'Erro ao buscar serviço'
      });
    }
  }

  // Buscar serviços por categoria
  static async getByCategory(req, res) {
    try {
      const { category } = req.params;

      const services = await Service.findByCategory(category);

      res.json({ services });
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      res.status(500).json({
        error: 'Erro ao buscar serviços por categoria'
      });
    }
  }
}

export default ServiceController;
