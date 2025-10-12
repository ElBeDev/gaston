const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  relationship: String,
  notes: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const AgendaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: Date,
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const ConversationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  role: { type: String, enum: ['user', 'assistant'], required: true },
  timestamp: { type: Date, default: Date.now },
  context: mongoose.Schema.Types.Mixed,
  threadId: String,
  runId: String
});

const ImportantNoteSchema = new mongoose.Schema({
  category: String,
  content: { type: String, required: true },
  tags: [String],
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const UserContextSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  personalInfo: {
    name: { type: String, default: "Gaston" },
    preferences: mongoose.Schema.Types.Mixed,
    timezone: { type: String, default: "UTC" },
    language: { type: String, default: "en" }
  },
  contacts: [ContactSchema],
  agenda: [AgendaSchema],
  conversationHistory: [ConversationSchema],
  importantNotes: [ImportantNoteSchema],
  activeThreadId: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

UserContextSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserContext', UserContextSchema);