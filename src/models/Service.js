import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  duration: {
    type: Number,
    required: true,
    min: 0
  },
  image_url: String,
  active: {
    type: Boolean,
    default: true
  },
  category: {
    type: String,
    enum: ['alongamento', 'manutencao', 'esmaltacao', 'spa'],
    required: true
  }
}, {
  timestamps: true
});

// Índices
serviceSchema.index({ active: 1 });
serviceSchema.index({ category: 1 });

// Métodos estáticos
serviceSchema.statics.create = async function(data) {
  const service = await this.insertMany([data]);
  return service[0].toObject();
};

serviceSchema.statics.findAll = async function() {
  return await this.find({ active: true })
    .sort({ category: 1, name: 1 })
    .lean();
};

serviceSchema.statics.findAllAdmin = async function() {
  return await this.find()
    .sort({ createdAt: -1 })
    .lean();
};

serviceSchema.statics.findById = async function(id) {
  return await this.findOne({ _id: id }).lean();
};

serviceSchema.statics.update = async function(id, data) {
  const { name, description, price, duration, category, image_url, active } = data;
  const updateData = {};

  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (price !== undefined) updateData.price = price;
  if (duration !== undefined) updateData.duration = duration;
  if (category !== undefined) updateData.category = category;
  if (image_url !== undefined) updateData.image_url = image_url;
  if (active !== undefined) updateData.active = active;

  return await this.findByIdAndUpdate(id, updateData, { 
    new: true, 
    runValidators: true 
  }).lean();
};

serviceSchema.statics.delete = async function(id) {
  return await this.findByIdAndDelete(id).lean();
};

serviceSchema.statics.findByCategory = async function(category) {
  return await this.find({ category, active: true })
    .sort({ name: 1 })
    .lean();
};

const Service = mongoose.model('Service', serviceSchema);

export default Service;