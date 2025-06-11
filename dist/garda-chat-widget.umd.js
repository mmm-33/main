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
      typePlaceholder: 'Type your message...',
      send: 'Send',
      quickQuestions: 'Quick questions:',
      errorMessage: 'Sorry, I\'m having trouble responding right now. Please try again later or contact us directly.'
    },
    ru: {
      chatTitle: 'Поддержка Garda Racing',
      online: 'В сети',
      typePlaceholder: 'Введите ваше сообщение...',
      send: 'Отправить',
      quickQuestions: 'Быстрые вопросы:',
      errorMessage: 'Извините, у меня возникли проблемы с ответом. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.'
    },
    it: {
      chatTitle: 'Supporto Garda Racing',
      online: 'Online',
      typePlaceholder: 'Scrivi il tuo messaggio...',
      send: 'Invia',
      quickQuestions: 'Domande rapide:',
      errorMessage: 'Mi dispiace, sto avendo problemi a rispondere in questo momento. Riprova più tardi o contattaci direttamente.'
    },
    de: {
      chatTitle: 'Garda Racing Support',
      online: 'Online',
      typePlaceholder: 'Geben Sie Ihre Nachricht ein...',
      send: 'Senden',
      quickQuestions: 'Schnelle Fragen:',
      errorMessage: 'Entschuldigung, ich habe Probleme beim Antworten. Bitte versuchen Sie es später noch einmal oder kontaktieren Sie uns direkt.'
    },
    fr: {
      chatTitle: 'Support Garda Racing',
      online: 'En ligne',
      typePlaceholder: 'Tapez votre message...',
      send: 'Envoyer',
      quickQuestions: 'Questions rapides:',
      errorMessage: 'Désolé, j\'ai du mal à répondre en ce moment. Veuillez réessayer plus tard ou nous contacter directement.'
    },
    es: {
      chatTitle: 'Soporte Garda Racing',
      online: 'En línea',
      typePlaceholder: 'Escribe tu mensaje...',
      send: 'Enviar',
      quickQuestions: 'Preguntas rápidas:',
      errorMessage: 'Lo siento, estoy teniendo problemas para responder en este momento. Inténtalo de nuevo más tarde o contáctanos directamente.'
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

  // Create Supabase client
  function createSupabaseClient(supabaseUrl, supabaseAnonKey) {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL and Anon Key are required');
      return null;
    }

    // Simple fetch wrapper for Supabase
    return {
      from: (table) => ({
        insert: async (data) => {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
              },
              body: JSON.stringify(data)
            });
            
            if (!response.ok) {
              throw new Error(`Error inserting data: ${response.statusText}`);
            }
            
            return { data: await response.json(), error: null };
          } catch (error) {
            console.error('Supabase error:', error);
            return { data: null, error };
          }
        },
        select: async (columns = '*') => {
          try {
            const response = await fetch(`${supabaseUrl}/rest/v1/${table}?select=${columns}`, {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                'apikey': supabaseAnonKey,
                'Authorization': `Bearer ${supabaseAnonKey}`
              }
            });
            
            if (!response.ok) {
              throw new Error(`Error selecting data: ${response.statusText}`);
            }
            
            return { data: await response.json(), error: null };
          } catch (error) {
            console.error('Supabase error:', error);
            return { data: null, error };
          }
        }
      })
    };
  }

  // Chat service
  const chatService = {
    supabase: null,
    
    initialize(supabaseUrl, supabaseAnonKey) {
      this.supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    },
    
    generateSessionId() {
      return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
    },
    
    async sendMessage(message, sessionId, language = 'en') {
      if (!this.supabase) {
        console.error('Supabase client not initialized');
        return {
          message: TRANSLATIONS[language]?.errorMessage || TRANSLATIONS.en.errorMessage,
          language
        };
      }
      
      try {
        // Save user message to Supabase
        await this.supabase.from('messages').insert({
          text: message,
          session_id: sessionId,
          sender: 'user',
          language
        });
        
        // Simple keyword matching for demo purposes
        const lowerMessage = message.toLowerCase();
        
        // Check for price-related questions
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || 
            lowerMessage.includes('стоимость') || lowerMessage.includes('цена') ||
            lowerMessage.includes('prezzo') || lowerMessage.includes('costo') ||
            lowerMessage.includes('preis') || lowerMessage.includes('kosten') ||
            lowerMessage.includes('prix') || lowerMessage.includes('coût') ||
            lowerMessage.includes('precio') || lowerMessage.includes('costo')) {
          return {
            message: 'The Garda Racing experience costs €199 per person, all inclusive.',
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
        
        // Default response
        return {
          message: 'Thank you for your message! 😊 For specific questions, call us at +39 345 678 9012 or email info@gardaracing.com',
          suggestions: DEFAULT_QUICK_REPLIES[language] || DEFAULT_QUICK_REPLIES.en,
          language
        };
      } catch (error) {
        console.error('Error sending message:', error);
        return {
          message: TRANSLATIONS[language]?.errorMessage || TRANSLATIONS.en.errorMessage,
          language
        };
      }
    }
  };

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
      
      button.addEventListener('click', () => this.toggleChat());
      this.container.appendChild(button);
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
            <p>${TRANSLATIONS[this.config.language]?.online || TRANSLATIONS.en.online}</p>
          </div>
        </div>
        <button class="garda-chat-widget-header-close" aria-label="Close chat">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
      
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