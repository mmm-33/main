import { supabase } from './supabase';

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

const MULTILINGUAL_FAQ_RESPONSES: Record<string, Record<string, ChatResponse>> = {
  en: {
    price: {
      message: "Our kitesurfing lesson costs 130€ per person. This includes all equipment and a certified instructor.",
      suggestions: ["What's included in the lesson?", "Do you offer group discounts?"],
      language: "en",
    },
    included: {
      message: "The lesson includes all the equipment: kite, board, wetsuit, harness, and a certified instructor.",
      suggestions: ["How much does it cost?", "What if I have my own equipment?"],
      language: "en",
    },
    experience: {
      message: "No worries! Our lessons are perfect for beginners. Our instructors will guide you every step of the way.",
      suggestions: ["How long is the lesson?", "Where are you located?"],
      language: "en",
    },
    weather: {
      message: "We always monitor the weather. If the conditions are unsafe, we’ll reschedule your lesson at no extra cost.",
      suggestions: ["What if it rains?", "Can I get a refund?"],
      language: "en",
    },
    booking: {
      message: "You can book a lesson directly through our website or contact us via WhatsApp for more options.",
      suggestions: ["Can I pay online?", "Do you have availability this weekend?"],
      language: "en",
    },
    group: {
      message: "Yes! We offer group lessons and corporate packages. Contact us to customize your experience.",
      suggestions: ["Is there a discount for groups?", "Can we book a private instructor?"],
      language: "en",
    },
  },
  ru: {
    price: {
      message: "Наш урок по кайтсерфингу стоит 130€ с человека. В стоимость входит всё оборудование и инструктор.",
      suggestions: ["Что включено в урок?", "Есть ли скидки на группу?"],
      language: "ru",
    },
    included: {
      message: "Урок включает всё оборудование: кайт, доску, гидрокостюм, трапецию и инструктора.",
      suggestions: ["Сколько это стоит?", "А если у меня есть своё оборудование?"],
      language: "ru",
    },
    experience: {
      message: "Не переживайте! Наши уроки идеально подходят для новичков. Инструктор поможет вам на каждом этапе.",
      suggestions: ["Сколько длится урок?", "Где вы находитесь?"],
      language: "ru",
    },
    weather: {
      message: "Мы следим за погодой. Если условия небезопасны, мы бесплатно перенесем ваш урок.",
      suggestions: ["А если будет дождь?", "Можно вернуть деньги?"],
      language: "ru",
    },
    booking: {
      message: "Вы можете забронировать урок через наш сайт или написать нам в WhatsApp.",
      suggestions: ["Можно оплатить онлайн?", "Есть ли места на выходных?"],
      language: "ru",
    },
    group: {
      message: "Да, мы предлагаем групповые и корпоративные уроки. Свяжитесь с нами для деталей.",
      suggestions: ["Есть скидка на группу?", "Можно ли заказать частного инструктора?"],
      language: "ru",
    },
  },
};

const DEFAULT_RESPONSES: Record<string, ChatResponse> = {
  en: {
    message: "I'm not sure I understand. Can you please rephrase your question?",
    suggestions: ["How much is a lesson?", "What do I need to bring?", "How do I book?"],
    language: "en",
  },
  ru: {
    message: "Я не совсем понял. Можете переформулировать вопрос?",
    suggestions: ["Сколько стоит урок?", "Что нужно брать с собой?", "Как забронировать?"],
    language: "ru",
  },
};

export const chatService = {
  async sendMessage(message: string, sessionId?: string, language: string = 'en'): Promise<ChatResponse> {
    if (!MULTILINGUAL_FAQ_RESPONSES[language]) {
      language = 'en';
    }

    const lowerMessage = message.toLowerCase();

    if (sessionId) {
      await supabase.from('messages').insert({
        text: message,
        session_id: sessionId,
        sender: 'user',
        language,
      });
    }

    let key: string | null = null;

    const keywordMap: Record<string, string[]> = {
      price: ['price', 'cost', 'euro', '€', 'money', 'how much'],
      included: ['included', 'what is included', 'package', 'offer', 'equipment'],
      experience: ['experience', 'no experience', 'beginner', 'skill', 'first time'],
      weather: ['weather', 'rain', 'wind', 'cancel', 'reschedule', 'conditions'],
      booking: ['book', 'booking', 'reserve', 'how to book', 'reservation'],
      group: ['group', 'corporate', 'team', 'friends', 'event', 'discount'],
    };

    for (const [k, keywords] of Object.entries(keywordMap)) {
      if (keywords.some((word) => lowerMessage.includes(word))) {
        key = k;
        break;
      }
    }

    let reply: ChatResponse;

    if (key && MULTILINGUAL_FAQ_RESPONSES[language][key]) {
      reply = MULTILINGUAL_FAQ_RESPONSES[language][key];
    } else {
      reply = DEFAULT_RESPONSES[language];
    }

    if (sessionId) {
      await supabase.from('messages').insert({
        text: reply.message,
        session_id: sessionId,
        sender: 'bot',
        language: reply.language,
      });
    }

    return reply;
  },

  getQuickReplies(language: string = 'en'): string[] {
    if (DEFAULT_RESPONSES[language]) {
      return DEFAULT_RESPONSES[language].suggestions ?? [];
    }
    return DEFAULT_RESPONSES['en'].suggestions ?? [];
  },
};

