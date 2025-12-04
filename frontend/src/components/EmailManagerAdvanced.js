import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Badge,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Inbox,
  Send,
  Drafts,
  Report,
  Star,
  StarBorder,
  Delete,
  Reply,
  Forward,
  Add,
  Refresh,
  Search,
  AttachFile,
  Close
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const EmailManager = () => {
  const { isAuthenticated } = useAuth();
  const [selectedTab, setSelectedTab] = useState(0);
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [emailViewOpen, setEmailViewOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  
  const [composeData, setComposeData] = useState({
    to: '',
    subject: '',
    body: ''
  });

  const tabs = [
    { label: 'Inbox', icon: <Inbox />, folder: 'INBOX', color: 'primary' },
    { label: 'Sent', icon: <Send />, folder: 'SENT', color: 'success' },
    { label: 'Drafts', icon: <Drafts />, folder: 'DRAFT', color: 'warning' },
    { label: 'Spam', icon: <Report />, folder: 'SPAM', color: 'error' }
  ];

  // Fetch emails for selected folder
  const fetchEmails = async (folder = 'INBOX') => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(getApiUrl(`/api/email/messages?folder=${folder}`), {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setEmails(data.messages || []);
    } catch (error) {
      console.error('Error fetching emails:', error);
      setError(`Error loading emails: ${error.message}`);
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  // Send email
  const sendEmail = async () => {
    if (!composeData.to || !composeData.subject) {
      setError('Please fill in recipient and subject');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(getApiUrl(`/api/email/send`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          to: composeData.to,
          subject: composeData.subject,
          body: composeData.body,
          message: composeData.body  // Para compatibilidad con backend
        })
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Clear form and close dialog
      setComposeData({ to: '', subject: '', body: '' });
      setComposeOpen(false);
      
      // Refresh inbox if we're on sent folder
      if (selectedTab === 1) {
        fetchEmails('SENT');
      }
    } catch (error) {
      console.error('Error sending email:', error);
      setError(`Error sending email: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
    fetchEmails(tabs[newValue].folder);
  };

  // Open email viewer
  const openEmailViewer = (email) => {
    setSelectedEmail(email);
    setEmailViewOpen(true);
  };

  // Format email date
  const formatEmailDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Get sender name or email
  const getSenderInfo = (email) => {
    if (email.from) {
      const match = email.from.match(/^(.+?)\s*<(.+?)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
      }
      return { name: email.from, email: email.from };
    }
    return { name: 'Unknown', email: 'unknown@example.com' };
  };

  // Initial load
  useEffect(() => {
    if (isAuthenticated) {
      fetchEmails('INBOX');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Please sign in with Google to access your emails
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top AppBar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📧 Email Manager
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TextField
              size="small"
              placeholder="Search emails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ width: 250 }}
            />
            <IconButton onClick={() => fetchEmails(tabs[selectedTab].folder)}>
              <Refresh />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={selectedTab} onChange={handleTabChange}>
          {tabs.map((tab, index) => (
            <Tab
              key={index}
              icon={
                <Badge badgeContent={index === 0 ? emails.length : undefined} color="primary">
                  {tab.icon}
                </Badge>
              }
              label={tab.label}
              iconPosition="start"
            />
          ))}
        </Tabs>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ m: 2 }}>
          {error}
        </Alert>
      )}

      {/* Email List */}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <List>
            {emails.length === 0 ? (
              <ListItem>
                <ListItemText 
                  primary="No emails found"
                  secondary={`Your ${tabs[selectedTab].label.toLowerCase()} is empty`}
                />
              </ListItem>
            ) : (
              emails.map((email, index) => {
                const senderInfo = getSenderInfo(email);
                return (
                  <React.Fragment key={email.id || index}>
                    <ListItemButton onClick={() => openEmailViewer(email)}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 40, height: 40, fontSize: 14 }}>
                          {senderInfo.name.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={`${senderInfo.name} • ${formatEmailDate(email.date)}`}
                        secondary={`${email.subject} - ${email.snippet}`}
                        primaryTypographyProps={{
                          style: { 
                            fontWeight: email.unread ? 'bold' : 'normal',
                            fontSize: '0.95rem'
                          }
                        }}
                        secondaryTypographyProps={{
                          style: { 
                            fontWeight: email.unread ? 'bold' : 'normal',
                            fontSize: '0.85rem',
                            color: '#666'
                          }
                        }}
                      />
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <IconButton size="small">
                          {email.starred ? <Star color="warning" /> : <StarBorder />}
                        </IconButton>
                        {email.unread && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                      </Box>
                    </ListItemButton>
                    {index < emails.length - 1 && <Divider />}
                  </React.Fragment>
                );
              })
            )}
          </List>
        )}
      </Box>

      {/* Compose FAB */}
      <Fab
        color="primary"
        aria-label="compose"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => setComposeOpen(true)}
      >
        <Add />
      </Fab>

      {/* Compose Dialog */}
      <Dialog open={composeOpen} onClose={() => setComposeOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            ✉️ Compose Email
            <IconButton onClick={() => setComposeOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="To"
              fullWidth
              value={composeData.to}
              onChange={(e) => setComposeData({ ...composeData, to: e.target.value })}
              placeholder="recipient@example.com"
            />
            <TextField
              label="Subject"
              fullWidth
              value={composeData.subject}
              onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
            />
            <TextField
              label="Message"
              multiline
              rows={8}
              fullWidth
              value={composeData.body}
              onChange={(e) => setComposeData({ ...composeData, body: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<AttachFile />} color="inherit">
            Attach
          </Button>
          <Button onClick={() => setComposeOpen(false)}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={sendEmail}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Send />}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Email Viewer Dialog */}
      <Dialog open={emailViewOpen} onClose={() => setEmailViewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" noWrap>
              {selectedEmail?.subject}
            </Typography>
            <IconButton onClick={() => setEmailViewOpen(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedEmail && (
            <Box>
              <Box sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                <Typography variant="subtitle2">
                  From: {getSenderInfo(selectedEmail).name} &lt;{getSenderInfo(selectedEmail).email}&gt;
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(selectedEmail.date).toLocaleString()}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                {selectedEmail.body || selectedEmail.snippet}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Reply />}>Reply</Button>
          <Button startIcon={<Forward />}>Forward</Button>
          <Button startIcon={<Delete />} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailManager;