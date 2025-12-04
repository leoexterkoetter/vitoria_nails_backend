import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
import Service from '../models/Service.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://mongo:JUrBECMtYHUYdAAWQaAwfdJwiVGjAiaF@metro.proxy.rlwy.net:41266';

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...\n');

    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conectado ao MongoDB\n');

    // Limpar dados existentes
    console.log('🧹 Limpando dados existentes...');
    await User.deleteMany({});
    await Service.deleteMany({});
    console.log('✅ Dados limpos\n');

    // Criar usuário admin
    console.log('👤 Criando usuário admin...');
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      name: 'Vitoria',
      email: 'vitoria@naildesigner.com',
      password: hashedPassword,
      role: 'admin'
    });
    await admin.save();
    console.log(`✅ Admin criado: ${admin.email}\n`);

    // Criar serviços
    console.log('💅 Criando serviços...');
    const services = [
      {
        name: 'Alongamento em Gel',
        description: 'Alongamento completo das unhas com gel de alta qualidade',
        price: 120.00,
        duration: 120,
        category: 'alongamento'
      },
      {
        name: 'Alongamento em Fibra',
        description: 'Alongamento natural e resistente com fibra de vidro',
        price: 150.00,
        duration: 150,
        category: 'alongamento'
      },
      {
        name: 'Manutenção Completa',
        description: 'Manutenção de alongamento + esmaltação',
        price: 80.00,
        duration: 90,
        category: 'manutencao'
      },
      {
        name: 'Esmaltação em Gel',
        description: 'Esmaltação profissional com gel que dura até 21 dias',
        price: 60.00,
        duration: 60,
        category: 'esmaltacao'
      },
      {
        name: 'Spa dos Pés',
        description: 'Tratamento completo: hidratação, esfoliação e esmaltação',
        price: 90.00,
        duration: 90,
        category: 'spa'
      },
      {
        name: 'Nail Art',
        description: 'Decoração artística personalizada nas unhas',
        price: 40.00,
        duration: 45,
        category: 'esmaltacao'
      },
      {
        name: 'Banho de Gel',
        description: 'Fortalecimento das unhas naturais',
        price: 50.00,
        duration: 45,
        category: 'manutencao'
      },
      {
        name: 'Unhas Decoradas',
        description: 'Decoração com pedras, adesivos e design exclusivo',
        price: 35.00,
        duration: 30,
        category: 'esmaltacao'
      }
    ];

    await Service.insertMany(services);
    console.log(`✅ ${services.length} serviços criados\n`);

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Seed concluído com sucesso!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('📋 CREDENCIAIS:');
    console.log('   Email: vitoria@naildesigner.com');
    console.log('   Senha: admin123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error);
    process.exit(1);
  }
};

seedDatabase();