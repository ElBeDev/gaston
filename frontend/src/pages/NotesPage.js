
import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, List, ListItem, ListItemText, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { Delete, Edit, NoteAdd } from '@mui/icons-material';

const NotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add'); // 'add' or 'edit'
  const [noteContent, setNoteContent] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/crm/notes');
      if (!res.ok) throw new Error('Error al obtener notas');
      const data = await res.json();
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setDialogMode('add');
    setNoteContent('');
    setSelectedNote(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (note) => {
    setDialogMode('edit');
    setNoteContent(note.content);
    setSelectedNote(note);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setNoteContent('');
    setSelectedNote(null);
  };

  const handleSaveNote = async () => {
    setSaving(true);
    setError(null);
    try {
      if (dialogMode === 'add') {
        const res = await fetch('/api/crm/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: noteContent })
        });
        if (!res.ok) throw new Error('Error al crear nota');
      } else if (dialogMode === 'edit' && selectedNote) {
        const res = await fetch(`/api/crm/notes/${selectedNote._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: noteContent })
        });
        if (!res.ok) throw new Error('Error al editar nota');
      }
      await fetchNotes();
      handleCloseDialog();
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteNote = async (note) => {
    if (!window.confirm('¿Eliminar esta nota?')) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/crm/notes/${note._id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar nota');
      await fetchNotes();
    } catch (err) {
      setError(err.message || 'Error desconocido');
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter(note =>
    note.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>Notas</Typography>
      <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
        <TextField
          label="Buscar nota"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          size="small"
        />
        <Button variant="contained" startIcon={<NoteAdd />} onClick={handleOpenAdd} disabled={saving}>
          Nueva nota
        </Button>
      </Box>
      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <List>
          {filteredNotes.length === 0 && (
            <ListItem>
              <ListItemText primary="No hay notas" />
            </ListItem>
          )}
          {filteredNotes.map(note => (
            <ListItem key={note._id} alignItems="flex-start" secondaryAction={
              <>
                <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEdit(note)} disabled={saving}>
                  <Edit />
                </IconButton>
                <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteNote(note)} disabled={saving}>
                  <Delete />
                </IconButton>
              </>
            }>
              <ListItemText
                primary={note.content}
                secondary={note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
              />
            </ListItem>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <DialogTitle>{dialogMode === 'add' ? 'Nueva nota' : 'Editar nota'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nota"
            type="text"
            fullWidth
            multiline
            minRows={2}
            value={noteContent}
            onChange={e => setNoteContent(e.target.value)}
            disabled={saving}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={saving}>Cancelar</Button>
          <Button onClick={handleSaveNote} variant="contained" disabled={saving || !noteContent.trim()}>
            {dialogMode === 'add' ? 'Agregar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotesPage;
