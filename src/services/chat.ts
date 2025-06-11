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
      message: 'Our tours start from 50€. The final price depends on the package you choose.',
      suggestions: ['What’s included?', 'How do I book?', 'Do you offer group discounts?'],
      language: 'en',
    },
    included: {
      message: 'Our packages include a guide, equipment, and insurance.',
      suggestions: ['How much does it cost?', 'Can I book online?'],
      language: 'en',
    },
    experience: {
      message: 'No prior experience is necessary. Our tours are beginner-friendly!',
      suggestions: ['What’s included?', 'How do I book?'],
      language: 'en',
    },
    weather: {
      message: 'Tours may be rescheduled in case of bad weather. Safety is our priority.',
      suggestions: ['How do I reschedule?', 'Do you offer refunds?'],
      language: 'en',
    },
    booking: {
      message: 'You can book a tour directly through our website or contact us.',
      suggestions: ['How much does it cost?', 'Is equipment included?'],
      language: 'en',
    },
    group: {
      message: 'Yes, we offer group and corporate bookings with special discounts!',
      suggestions: ['How many people can join?', 'How do I get a quote?'],
      language: 'en',
    },
  },
  fr: {
    price: {
      message: 'Nos circuits commencent à partir de 50€. Le prix final dépend du forfait choisi.',
      suggestions: ['Que comprend l’offre ?', 'Comment réserver ?', 'Proposez-vous des réductions de groupe ?'],
      language: 'fr',
    },
    included: {
      message: 'Nos forfaits incluent un guide, l’équipement et une assurance.',
      suggestions: ['Quel est le prix ?', 'Puis-je réserver en ligne ?'],
      language: 'fr',
    },
    experience: {
      message: "Aucune expérience préalable n'est requise. Nos circuits conviennent aux débutants !",
      suggestions: ['Que comprend l’offre ?', 'Comment réserver ?'],
      language: 'fr',
    },
    weather: {
      message: 'Les circuits peuvent être reprogrammés en cas de mauvais temps. Votre sécurité est notre priorité.',
      suggestions: ['Comment reprogrammer ?', 'Proposez-vous des remboursements ?'],
      language: 'fr',
    },
    booking: {
      message: 'Vous pouvez réserver directement sur notre site web ou nous contacter.',
      suggestions: ['Quel est le prix ?', 'Le matériel est-il inclus ?'],
      language: 'fr',
    },
    group: {
      message: 'Oui, nous proposons des réservations de groupe et d’entreprise avec des réductions spéciales !',
      suggestions: ['Combien de personnes peuvent participer ?', 'Comment obtenir un devis ?'],
      language: 'fr',
    },
  },
  // Добавь другие языки при необходимости
};

const DEFAULT_RESPONSES: Record<string, ChatResponse> = {
  en: {
    message: "I'm sorry, I didn't understand that. Can you please rephrase?",
    suggestions: ['How much does it cost?', 'What’s included?', 'Can I book online?'],
    language: 'en',
  },
  fr: {
    message: "Désolé, je n'ai pas compris. Pouvez-vous reformuler votre question ?",
    suggestions: ['Quel est le prix ?', 'Que comprend l’offre ?', 'Puis-je réserver en ligne ?'],
    language: 'fr',
  },
};

export const chatService = {
  async sendMessage(message: string, sessionId?: string, language: string = 'en'): Promise<ChatResponse> {
    if (!MULTILINGUAL_FAQ_RESPONSES[language]) {
      language = 'en';
    }

    const lowerMessage = message.toLowerCase();

    // Сохраняем сообщение пользователя
    if (sessionId) {
      await supabase.from('messages').insert({
        text: message,
        session_id: sessionId,
        sender: 'user',
        language: language,
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
      if (keywords.some(word => lowerMessage.includes(word))) {
        key = k;
        break;
      }
    }

    let reply: ChatResponse;

    if (key && MULTILINGUAL_FAQ_RESPONSES[language][key]) {
      reply = MULTILINGUAL_FAQ_RESPONSES[language][key];
    } else {
      reply = DEFAULT_RESPONSES[language] || DEFAULT_RESPONSES['en'];
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

  matchesKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword.toLowerCase()));
  },
};

