import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  TextField, 
  IconButton, 
  Paper,
  Avatar,
  Button,
  ThemeProvider,
  createTheme,
  CssBaseline,
  useTheme,
  alpha
} from '@mui/material';
import { Send as SendIcon, Person as PersonIcon, Work as WorkIcon } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6366f1',
      dark: '#4f46e5',
      light: '#818cf8',
    },
    secondary: {
      main: '#ec4899',
      dark: '#db2777',
      light: '#f472b6',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

const GradientPaper = ({ children, ...props }) => {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        backdropFilter: 'blur(10px)',
        ...props.sx,
      }}
      {...props}
    >
      {children}
    </Paper>
  );
};

const Message = ({ message, isUser }) => {
  const theme = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        marginBottom: '1rem',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '70%',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 0.5,
          }}
        >
          <Avatar 
            sx={{ 
              bgcolor: isUser 
                ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
                : `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`,
              color: 'white',
            }}
          >
            {isUser ? <PersonIcon /> : <WorkIcon />}
          </Avatar>
          <Typography variant="caption" color="text.secondary">
            {isUser ? 'You' : 'HR Assistant'}
          </Typography>
        </Box>
        <GradientPaper
          elevation={2}
          sx={{
            p: 2,
            background: isUser 
              ? `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`
              : `linear-gradient(135deg, ${alpha(theme.palette.secondary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
            color: isUser ? 'white' : 'text.primary',
            borderRadius: 2,
            borderBottomRightRadius: isUser ? 0 : 2,
            borderBottomLeftRadius: isUser ? 2 : 0,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          }}
        >
          <Typography>{message}</Typography>
        </GradientPaper>
      </Box>
    </motion.div>
  );
};

const QuickReplies = ({ onSelect }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
      {[
        'What are the company policies?',
        'How do I request time off?',
        'What are the benefits?',
        'How do I update my information?'
      ].map((text) => (
        <motion.div
          key={text}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Button
            variant="outlined"
            size="small"
            onClick={() => onSelect(text)}
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              color: theme.palette.primary.main,
              '&:hover': {
                background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.4)}`,
              },
            }}
          >
            {text}
          </Button>
        </motion.div>
      ))}
    </Box>
  );
};

function App() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your HR Assistant. How can I help you today?", isUser: false }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMessage, isUser: true }]);
    setIsTyping(true);

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        question: userMessage
      });
      
      setMessages(prev => [...prev, { text: response.data.response, isUser: false }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: "I'm sorry, I encountered an error. Please try again.", 
        isUser: false 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text) => {
    setInput(text);
    handleSend();
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          py: 4,
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography 
                variant="h3" 
                sx={{
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontWeight: 700,
                }}
                gutterBottom
              >
                HR Assistant
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Your professional HR support chatbot
              </Typography>
            </Box>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GradientPaper
              elevation={3}
              sx={{
                height: '70vh',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}
              >
                <Avatar 
                  sx={{ 
                    bgcolor: 'white',
                    color: theme.palette.primary.main,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                >
                  <WorkIcon />
                </Avatar>
                <Typography variant="h6">HR Assistant</Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  overflowY: 'auto',
                  p: 2,
                  background: `linear-gradient(135deg, ${alpha(theme.palette.background.default, 0.8)} 0%, ${alpha(theme.palette.background.paper, 0.8)} 100%)`,
                }}
              >
                <AnimatePresence>
                  {messages.map((message, index) => (
                    <Message key={index} message={message.text} isUser={message.isUser} />
                  ))}
                </AnimatePresence>
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-start' }}>
                      <Typography>Typing</Typography>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        {[...Array(3)].map((_, i) => (
                          <motion.div
                            key={i}
                            animate={{
                              y: [0, -5, 0],
                            }}
                            transition={{
                              duration: 1,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                          >
                            <Box
                              sx={{
                                width: 8,
                                height: 8,
                                bgcolor: theme.palette.primary.main,
                                borderRadius: '50%',
                              }}
                            />
                          </motion.div>
                        ))}
                      </Box>
                    </Box>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </Box>

              <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                <QuickReplies onSelect={handleQuickReply} />
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        background: `linear-gradient(135deg, ${alpha(theme.palette.background.paper, 0.8)} 0%, ${alpha(theme.palette.background.default, 0.8)} 100%)`,
                      },
                    }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <IconButton
                      color="primary"
                      onClick={handleSend}
                      disabled={!input.trim()}
                      sx={{
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        color: 'white',
                        '&:hover': {
                          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        },
                        '&.Mui-disabled': {
                          background: theme.palette.grey[300],
                        },
                      }}
                    >
                      <SendIcon />
                    </IconButton>
                  </motion.div>
                </Box>
              </Box>
            </GradientPaper>
          </motion.div>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 