import { supabase } from './supabase';
import { useTranslation } from 'react-i18next';

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  session_id?: string;
  language?: string;
}

export interface ChatResponse {
  message: string;
  suggestions?: string[];
  language: string;
}

// Мультиязычные FAQ ответы
const MULTILINGUAL_FAQ_RESPONSES: Record<string, Record<string, ChatResponse>> = {
  // Английский
  en: {
    price: {
      message: 'The Garda Racing experience costs €199 per person.',
      suggestions: ['What\'s included?', 'Do I need experience?', 'How to book?'],
      language: 'en',
    },
    group: {
      message: 'Perfect for groups! 👥 We offer discounts for 6+ people and special corporate packages.',
      suggestions: ['Corporate events?', 'Team building?', 'Private charters?'],
      language: 'en',
    },
    weather: {
      message: 'We monitor Lake Garda weather conditions daily. In case of unsafe weather, we will reschedule your booking or provide a full refund.',
      suggestions: ['Is there a weather policy?', 'What if it rains?', 'Can I reschedule?'],
      language: 'en',
    },
  },
  // Русский
  ru: {
    price: {
      message: 'Стоимость участия — €199 на человека.',
      suggestions: ['Что включено?', 'Нужен ли опыт?', 'Как забронировать?'],
      language: 'ru',
    },
    group: {
      message: 'Отлично для групп! Мы предлагаем скидки для 6+ человек и специальные корпоративные пакеты.',
      suggestions: ['Корпоративные события?', 'Тимбилдинг?', 'Частные чартеры?'],
      language: 'ru',
    },
    weather: {
      message: 'Мы ежедневно следим за погодой на озере Гарда. При неблагоприятных условиях бронирование можно перенести или получить полный возврат средств.',
      suggestions: ['Есть ли политика погоды?', 'Что если пойдет дождь?', 'Можно ли перенести?'],
      language: 'ru',
    },
  },
  // Испанский
  es: {
    price: {
      message: 'La experiencia Garda Racing cuesta €199 por persona.',
      suggestions: ['¿Qué está incluido?', '¿Necesito experiencia?', '¿Cómo reservar?'],
      language: 'es',
    },
    group: {
      message: '¡Excelente para grupos! Ofrecemos descuentos para 6+ personas y paquetes corporativos especiales.',
      suggestions: ['¿Eventos corporativos?', '¿Team building?', '¿Charters privados?'],
      language: 'es',
    },
    weather: {
      message: 'Monitoreamos las condiciones climáticas del lago Garda diariamente. En caso de mal tiempo, reprogramaremos tu reserva o te daremos un reembolso completo.',
      suggestions: ['¿Hay política de clima?', '¿Y si llueve?', '¿Puedo reprogramar?'],
      language: 'es',
    },
  },
  // Французский
  fr: {
    price: {
      message: 'L’expérience Garda Racing coûte 199€ par personne.',
      suggestions: ['Qu\'est-ce qui est inclus ?', 'Avez-vous besoin d\'expérience ?', 'Comment réserver ?'],
      language: 'fr',
    },
    group: {
      message: 'Idéal pour les groupes ! Nous proposons des réductions pour 6+ personnes.',
      suggestions: ['Événements professionnels ?', 'Activités team building ?', 'Charte privé ?'],
      language: 'fr',
    },
    weather: {
      message: 'Nous surveillons quotidiennement les conditions météo du lac de Garde. En cas de mauvais temps, nous reporterons votre réservation ou vous rembourserons intégralement.',
      suggestions: ['Politique météorologique ?', 'Et s’il pleut ?', 'Peut-on reporter ?'],
      language: 'fr',
    },
  },
  // Итальянский
  it: {
    price: {
      message: 'L’esperienza Garda Racing costa 199€ a persona.',
      suggestions: ['Cosa è incluso?', 'Serve esperienza?', 'Come prenotare?'],
      language: 'it',
    },
    group: {
      message: 'Perfetto per gruppi! Offriamo sconti per 6+ persone e pacchetti aziendali speciali.',
      suggestions: ['Eventi aziendali?', 'Team building?', 'Charter privati?'],
      language: 'it',
    },
    weather: {
      message: 'Monitoriamo quotidianamente le condizioni meteo del Lago di Garda. In caso di condizioni avverse, riprogrammeremo la tua prenotazione o ti rimborseremo completamente.',
      suggestions: ['C\'è una politica meteo?', 'E se piove?', 'Posso posticipare?'],
      language: 'it',
    },
  },
};

