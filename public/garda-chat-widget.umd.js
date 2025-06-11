(function(global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.GardaChatWidget = {}));
})(this, (function(exports) {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
    theme: 'light',
    primaryColor: '#dc2626',
    language: 'en',
    supabaseUrl: '',
    supabaseAnonKey: ''
  };

  // Translations
  const TRANSLATIONS = {
    en: {
      chatTitle: 'Garda Racing Support',
      online: 'Online',
      offline: 'Offline',
      typePlaceholder: 'Type your message...',
      send: 'Send',
      quickQuestions: 'Quick questions:',
      errorMessage: 'Sorry, I\'m having trouble responding right now. Please try again later or contact us directly.',
      connectionError: 'Unable to connect to chat service. Working in offline mode.',
      corsError: 'Connection restricted. Working in offline mode with basic responses.'
    },
    ru: {
      chatTitle: 'Поддержка Garda Racing',
      online: 'В сети',
      offline: 'Автономно',
      typePlaceholder: 'Введите ваше сообщение...',
      send: 'Отправить',
      quickQuestions: 'Быстрые вопросы:',
      errorMessage: 'Извините, у меня возникли проблемы с ответом. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.',
      connectionError: 'Не удается подключиться к службе чата. Работаем в автономном режиме.',
      corsError: 'Соединение ограничено. Работаем в автономном режиме с базовыми ответами.'
    },
    it: {
      chatTitle: 'Supporto Garda Racing',
      online: 'Online',
      offline: 'Offline',
      typePlaceholder: 'Scrivi il tuo messaggio...',
      send: 'Invia',
      quickQuestions: 'Domande rapide:',
      errorMessage: 'Mi dispiace, sto avendo problemi a rispondere in questo momento. Riprova più tardi o contattaci direttamente.',
      connectionError: 'Impossibile connettersi al servizio chat. Funziona in modalità offline.',
      corsError: 'Connessione limitata. Funziona in modalità offline con risposte di base.'
    },
    de: {
      chatTitle: 'Garda Racing Support',
      online: 'Online',
      offline: 'Offline',
      typePlaceholder: 'Geben Sie Ihre Nachricht ein...',
      send: 'Senden',
      quickQuestions: 'Schnelle Fragen:',
      errorMessage: 'Entschuldigung, ich habe Probleme beim Antworten. Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns direkt.',
      connectionError: 'Verbindung zum Chat-Service nicht möglich. Arbeitet im Offline-Modus.',
      corsError: 'Verbindung eingeschränkt. Arbeitet im Offline-Modus mit grundlegenden Antworten.'
    },
    fr: {
      chatTitle: 'Support Garda Racing',
      online: 'En ligne',
      offline: 'Hors ligne',
      typePlaceholder: 'Tapez votre message...',
      send: 'Envoyer',
      quickQuestions: 'Questions rapides:',
      errorMessage: 'Désolé, j\'ai du mal à répondre en ce moment. Veuillez réessayer plus tard ou nous contacter directement.',
      connectionError: 'Impossible de se connecter au service de chat. Fonctionne en mode hors ligne.',
      corsError: 'Connexion restreinte. Fonctionne en mode hors ligne avec des réponses de base.'
    },
    es: {
      chatTitle: 'Soporte Garda Racing',
      online: 'En línea',
      offline: 'Sin conexión',
      typePlaceholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      quickQuestions: 'Preguntas rápidas:',
      errorMessage: 'Lo siento, estoy teniendo problemas para responder en este momento. Inténtalo de nuevo más tarde o contáctanos directamente.',
      connectionError: 'No se puede conectar al servicio de chat. Funcionando en modo sin conexión.',
      corsError: 'Conexión restringida. Funcionando en modo sin conexión con respuestas básicas.'
    }
  };

  // Default quick replies for each language
  const DEFAULT_QUICK_REPLIES = {
    en: ['What\'s included?', 'Do I need experience?', 'How to book?'],
    ru: ['Что включено?', 'Нужен ли опыт?', 'Как забронировать?'],
    it: ['Cosa è incluso?', 'Serve esperienza?', 'Come prenotare?'],
    de: ['Was ist inbegriffen?', 'Brauche ich Erfahrung?', 'Wie kann ich buchen?'],
    fr: ['Qu\'est-ce qui est inclus?', 'Ai-je besoin d\'expérience?', 'Comment réserver?'],
    es: ['¿Qué está incluido?', '¿Necesito experiencia?', '¿Cómo reservar?']
  };

  // Create Supabase client with better error handling
  function createSupabaseClient(supabaseUrl, supabaseAnonKey) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase URL and Anon Key are required for full functionality');
      return null;
    }

    // Simple fetch wrapper for Supabase with enhanced CORS handling
    return {
      from: (table) => ({
        insert: async (data) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Prefer': 'return=minimal'
              },
              body: JSON.stringify(data),
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              // Handle specific error types
              if (response.status === 0) {
                throw new Error('CORS_ERROR');
              }
              if (response.status >= 400 && response.status < 500) {
                throw new Error(`CLIENT_ERROR_${response.status}`);
              }
              if (response.status >= 500) {
                throw new Error(`SERVER_ERROR_${response.status}`);
              }
              throw new Error(`HTTP_${response.status}`);
            }
            
            const result = await response.json();
            return { data: result, error: null };
          } catch (error) {
            // Enhanced error categorization
            if (error.name === 'AbortError') {
              console.warn('Supabase request timeout');
              return { data: null, error: { type: 'TIMEOUT', message: 'Request timeout' } };
            }
            
            // Check for common CORS/network errors
            if (error.message === 'Failed to fetch' || 
                error.message === 'CORS_ERROR' || 
                error.message.includes('CORS') || 
                error.message.includes('NetworkError') ||
                error.message.includes('network') ||
                error.name === 'TypeError' && error.message.includes('fetch')) {
              console.warn('CORS/Network error detected, switching to offline mode');
              return { data: null, error: { type: 'CORS', message: 'CORS restriction or network error' } };
            }
            
            console.warn('Supabase insert error:', error.message);
            return { data: null, error: { type: 'UNKNOWN', message: error.message } };
          }
        },
        select: async (columns = '*') => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
              },
              signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
              // Handle specific error types
              if (response.status === 0) {
                throw new Error('CORS_ERROR');
              }
              if (response.status >= 400 && response.status < 500) {
                throw new Error(`CLIENT_ERROR_${response.status}`);
              }
              if (response.status >= 500) {
                throw new Error(`SERVER_ERROR_${response.status}`);
              }
              throw new Error(`HTTP_${response.status}`);
            }
            
            const result = await response.json();
            return { data: result, error: null };
          } catch (error) {
            // Enhanced error categorization
            if (error.name === 'AbortError') {
              console.warn('Supabase request timeout');
              return { data: null, error: { type: 'TIMEOUT', message: 'Request timeout' } };
            }
            
            // Check for common CORS/network errors
            if (error.message === 'Failed to fetch' || 
                error.message === 'CORS_ERROR' || 
                error.message.includes('CORS') || 
                error.message.includes('NetworkError') ||
                error.message.includes('network') ||
                error.name === 'TypeError' && error.message.includes('fetch')) {
              console.warn('CORS/Network error detected, switching to offline mode');
              return { data: null, error: { type: 'CORS', message: 'CORS restriction or network error' } };
            }
            
            console.warn('Supabase select error:', error.message);
            return { data: null, error: { type: 'UNKNOWN', message: error.message } };
          }
        }
      })
    };
  }

  // Chat service with enhanced offline fallback
  const chatService = {
    supabase: null,
    isOnline: true,
    connectionStatus: 'unknown', // 'online', 'offline', 'cors_restricted'
    
    initialize(supabaseUrl, supabaseAnonKey) {
      this.supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
      this.isOnline = !!this.supabase;
      this.connectionStatus = this.isOnline ? 'online' : 'offline';
    },
    
    generateSessionId() {
      return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    },
    
    async sendMessage(message, sessionId, language = 'en') {
      // Try to save to Supabase if available and online
      if (this.supabase && this.connectionStatus === 'online') {
        try {
          const result = await this.supabase.from('messages').insert({
            text: message,
            session_id: sessionId,
            sender: 'user',
            language
          });
          
          // Handle different error types
          if (result.error) {
            if (result.error.type === 'CORS') {
              this.connectionStatus = 'cors_restricted';
              console.warn('CORS restriction detected, switching to offline mode');
            } else if (result.error.type === 'NETWORK' || result.error.type === 'TIMEOUT') {
              this.connectionStatus = 'offline';
              console.warn('Network issues detected, switching to offline mode');
            } else {
              console.warn('Database error:', result.error.message);
            }
          }
        } catch (error) {
          console.warn('Failed to save message to database:', error.message);
          // Check if it's a CORS/network error
          if (error.message === 'Failed to fetch' || 
              error.message.includes('CORS') || 
              error.message.includes('NetworkError') ||
              error.name === 'TypeError' && error.message.includes('fetch')) {
            this.connectionStatus = 'cors_restricted';
          } else {
            this.connectionStatus = 'offline';
          }
        }
      }
      
      // Generate response (works offline)
      return this.generateResponse(message, language);
    },
    
    getConnectionStatusText(language) {
      const translations = TRANSLATIONS[language] || TRANSLATIONS.en;
      
      switch (this.connectionStatus) {
        case 'online':
          return translations.online;
        case 'cors_restricted':
          return translations.offline + ' (CORS)';
        case 'offline':
        default:
          return translations.offline;
      }
    },
    
    generateResponse(message, language = 'en') {
      const lowerMessage = message.toLowerCase();
      
      // Check for price-related questions
      if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
          lowerMessage.includes('стоимость') || lowerMessage.includes('цена') ||
          lowerMessage.includes('prezzo') || lowerMessage.includes('costo') ||
          lowerMessage.includes('preis') || lowerMessage.includes('kosten') ||
          lowerMessage.includes('prix') || lowerMessage.includes('coût') ||
          lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
        return {
          message: 'The Garda Racing experience costs €199 per person, all inclusive. This includes professional instruction, safety equipment, and refreshments.',
          suggestions: DEFAULT_QUICK_REPLIES[language] || DEFAULT_QUICK_REPLIES.en,
          language
        };
      }
      
      // Check for experience-related questions
      if (lowerMessage.includes('experience') || lowerMessage.includes('need to know') || 
          lowerMessage.includes('опыт') || lowerMessage.includes('нужно знать') ||
          lowerMessage.includes('esperienza') || lowerMessage.includes('bisogno di sapere') ||
          lowerMessage.includes('erfahrung') || lowerMessage.includes('wissen müssen') ||
          lowerMessage.includes('expérience') || lowerMessage.includes('besoin de savoir') ||
          lowerMessage.includes('experiencia') || lowerMessage.includes('necesito saber')) {
        return {
          message: 'No sailing experience is required! Our professional skippers will teach you everything you need to know. We welcome complete beginners and experienced sailors alike.',
          suggestions: ['What should I bring?', 'How many people per boat?', 'What if the weather is bad?'],
          language
        };
      }
      
      // Check for booking-related questions
      if (lowerMessage.includes('book') || lowerMessage.includes('reservation') || 
          lowerMessage.includes('бронирование') || lowerMessage.includes('резервация') ||
          lowerMessage.includes('prenotazione') || lowerMessage.includes('prenotare') ||
          lowerMessage.includes('buchung') || lowerMessage.includes('reservierung') ||
          lowerMessage.includes('réservation') || lowerMessage.includes('réserver') ||
          lowerMessage.includes('reserva') || lowerMessage.includes('reservar')) {
        return {
          message: 'You can book your experience directly on our website. Just click the "Book Your Adventure" button on the homepage or go to the Booking page. You can also call us at +39 345 678 9012 for immediate assistance.',
          suggestions: ['What dates are available?', 'Group booking?', 'Cancellation policy?'],
          language
        };
      }
      
      // Check for what's included questions
      if (lowerMessage.includes('included') || lowerMessage.includes('include') ||
          lowerMessage.includes('включено') || lowerMessage.includes('включает') ||
          lowerMessage.includes('incluso') || lowerMessage.includes('include') ||
          lowerMessage.includes('inbegriffen') || lowerMessage.includes('enthalten') ||
          lowerMessage.includes('inclus') || lowerMessage.includes('comprend') ||
          lowerMessage.includes('incluido') || lowerMessage.includes('incluye')) {
        return {
          message: 'Your Garda Racing experience includes: professional sailing instruction, all safety equipment (life jackets, harnesses), yacht rental, welcome drink, and light refreshments. We also provide photos of your adventure!',
          suggestions: ['What should I bring?', 'How long is the experience?', 'Weather policy?'],
          language
        };
      }
      
      // Check for weather-related questions
      if (lowerMessage.includes('weather') || lowerMessage.includes('rain') || lowerMessage.includes('wind') ||
          lowerMessage.includes('погода') || lowerMessage.includes('дождь') ||
          lowerMessage.includes('tempo') || lowerMessage.includes('pioggia') ||
          lowerMessage.includes('wetter') || lowerMessage.includes('regen') ||
          lowerMessage.includes('temps') || lowerMessage.includes('pluie') ||
          lowerMessage.includes('tiempo') || lowerMessage.includes('lluvia')) {
        return {
          message: 'We monitor weather conditions closely for your safety. If conditions are unsafe, we\'ll reschedule your experience at no extra cost. Light rain doesn\'t stop us - sailing in different conditions is part of the adventure!',
          suggestions: ['What should I bring?', 'Cancellation policy?', 'How to book?'],
          language
        };
      }
      
      // Default response
      return {
        message: 'Thank you for your message! 😊 I\'m here to help with any questions about our yacht racing experiences. For immediate assistance, call us at +39 345 678 9012 or email info@gardaracing.com',
        suggestions: DEFAULT_QUICK_REPLIES[language] || DEFAULT_QUICK_REPLIES.en,
        language
      };
    }
  };

  // Load CSS styles
  function loadStyles() {
    // Check if styles are already loaded
    if (document.querySelector('#garda-chat-widget-styles')) {
      return;
    }
    
    // Try to load external CSS file first
    const link = document.createElement('link');
    link.id = 'garda-chat-widget-styles';
    link.rel = 'stylesheet';
    link.href = '/garda-chat-widget.css';
    
    // Fallback to inline styles if external file fails
    link.onerror = () => {
      link.remove();
      const style = document.createElement('style');
      style.id = 'garda-chat-widget-styles';
      style.textContent = `
        .garda-chat-widget-container{position:fixed;z-index:10000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;--primary-color:#dc2626}.garda-chat-widget-container.bottom-right{bottom:20px;right:20px}.garda-chat-widget-button{width:60px;height:60px;background:var(--primary-color);border-radius:50%;display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.3s ease;position:relative}.garda-chat-widget-button:hover{transform:scale(1.1)}.garda-chat-widget-button-icon{width:24px;height:24px;color:white}.garda-chat-widget-button-status{position:absolute;top:4px;right:4px;width:12px;height:12px;background:#10b981;border:2px solid white;border-radius:50%}.garda-chat-widget-button-status.offline{background:#ef4444}.garda-chat-widget-button-status.cors-restricted{background:#f59e0b}.garda-chat-widget-panel{position:absolute;bottom:80px;right:0;width:350px;height:500px;background:white;border-radius:12px;box-shadow:0 10px 40px rgba(0,0,0,0.15);display:flex;flex-direction:column;overflow:hidden}.garda-chat-widget-header{background:var(--primary-color);color:white;padding:16px;display:flex;align-items:center;justify-content:space-between}.garda-chat-widget-header-title{display:flex;align-items:center;gap:12px}.garda-chat-widget-header-avatar{width:40px;height:40px;background:rgba(255,255,255,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center}.garda-chat-widget-header-info h3{margin:0;font-size:16px;font-weight:600}.garda-chat-widget-header-info p{margin:0;font-size:12px;opacity:0.9}.garda-chat-widget-header-close{background:none;border:none;color:white;cursor:pointer;padding:4px;border-radius:4px}.garda-chat-widget-messages{flex:1;padding:16px;overflow-y:auto;display:flex;flex-direction:column;gap:12px}.garda-chat-widget-message{display:flex;gap:8px;align-items:flex-start}.garda-chat-widget-message.user{flex-direction:row-reverse}.garda-chat-widget-message-avatar{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0}.garda-chat-widget-message.user .garda-chat-widget-message-avatar{background:var(--primary-color);color:white}.garda-chat-widget-message.bot .garda-chat-widget-message-avatar{background:#f3f4f6;color:#6b7280}.garda-chat-widget-message-content{max-width:70%}.garda-chat-widget-message.user .garda-chat-widget-message-content{text-align:right}.garda-chat-widget-message-text{background:#f3f4f6;padding:8px 12px;border-radius:12px;margin:0 0 4px 0;font-size:14px;line-height:1.4}.garda-chat-widget-message.user .garda-chat-widget-message-text{background:var(--primary-color);color:white}.garda-chat-widget-message-time{font-size:11px;color:#9ca3af;margin:0}.garda-chat-widget-typing{display:flex;gap:4px;padding:8px 12px;background:#f3f4f6;border-radius:12px}.garda-chat-widget-typing-dot{width:6px;height:6px;background:#9ca3af;border-radius:50%;animation:typing 1.4s infinite ease-in-out}.garda-chat-widget-suggestions{padding:0 16px 16px;border-bottom:1px solid #e5e7eb}.garda-chat-widget-suggestions-title{font-size:12px;color:#6b7280;margin:0 0 8px 0;font-weight:500}.garda-chat-widget-suggestions-list{display:flex;flex-wrap:wrap;gap:6px}.garda-chat-widget-suggestion{background:#f9fafb;border:1px solid #e5e7eb;border-radius:16px;padding:6px 12px;font-size:12px;cursor:pointer;transition:all 0.2s ease}.garda-chat-widget-suggestion:hover{background:var(--primary-color);color:white;border-color:var(--primary-color)}.garda-chat-widget-input{padding:16px;border-top:1px solid #e5e7eb}.garda-chat-widget-input-form{display:flex;gap:8px;align-items:center}.garda-chat-widget-input-field{flex:1;border:1px solid #e5e7eb;border-radius:20px;padding:8px 16px;font-size:14px;outline:none}.garda-chat-widget-input-field:focus{border-color:var(--primary-color)}.garda-chat-widget-input-submit{width:36px;height:36px;background:var(--primary-color);border:none;border-radius:50%;color:white;cursor:pointer;display:flex;align-items:center;justify-content:center}.garda-chat-widget-input-submit:disabled{background:#d1d5db;cursor:not-allowed}@keyframes typing{0%,80%,100%{transform:scale(0.8);opacity:0.5}40%{transform:scale(1);opacity:1}}
      `;
      document.head.appendChild(style);
    };
    
    document.head.appendChild(link);
  }

  // Main widget class
  class GardaChatWidget {
    constructor(config = {}) {
      this.config = { ...DEFAULT_CONFIG, ...config };
      this.isOpen = false;
      this.messages = [];
      this.sessionId = chatService.generateSessionId();
      this.container = null;
      this.messagesContainer = null;
      this.inputField = null;
      this.statusIndicator = null;
      this.statusText = null;
      
      // Load styles
      loadStyles();
      
      // Initialize chat service
      chatService.initialize(this.config.supabaseUrl, this.config.supabaseAnonKey);
      
      // Initialize widget
      this.init();
    }
    
    init() {
      // Create container
      this.container = document.createElement('div');
      this.container.className = `garda-chat-widget-container ${this.config.position} garda-chat-widget-theme-${this.config.theme}`;
      document.body.appendChild(this.container);
      
      // Set primary color as CSS variable
      this.container.style.setProperty('--primary-color', this.config.primaryColor);
      
      // Create toggle button
      this.createToggleButton();
      
      // Add welcome message
      this.addWelcomeMessage();
    }
    
    createToggleButton() {
      const button = document.createElement('div');
      button.className = 'garda-chat-widget-button';
      button.innerHTML = `
        <svg class="garda-chat-widget-button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <div class="garda-chat-widget-button-status"></div>
      `;
      
      this.statusIndicator = button.querySelector('.garda-chat-widget-button-status');
      this.updateConnectionStatus();
      
      button.addEventListener('click', () => this.toggleChat());
      this.container.appendChild(button);
    }
    
    updateConnectionStatus() {
      if (!this.statusIndicator) return;
      
      // Remove existing status classes
      this.statusIndicator.classList.remove('offline', 'cors-restricted');
      
      // Add appropriate status class
      switch (chatService.connectionStatus) {
        case 'offline':
          this.statusIndicator.classList.add('offline');
          break;
        case 'cors_restricted':
          this.statusIndicator.classList.add('cors-restricted');
          break;
        case 'online':
        default:
          // Default green color, no additional class needed
          break;
      }
      
      // Update status text if panel is open
      if (this.statusText) {
        this.statusText.textContent = chatService.getConnectionStatusText(this.config.language);
      }
    }
    
    createChatPanel() {
      const panel = document.createElement('div');
      panel.className = 'garda-chat-widget-panel';
      
      // Header
      const header = document.createElement('div');
      header.className = 'garda-chat-widget-header';
      header.innerHTML = `
        <div class="garda-chat-widget-header-title">
          <div class="garda-chat-widget-header-avatar">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 16v-4"></path>
              <path d="M12 8h.01"></path>
            </svg>
          </div>
          <div class="garda-chat-widget-header-info">
            <h3>${TRANSLATIONS[this.config.language]?.chatTitle || TRANSLATIONS.en.chatTitle}</h3>
            <p class="status-text">${chatService.getConnectionStatusText(this.config.language)}</p>
          </div>
        </div>
        <button class="garda-chat-widget-header-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
      this.statusText = header.querySelector('.status-text');
      
      // Messages container
      const messagesContainer = document.createElement('div');
      messagesContainer.className = 'garda-chat-widget-messages';
      this.messagesContainer = messagesContainer;
      
      // Render existing messages
      this.messages.forEach(message => {
        this.renderMessage(message);
      });
      
      // Quick suggestions
      const suggestionsContainer = document.createElement('div');
      suggestionsContainer.className = 'garda-chat-widget-suggestions';
      suggestionsContainer.innerHTML = `
        <p class="garda-chat-widget-suggestions-title">${TRANSLATIONS[this.config.language]?.quickQuestions || TRANSLATIONS.en.quickQuestions}</p>
        <div class="garda-chat-widget-suggestions-list">
          ${(DEFAULT_QUICK_REPLIES[this.config.language] || DEFAULT_QUICK_REPLIES.en)
            .map(suggestion => `
              <button class="garda-chat-widget-suggestion">${suggestion}</button>
            `).join('')}
        </div>
      `;
      
      // Input area
      const inputContainer = document.createElement('div');
      inputContainer.className = 'garda-chat-widget-input';
      inputContainer.innerHTML = `
        <form class="garda-chat-widget-input-form">
          <input type="text" class="garda-chat-widget-input-field" placeholder="${TRANSLATIONS[this.config.language]?.typePlaceholder || TRANSLATIONS.en.typePlaceholder}">
          <button type="submit" class="garda-chat-widget-input-submit" disabled>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      `;
      
      // Assemble panel
      panel.appendChild(header);
      panel.appendChild(messagesContainer);
      panel.appendChild(suggestionsContainer);
      panel.appendChild(inputContainer);
      
      // Add event listeners
      header.querySelector('.garda-chat-widget-header-close').addEventListener('click', () => this.toggleChat());
      
      const form = inputContainer.querySelector('form');
      this.inputField = form.querySelector('input');
      const submitButton = form.querySelector('button');
      
      this.inputField.addEventListener('input', () => {
        submitButton.disabled = !this.inputField.value.trim();
      });
      
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.sendMessage();
      });
      
      // Add suggestion click handlers
      const suggestions = suggestionsContainer.querySelectorAll('.garda-chat-widget-suggestion');
      suggestions.forEach(suggestion => {
        suggestion.addEventListener('click', () => {
          this.sendMessage(suggestion.textContent);
        });
      });
      
      return panel;
    }
    
    toggleChat() {
      this.isOpen = !this.isOpen;
      
      if (this.isOpen) {
        // Create and show chat panel if it doesn't exist
        if (!this.container.querySelector('.garda-chat-widget-panel')) {
          const panel = this.createChatPanel();
          this.container.appendChild(panel);
        } else {
          const panel = this.container.querySelector('.garda-chat-widget-panel');
          panel.style.display = 'flex';
        }
        
        // Update connection status when opening
        this.updateConnectionStatus();
        
        // Focus input field
        setTimeout(() => {
          this.inputField?.focus();
        }, 300);
      } else {
        // Hide chat panel
        const panel = this.container.querySelector('.garda-chat-widget-panel');
        if (panel) {
          panel.style.display = 'none';
        }
      }
    }
    
    addWelcomeMessage() {
      const welcomeMessage = {
        id: chatService.generateSessionId(),
        text: this.getWelcomeMessage(),
        sender: 'bot',
        timestamp: new Date(),
        language: this.config.language
      };
      
      this.messages.push(welcomeMessage);
      
      // If chat is already open, render the message
      if (this.messagesContainer) {
        this.renderMessage(welcomeMessage);
      }
    }
    
    getWelcomeMessage() {
      const welcomeMessages = {
        en: 'Welcome to Garda Racing Yacht Club! 🛥️ How can I help you today? Ask me about our yacht racing experiences, pricing, or booking information.',
        ru: 'Добро пожаловать в Garda Racing Yacht Club! 🛥️ Как я могу помочь вам сегодня? Спросите меня о наших яхтенных гонках, ценах или информации о бронировании.',
        it: 'Benvenuto al Garda Racing Yacht Club! 🛥️ Come posso aiutarti oggi? Chiedimi delle nostre esperienze di regata, prezzi o informazioni per le prenotazioni.',
        de: 'Willkommen beim Garda Racing Yacht Club! 🛥️ Wie kann ich Ihnen heute helfen? Fragen Sie mich nach unseren Yacht-Rennerlebnissen, Preisen oder Buchungsinformationen.',
        fr: 'Bienvenue au Garda Racing Yacht Club! 🛥️ Comment puis-je vous aider aujourd\'hui? Demandez-moi à propos de nos expériences de course de yacht, prix ou informations de réservation.',
        es: '¡Bienvenido al Garda Racing Yacht Club! 🛥️ ¿Cómo puedo ayudarte hoy? Pregúntame sobre nuestras experiencias de regatas de yate, precios o información de reservas.'
      };
      
      return welcomeMessages[this.config.language] || welcomeMessages.en;
    }
    
    async sendMessage(text) {
      const messageText = text || this.inputField.value.trim();
      
      if (!messageText) return;
      
      // Clear input field
      if (this.inputField) {
        this.inputField.value = '';
        this.inputField.nextElementSibling.disabled = true;
      }
      
      // Add user message
      const userMessage = {
        id: chatService.generateSessionId(),
        text: messageText,
        sender: 'user',
        timestamp: new Date(),
        language: this.config.language
      };
      
      this.messages.push(userMessage);
      this.renderMessage(userMessage);
      
      // Show typing indicator
      this.showTypingIndicator();
      
      try {
        // Get bot response
        const response = await chatService.sendMessage(messageText, this.sessionId, this.config.language);
        
        // Update connection status after attempting to send
        this.updateConnectionStatus();
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add bot message
        const botMessage = {
          id: chatService.generateSessionId(),
          text: response.message,
          sender: 'bot',
          timestamp: new Date(),
          language: response.language || this.config.language,
          suggestions: response.suggestions
        };
        
        this.messages.push(botMessage);
        this.renderMessage(botMessage);
        
        // Update suggestions if provided
        if (response.suggestions && response.suggestions.length > 0) {
          this.updateSuggestions(response.suggestions);
        }
      } catch (error) {
        console.error('Error getting response:', error);
        
        // Update connection status
        chatService.connectionStatus = 'offline';
        this.updateConnectionStatus();
        
        // Hide typing indicator
        this.hideTypingIndicator();
        
        // Add error message
        const errorMessage = {
          id: chatService.generateSessionId(),
          text: TRANSLATIONS[this.config.language]?.errorMessage || TRANSLATIONS.en.errorMessage,
          sender: 'bot',
          timestamp: new Date(),
          language: this.config.language
        };
        
        this.messages.push(errorMessage);
        this.renderMessage(errorMessage);
      }
    }
    
    renderMessage(message) {
      if (!this.messagesContainer) return;
      
      const messageElement = document.createElement('div');
      messageElement.className = `garda-chat-widget-message ${message.sender}`;
      
      const avatar = document.createElement('div');
      avatar.className = 'garda-chat-widget-message-avatar';
      
      if (message.sender === 'user') {
        avatar.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
      } else {
        avatar.innerHTML = `
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M12 16v-4"></path>
            <path d="M12 8h.01"></path>
          </svg>
        `;
      }
      
      const content = document.createElement('div');
      content.className = 'garda-chat-widget-message-content';
      
      const text = document.createElement('p');
      text.className = 'garda-chat-widget-message-text';
      text.textContent = message.text;
      
      const time = document.createElement('p');
      time.className = 'garda-chat-widget-message-time';
      time.textContent = message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      content.appendChild(text);
      content.appendChild(time);
      
      messageElement.appendChild(avatar);
      messageElement.appendChild(content);
      
      this.messagesContainer.appendChild(messageElement);
      
      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    showTypingIndicator() {
      if (!this.messagesContainer) return;
      
      const typingElement = document.createElement('div');
      typingElement.className = 'garda-chat-widget-message bot';
      typingElement.id = 'typing-indicator';
      
      const avatar = document.createElement('div');
      avatar.className = 'garda-chat-widget-message-avatar';
      avatar.innerHTML = `
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M12 16v-4"></path>
          <path d="M12 8h.01"></path>
        </svg>
      `;
      
      const typing = document.createElement('div');
      typing.className = 'garda-chat-widget-typing';
      typing.innerHTML = `
        <div class="garda-chat-widget-typing-dot"></div>
        <div class="garda-chat-widget-typing-dot"></div>
        <div class="garda-chat-widget-typing-dot"></div>
      `;
      
      typingElement.appendChild(avatar);
      typingElement.appendChild(typing);
      
      this.messagesContainer.appendChild(typingElement);
      
      // Scroll to bottom
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
      if (!this.messagesContainer) return;
      
      const typingElement = document.getElementById('typing-indicator');
      if (typingElement) {
        typingElement.remove();
      }
    }
    
    updateSuggestions(suggestions) {
      if (!this.container) return;
      
      const suggestionsContainer = this.container.querySelector('.garda-chat-widget-suggestions-list');
      if (!suggestionsContainer) return;
      
      // Clear existing suggestions
      suggestionsContainer.innerHTML = '';
      
      // Add new suggestions
      suggestions.forEach(suggestion => {
        const button = document.createElement('button');
        button.className = 'garda-chat-widget-suggestion';
        button.textContent = suggestion;
        button.addEventListener('click', () => {
          this.sendMessage(suggestion);
        });
        
        suggestionsContainer.appendChild(button);
      });
    }
  }

  // Initialize widget when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Get configuration from window object
    const config = window.gardaChatWidgetConfig || {};
    
    // Create widget instance
    const widget = new GardaChatWidget(config);
    
    // Export widget instance
    exports.widget = widget;
  });

  // Export GardaChatWidget class
  exports.GardaChatWidget = GardaChatWidget;

}));