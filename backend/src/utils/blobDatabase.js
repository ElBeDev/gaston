/**
 * Blob Storage Database Adapter
 * Reemplaza MongoDB completamente con Vercel Blob Storage
 * Todas las operaciones de datos ahora usan Blob
 */

const { put, del, list, head } = require('@vercel/blob');

class BlobDatabase {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production' || !!process.env.BLOB_READ_WRITE_TOKEN;
  }

  /**
   * Genera un ID único
   */
  generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Construye la ruta del blob
   */
  getBlobPath(collection, id = null) {
    if (id) {
      return `database/${collection}/${id}.json`;
    }
    return `database/${collection}/`;
  }

  /**
   * CREATE - Guardar un documento
   */
  async create(collection, data) {
    try {
      const id = data._id || this.generateId();
      const document = {
        ...data,
        _id: id,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const blobPath = this.getBlobPath(collection, id);
      
      if (this.isProduction) {
        await put(blobPath, JSON.stringify(document), {
          access: 'public',
          addRandomSuffix: false
        });
      } else {
        // Desarrollo local: guardar en archivo
        const fs = require('fs').promises;
        const path = require('path');
        const dir = path.join(__dirname, '../blob-local', collection);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(document, null, 2));
      }

      console.log(`✅ Documento creado en ${collection}:`, id);
      return document;
    } catch (error) {
      console.error(`❌ Error creando documento en ${collection}:`, error);
      throw error;
    }
  }

  /**
   * READ - Obtener un documento por ID
   */
  async findById(collection, id) {
    try {
      const blobPath = this.getBlobPath(collection, id);

      if (this.isProduction) {
        const response = await fetch(`https://blob.vercel-storage.com/${blobPath}`);
        if (!response.ok) return null;
        return await response.json();
      } else {
        // Desarrollo local
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = path.join(__dirname, '../blob-local', collection, `${id}.json`);
        try {
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        } catch {
          return null;
        }
      }
    } catch (error) {
      console.error(`❌ Error leyendo documento ${id} de ${collection}:`, error);
      return null;
    }
  }

  /**
   * READ - Obtener todos los documentos de una colección
   */
  async find(collection, filter = {}) {
    try {
      const blobPath = this.getBlobPath(collection);
      let documents = [];

      if (this.isProduction) {
        const { blobs } = await list({ prefix: blobPath });
        
        // Obtener todos los documentos en paralelo
        const fetchPromises = blobs.map(async (blob) => {
          const response = await fetch(blob.url);
          return response.json();
        });
        
        documents = await Promise.all(fetchPromises);
      } else {
        // Desarrollo local
        const fs = require('fs').promises;
        const path = require('path');
        const dir = path.join(__dirname, '../blob-local', collection);
        
        try {
          await fs.mkdir(dir, { recursive: true });
          const files = await fs.readdir(dir);
          
          const readPromises = files
            .filter(f => f.endsWith('.json'))
            .map(async (file) => {
              const data = await fs.readFile(path.join(dir, file), 'utf-8');
              return JSON.parse(data);
            });
          
          documents = await Promise.all(readPromises);
        } catch {
          documents = [];
        }
      }

      // Aplicar filtros simples
      if (Object.keys(filter).length > 0) {
        documents = documents.filter(doc => {
          return Object.entries(filter).every(([key, value]) => {
            if (typeof value === 'object' && value.$ne !== undefined) {
              return doc[key] !== value.$ne;
            }
            return doc[key] === value;
          });
        });
      }

      return documents;
    } catch (error) {
      console.error(`❌ Error listando documentos de ${collection}:`, error);
      return [];
    }
  }

  /**
   * UPDATE - Actualizar un documento
   */
  async findByIdAndUpdate(collection, id, update, options = {}) {
    try {
      const existing = await this.findById(collection, id);
      if (!existing && !options.upsert) {
        return null;
      }

      const document = {
        ...(existing || {}),
        ...update,
        _id: id,
        updatedAt: new Date().toISOString()
      };

      if (!existing) {
        document.createdAt = new Date().toISOString();
      }

      const blobPath = this.getBlobPath(collection, id);

      if (this.isProduction) {
        await put(blobPath, JSON.stringify(document), {
          access: 'public',
          addRandomSuffix: false
        });
      } else {
        // Desarrollo local
        const fs = require('fs').promises;
        const path = require('path');
        const dir = path.join(__dirname, '../blob-local', collection);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, `${id}.json`), JSON.stringify(document, null, 2));
      }

      console.log(`✅ Documento actualizado en ${collection}:`, id);
      return options.new !== false ? document : existing;
    } catch (error) {
      console.error(`❌ Error actualizando documento ${id} en ${collection}:`, error);
      throw error;
    }
  }

  /**
   * DELETE - Eliminar un documento
   */
  async findByIdAndDelete(collection, id) {
    try {
      const existing = await this.findById(collection, id);
      if (!existing) return null;

      const blobPath = this.getBlobPath(collection, id);

      if (this.isProduction) {
        await del(blobPath);
      } else {
        // Desarrollo local
        const fs = require('fs').promises;
        const path = require('path');
        const filePath = path.join(__dirname, '../blob-local', collection, `${id}.json`);
        await fs.unlink(filePath);
      }

      console.log(`✅ Documento eliminado de ${collection}:`, id);
      return existing;
    } catch (error) {
      console.error(`❌ Error eliminando documento ${id} de ${collection}:`, error);
      throw error;
    }
  }

  /**
   * COUNT - Contar documentos
   */
  async countDocuments(collection, filter = {}) {
    const documents = await this.find(collection, filter);
    return documents.length;
  }

  /**
   * AGGREGATE - Operaciones de agregación básicas
   */
  async aggregate(collection, pipeline) {
    // Implementación básica - puede expandirse según necesidad
    let documents = await this.find(collection);
    
    for (const stage of pipeline) {
      if (stage.$match) {
        documents = documents.filter(doc => {
          return Object.entries(stage.$match).every(([key, value]) => doc[key] === value);
        });
      }
      
      if (stage.$group) {
        const groups = {};
        documents.forEach(doc => {
          const groupKey = doc[stage.$group._id] || 'null';
          if (!groups[groupKey]) {
            groups[groupKey] = { _id: groupKey, count: 0 };
          }
          groups[groupKey].count++;
        });
        documents = Object.values(groups);
      }
      
      if (stage.$sort) {
        const [sortField, sortOrder] = Object.entries(stage.$sort)[0];
        documents.sort((a, b) => {
          if (sortOrder === 1) return a[sortField] > b[sortField] ? 1 : -1;
          return a[sortField] < b[sortField] ? 1 : -1;
        });
      }
      
      if (stage.$limit) {
        documents = documents.slice(0, stage.$limit);
      }
    }
    
    return documents;
  }
}

// Singleton instance
const blobDB = new BlobDatabase();

module.exports = blobDB;