// Дефолтные ответы для каждого языка
const DEFAULT_RESPONSES: Record<string, ChatResponse> = {
  en: {
    message: 'Thank you for your message! 😊 For specific questions, call us at +39 345 678 9012 or email info@gardaracing.com',
    suggestions: ['What\'s included?', 'Do I need experience?', 'How do I book?'],
    language: 'en',
  },
  ru: {
    message: 'Спасибо за ваше сообщение! Для уточнений звоните +39 345 678 9012 или пишите info@gardaracing.com',
    suggestions: ['Что включено?', 'Нужен ли опыт?', 'Как забронировать?'],
    language: 'ru',
  },
  es: {
    message: '¡Gracias por tu mensaje! Para preguntas específicas, llámanos al +39 345 678 9012 o envía un correo a info@gardaracing.com',
    suggestions: ['¿Qué está incluido?', '¿Necesito experiencia?', '¿Cómo reservar?'],
    language: 'es',
  },
  fr: {
    message: 'Merci pour votre message ! Pour toute question, appelez-nous au +39 345 678 9012 ou envoyez un e-mail à info@gardaracing.com',
    suggestions: ['Que comprend le prix ?', 'Est-ce que je dois avoir de l’expérience ?', 'Comment réserver ?'],
    language: 'fr',
  },
  it: {
    message: 'Grazie per il tuo messaggio! Per domande specifiche chiama il +39 345 678 9012 o scrivi a info@gardaracing.com',
    suggestions: ['Cosa include?', 'Devo avere esperienza?', 'Come prenoto?'],
    language: 'it',
  },
};

export const chatService = {
  /**
   * Отправляет сообщение пользователя и возвращает ответ от бота
   */
  async sendMessage(
    message: string,
    sessionId?: string,
    language: string = 'en'
  ): Promise<ChatResponse> {
    // Если язык не поддерживается — используем английский
    if (!MULTILINGUAL_FAQ_RESPONSES[language]) {
      language = 'en';
    }

    // Сохраняем сообщение пользователя в Supabase
    if (sessionId) {
      const { error } = await supabase.from('messages').insert({
        text: message,
        session_id: sessionId,
        sender: 'user',
        language,
      });

      if (error) {
        console.error('Error saving user message:', error);
      }
    }

    // Определяем язык, если не указан
    const detectedLanguage = this.detectLanguage(message);

    // Используем определенный язык, если он есть
    const responseLang = MULTILINGUAL_FAQ_RESPONSES[detectedLanguage] ? detectedLanguage : language;

    // Подбор по ключевым словам
    const lowerMessage = message.toLowerCase();

    // Поиск совпадений
    const responseKey = Object.keys(MULTILINGUAL_FAQ_RESPONSES[responseLang] || {});
    for (const key of responseKey) {
      const keywords = MULTILINGUAL_FAQ_RESPONSES[responseLang][key].message
        .split(' ')
        .filter((word) => word.startsWith('[') && word.endsWith(']') && word.length > 2)
        .map((word) => word.slice(1, -1));

      const hasMatch = keywords.some((keyword) =>
        lowerMessage.includes(keyword.toLowerCase())
      );

      if (hasMatch) {
        return MULTILINGUAL_FAQ_RESPONSES[responseLang][key];
      }
    }

    // Если нет совпадения — вернуть стандартный ответ
    return DEFAULT_RESPONSES[responseLang] || DEFAULT_RESPONSES.en;
  },

  /**
   * Проверяет наличие ключевых слов в сообщении
   */
  matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some((keyword) => message.toLowerCase().includes(keyword.toLowerCase()));
  },

  /**
   * Генерирует уникальный ID для сессии
   */
  generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  },

  /**
   * Возвращает быстрые ответы по языку
   */
  getQuickReplies(language: string = 'en'): string[] {
    return (
      DEFAULT_RESPONSES[language]?.suggestions ||
      DEFAULT_RESPONSES.en?.suggestions ||
      []
    );
  },

  /**
   * Простая эвристика для определения языка сообщения
   */
  detectLanguage(message: string): string {
    const lowerMessage = message.toLowerCase();
    if (/[а-яА-ЯёЁ]/.test(message)) return 'ru';
    if (/\b(ciao|grazie|come|sono|per)\b|[àèéìòù]/.test(lowerMessage)) return 'it';
    if (/\b(ich|bin|und|für|das|ist)\b|[äöüß]/.test(lowerMessage)) return 'de';
    if (/\b(je|suis|vous|pour|et|est)\b|[éèêëàâçùûüÿ]/.test(lowerMessage)) return 'fr';
    if (/\b(hola|gracias|como|por|para|es)\b|[áéíóúñ¿¡]/.test(lowerMessage)) return 'es';
    return 'en'; // дефолт английский
  },
};