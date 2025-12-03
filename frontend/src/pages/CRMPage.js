import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid2 as Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Chip,
  Avatar,
  Tabs,
  Tab,
  Fab,
  Paper,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
  useTheme
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Search,
  Person,
  Assignment,
  Notes,
  Phone,
  Email,
  Save,
  Cancel,
  Business,
  LocationOn,
  Event,
  CheckCircle,
  RadioButtonUnchecked,
  Star,
  StarBorder
} from '@mui/icons-material';
import axios from 'axios';

const CRMPage = () => {
  const theme = useTheme();
  const [currentTab, setCurrentTab] = useState(0);
  const [contacts, setContacts] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('contact'); // contact, task, note
  const [editingItem, setEditingItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Form states
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    notes: '',
    priority: 'medium'
  });

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    date: '',
    category: 'general'
  });

  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: []
  });

  // Configure axios
  axios.defaults.baseURL = 'http://localhost:3001';

  useEffect(() => {
    fetchCRMData();
  }, []);

  const fetchCRMData = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching CRM data...');
      
      const response = await axios.get('/api/context/gaston');
      const context = response.data;
      
      if (context) {
        setContacts(context.contacts || []);
        setTasks(context.agenda || []);
        setNotes(context.notes || []);
      }
      
      console.log('✅ CRM data loaded:', context);
    } catch (error) {
      console.error('❌ Error fetching CRM data:', error);
      showNotification('No se pudo cargar la información del CRM', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const updateContext = async (type, data, action = 'add') => {
    try {
      console.log(`🔄 ${action} ${type}:`, data);
      
      let endpoint = '';
      let payload = {};
      
      switch (type) {
        case 'contact':
          endpoint = '/api/crm/contacts';
          payload = { userId: 'gaston', contactData: data };
          break;
        case 'task':
          endpoint = '/api/crm/agenda';
          payload = { userId: 'gaston', taskData: data };
          break;
        case 'note':
          endpoint = '/api/crm/notes';
          payload = { userId: 'gaston', noteData: data };
          break;
      }
      
      let response;
      if (action === 'add') {
        response = await axios.post(endpoint, payload);
      } else if (action === 'update') {
        response = await axios.put(`${endpoint}/${data._id || data.id}`, payload);
      } else if (action === 'delete') {
        response = await axios.delete(`${endpoint}/${data._id || data.id}`, { data: { userId: 'gaston' } });
      }
      
      console.log('✅ Context updated:', response.data);
      await fetchCRMData(); // Refresh data
      showNotification(`${type === 'contact' ? 'Contacto' : type === 'task' ? 'Tarea' : 'Nota'} ${action === 'add' ? 'agregado' : action === 'update' ? 'actualizado' : 'eliminado'} correctamente!`);
      
    } catch (error) {
      console.error(`❌ Error ${action}ing ${type}:`, error);
      showNotification(`No se pudo ${action === 'add' ? 'agregar' : action === 'update' ? 'actualizar' : 'eliminar'} ${type === 'contact' ? 'el contacto' : type === 'task' ? 'la tarea' : 'la nota'}`, 'error');
    }
  };

  const handleSave = async () => {
    try {
      let data, type;
      
      switch (dialogType) {
        case 'contact':
          data = { ...contactForm, id: editingItem?.id || Date.now().toString() };
          type = 'contact';
          break;
        case 'task':
          data = { ...taskForm, id: editingItem?.id || Date.now().toString(), completed: editingItem?.completed || false };
          type = 'task';
          break;
        case 'note':
          data = { ...noteForm, id: editingItem?.id || Date.now().toString(), createdAt: editingItem?.createdAt || new Date().toISOString() };
          type = 'note';
          break;
      }
      
      const action = editingItem ? 'update' : 'add';
      await updateContext(type, data, action);
      
      handleCloseDialog();
    } catch (error) {
      console.error('❌ Error saving:', error);
      showNotification('No se pudo guardar', 'error');
    }
  };

  const handleDelete = async (item, type) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      await updateContext(type, item, 'delete');
    }
  };

  const handleEdit = (item, type) => {
    setEditingItem(item);
    setDialogType(type);
    
    switch (type) {
      case 'contact':
        setContactForm(item);
        break;
      case 'task':
        setTaskForm(item);
        break;
      case 'note':
        setNoteForm(item);
        break;
    }
    
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingItem(null);
    setContactForm({ name: '', email: '', phone: '', company: '', position: '', address: '', notes: '', priority: 'medium' });
    setTaskForm({ title: '', description: '', priority: 'medium', status: 'pending', date: '', category: 'general' });
    setNoteForm({ title: '', content: '', category: 'general', tags: [] });
  };

  const toggleTaskComplete = async (task) => {
    const updatedTask = { ...task, completed: !task.completed };
    await updateContext('task', updatedTask, 'update');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTasks = tasks.filter(task =>
    task.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotes = notes.filter(note =>
    note.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const renderContactCard = (contact, index) => (
    <Card key={contact.id || index} sx={{ mb: 2, '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ 
              bgcolor: theme.palette.mode === 'dark' ? 'primary.main' : 'primary.light',
              width: 56,
              height: 56
            }}>
              <Person />
            </Avatar>
            <Box>
              <Typography variant="h6" gutterBottom>
                {contact.name || 'Unknown Contact'}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {contact.position && contact.company ? `${contact.position} at ${contact.company}` : contact.company || contact.position || 'No company'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                {contact.email && (
                  <Chip icon={<Email />} label={contact.email} size="small" variant="outlined" />
                )}
                {contact.phone && (
                  <Chip icon={<Phone />} label={contact.phone} size="small" variant="outlined" />
                )}
                <Chip 
                  label={contact.priority || 'medium'} 
                  size="small" 
                  color={getPriorityColor(contact.priority)}
                />
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => handleEdit(contact, 'contact')} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(contact, 'contact')} size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
        {contact.notes && (
          <Typography variant="body2" sx={{ mt: 2, p: 1, bgcolor: 'action.hover', borderRadius: 1 }}>
            {contact.notes}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderTaskCard = (task, index) => (
    <Card key={task.id || index} sx={{ 
      mb: 2, 
      opacity: task.completed ? 0.7 : 1,
      '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' }
    }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flex: 1 }}>
            <IconButton onClick={() => toggleTaskComplete(task)} size="small">
              {task.completed ? <CheckCircle color="success" /> : <RadioButtonUnchecked />}
            </IconButton>
            <Box sx={{ flex: 1 }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ textDecoration: task.completed ? 'line-through' : 'none' }}
              >
                {task.title || 'Untitled Task'}
              </Typography>
              {task.description && (
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {task.description}
                </Typography>
              )}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                <Chip 
                  label={task.priority || 'medium'} 
                  size="small" 
                  color={getPriorityColor(task.priority)}
                />
                <Chip 
                  label={task.category || 'general'} 
                  size="small" 
                  variant="outlined"
                />
                {task.date && (
                  <Chip 
                    icon={<Event />} 
                    label={new Date(task.date).toLocaleDateString()} 
                    size="small" 
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => handleEdit(task, 'task')} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(task, 'task')} size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const renderNoteCard = (note, index) => (
    <Card key={note.id || index} sx={{ mb: 2, '&:hover': { transform: 'translateY(-2px)', transition: 'transform 0.2s' } }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" gutterBottom>
              {note.title || 'Untitled Note'}
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              {note.content?.length > 200 ? `${note.content.substring(0, 200)}...` : note.content}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip 
                label={note.category || 'general'} 
                size="small" 
                variant="outlined"
              />
              {note.createdAt && (
                <Typography variant="caption" color="text.secondary">
                  {new Date(note.createdAt).toLocaleDateString()}
                </Typography>
              )}
            </Box>
          </Box>
          <Box>
            <IconButton onClick={() => handleEdit(note, 'note')} size="small">
              <Edit />
            </IconButton>
            <IconButton onClick={() => handleDelete(note, 'note')} size="small" color="error">
              <Delete />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}
        >
          Panel de Contactos (CRM)
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Administra tus contactos, tareas y notas con Eva
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {contacts.length}
                  </Typography>
                  <Typography variant="h6">Contactos</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Person />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {tasks.length}
                  </Typography>
                  <Typography variant="h6">Tareas</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Assignment />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {notes.length}
                  </Typography>
                  <Typography variant="h6">Notas</Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <Notes />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search */}
      <TextField
        fullWidth
        placeholder="Buscar contactos, tareas o notas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={currentTab} 
          onChange={(e, newValue) => setCurrentTab(newValue)}
          variant="fullWidth"
        >
          <Tab label={`Contactos (${filteredContacts.length})`} icon={<Person />} />
          <Tab label={`Tareas (${filteredTasks.length})`} icon={<Assignment />} />
          <Tab label={`Notas (${filteredNotes.length})`} icon={<Notes />} />
        </Tabs>
      </Paper>

      {/* Content */}
      <Box sx={{ minHeight: '400px' }}>
        {currentTab === 0 && (
          <Box>
            {filteredContacts.length > 0 ? (
              filteredContacts.map(renderContactCard)
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Person sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron contactos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agrega tu primer contacto o prueba con otro término de búsqueda
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {currentTab === 1 && (
          <Box>
            {filteredTasks.length > 0 ? (
              filteredTasks.map(renderTaskCard)
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Assignment sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron tareas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agrega tu primera tarea o prueba con otro término de búsqueda
                </Typography>
              </Box>
            )}
          </Box>
        )}

        {currentTab === 2 && (
          <Box>
            {filteredNotes.length > 0 ? (
              filteredNotes.map(renderNoteCard)
            ) : (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Notes sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No se encontraron notas
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Agrega tu primera nota o prueba con otro término de búsqueda
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </Box>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
        onClick={() => {
          setDialogType(currentTab === 0 ? 'contact' : currentTab === 1 ? 'task' : 'note');
          setOpenDialog(true);
        }}
      >
        <Add />
      </Fab>

      {/* Dialog for Add/Edit */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingItem ? 'Editar' : 'Agregar'} {dialogType === 'contact' ? 'Contacto' : dialogType === 'task' ? 'Tarea' : 'Nota'}
        </DialogTitle>
        <DialogContent>
          {dialogType === 'contact' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Correo electrónico"
                  type="email"
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Teléfono"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Empresa"
                  value={contactForm.company}
                  onChange={(e) => setContactForm({ ...contactForm, company: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Puesto"
                  value={contactForm.position}
                  onChange={(e) => setContactForm({ ...contactForm, position: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={contactForm.priority}
                    onChange={(e) => setContactForm({ ...contactForm, priority: e.target.value })}
                    label="Prioridad"
                  >
                    <MenuItem value="low">Baja</MenuItem>
                    <MenuItem value="medium">Media</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Dirección"
                  value={contactForm.address}
                  onChange={(e) => setContactForm({ ...contactForm, address: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Notas"
                  multiline
                  rows={3}
                  value={contactForm.notes}
                  onChange={(e) => setContactForm({ ...contactForm, notes: e.target.value })}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'task' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Título"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Descripción"
                  multiline
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Prioridad</InputLabel>
                  <Select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    label="Prioridad"
                  >
                    <MenuItem value="low">Baja</MenuItem>
                    <MenuItem value="medium">Media</MenuItem>
                    <MenuItem value="high">Alta</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={taskForm.category}
                    onChange={(e) => setTaskForm({ ...taskForm, category: e.target.value })}
                    label="Categoría"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="work">Trabajo</MenuItem>
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="urgent">Urgente</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  fullWidth
                  label="Fecha límite"
                  type="date"
                  value={taskForm.date}
                  onChange={(e) => setTaskForm({ ...taskForm, date: e.target.value })}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          )}

          {dialogType === 'note' && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <TextField
                  fullWidth
                  label="Título"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <FormControl fullWidth>
                  <InputLabel>Categoría</InputLabel>
                  <Select
                    value={noteForm.category}
                    onChange={(e) => setNoteForm({ ...noteForm, category: e.target.value })}
                    label="Categoría"
                  >
                    <MenuItem value="general">General</MenuItem>
                    <MenuItem value="ideas">Ideas</MenuItem>
                    <MenuItem value="meeting">Reunión</MenuItem>
                    <MenuItem value="personal">Personal</MenuItem>
                    <MenuItem value="project">Proyecto</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  label="Contenido"
                  multiline
                  rows={6}
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                />
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} startIcon={<Cancel />}>
            Cancelar
          </Button>
          <Button onClick={handleSave} variant="contained" startIcon={<Save />}>
            {editingItem ? 'Actualizar' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification */}
      <Snackbar 
        open={notification.open} 
        autoHideDuration={4000} 
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CRMPage;