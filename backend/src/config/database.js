const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Directorio para la base de datos
const DB_DIR = process.env.NODE_ENV === 'production' 
    ? '/var/lib/gaston-assistant'
    : path.join(__dirname, '../../data');

const DB_PATH = path.join(DB_DIR, 'gaston.db');

// Crear directorio si no existe
if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true });
}

// Inicializar base de datos
const db = new Database(DB_PATH);

// Habilitar WAL mode para mejor concurrencia
db.pragma('journal_mode = WAL');

// Crear tablas
db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        position TEXT,
        notes TEXT,
        tags TEXT,
        priority TEXT DEFAULT 'medium',
        source TEXT,
        lastContact TEXT,
        relationshipScore INTEGER DEFAULT 50,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        priority TEXT DEFAULT 'medium',
        dueDate TEXT,
        contactId INTEGER,
        projectId INTEGER,
        assignedTo TEXT,
        tags TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        completedAt TEXT,
        FOREIGN KEY (contactId) REFERENCES contacts(id)
    );

    CREATE TABLE IF NOT EXISTS projects (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'active',
        startDate TEXT,
        endDate TEXT,
        priority TEXT DEFAULT 'medium',
        tags TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS user_contexts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL UNIQUE,
        conversationHistory TEXT,
        preferences TEXT,
        metadata TEXT,
        lastActive TEXT DEFAULT CURRENT_TIMESTAMP,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT,
        type TEXT DEFAULT 'note',
        contactId INTEGER,
        projectId INTEGER,
        taskId INTEGER,
        tags TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (contactId) REFERENCES contacts(id),
        FOREIGN KEY (projectId) REFERENCES projects(id),
        FOREIGN KEY (taskId) REFERENCES tasks(id)
    );

    CREATE TABLE IF NOT EXISTS conversations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId TEXT NOT NULL,
        messages TEXT,
        metadata TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts(email);
    CREATE INDEX IF NOT EXISTS idx_contacts_phone ON contacts(phone);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_contactId ON tasks(contactId);
    CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
    CREATE INDEX IF NOT EXISTS idx_user_contexts_userId ON user_contexts(userId);
`);

console.log('✅ SQLite Database initialized:', DB_PATH);

module.exports = db;
