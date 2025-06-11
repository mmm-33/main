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
  'en': {
    'price': {
      message: 'Our yacht racing experience costs €199 per person and includes professional skipper, all equipment, racing medal, certificate, and professional photos. This is excellent value for a full day of authentic yacht racing on beautiful Lake Garda! 🛥️',
      suggestions: ['What\'s included?', 'How to book?', 'Group discounts?'],
      language: 'en'
    },
    'included': {
      message: 'The €199 package includes: ⛵ Professional skipper & instruction, 🦺 All safety equipment, 🏆 Racing medal & certificate, 📸 Professional photos & videos, 🥪 Light refreshments, and full racing experience with multiple races!',
      suggestions: ['Do I need experience?', 'What to bring?', 'Weather policy?'],
      language: 'en'
    },
    'experience': {
      message: 'No sailing experience required! Our certified skippers provide complete instruction. We welcome absolute beginners - you\'ll learn basic sailing, participate in real races, and leave feeling like a champion! 🏆',
      suggestions: ['What\'s the schedule?', 'How many people per boat?', 'Age requirements?'],
      language: 'en'
    },
    'weather': {
      message: 'We sail in most conditions! Lake Garda has excellent sailing weather with consistent thermal winds. If it\'s unsafe, we\'ll reschedule at no cost. Light rain doesn\'t stop us - it\'s part of the adventure! ⛈️',
      suggestions: ['Cancellation policy?', 'What to wear?', 'Best season?'],
      language: 'en'
    },
    'booking': {
      message: 'Easy booking! 📱 Book online at our website, 📞 call +39 345 678 9012, or 📧 email info@gardaracing.com. We recommend booking 2-3 days in advance, especially during peak season (June-September).',
      suggestions: ['Available dates?', 'Group bookings?', 'Payment options?'],
      language: 'en'
    },
    'group': {
      message: 'Great for groups! 👥 We offer discounts for 6+ people and special corporate packages. Each yacht accommodates up to 8 participants. Perfect for team building, celebrations, or family adventures!',
      suggestions: ['Corporate events?', 'Team building?', 'Private charters?'],
      language: 'en'
    }
  },
  
  // Русский
  'ru': {
    'price': {
      message: 'Наш опыт яхтенных гонок стоит €199 с человека и включает профессионального шкипера, всё оборудование, гоночную медаль, сертификат и профессиональные фото. Это отличная цена за полный день подлинных яхтенных гонок на прекрасном озере Гарда! 🛥️',
      suggestions: ['Что включено?', 'Как забронировать?', 'Групповые скидки?'],
      language: 'ru'
    },
    'included': {
      message: 'Пакет за €199 включает: ⛵ Профессионального шкипера и обучение, 🦺 Всё оборудование безопасности, 🏆 Гоночную медаль и сертификат, 📸 Профессиональные фото и видео, 🥪 Лёгкие закуски и полный гоночный опыт с несколькими гонками!',
      suggestions: ['Нужен ли опыт?', 'Что взять с собой?', 'Политика погоды?'],
      language: 'ru'
    },
    'experience': {
      message: 'Опыт парусного спорта не требуется! Наши сертифицированные шкиперы обеспечивают полное обучение. Мы приветствуем абсолютных новичков - вы изучите основы парусного спорта, поучаствуете в настоящих гонках и уйдёте, чувствуя себя чемпионом! 🏆',
      suggestions: ['Какое расписание?', 'Сколько человек на лодке?', 'Возрастные требования?'],
      language: 'ru'
    },
    'weather': {
      message: 'Мы плаваем в большинстве условий! Озеро Гарда имеет отличную погоду для парусного спорта с постоянными термическими ветрами. Если небезопасно, мы перенесём без дополнительной платы. Лёгкий дождь нас не останавливает - это часть приключения! ⛈️',
      suggestions: ['Политика отмены?', 'Что надеть?', 'Лучший сезон?'],
      language: 'ru'
    },
    'booking': {
      message: 'Лёгкое бронирование! 📱 Бронируйте онлайн на нашем сайте, 📞 звоните +39 345 678 9012, или 📧 пишите info@gardaracing.com. Рекомендуем бронировать за 2-3 дня, особенно в пиковый сезон (июнь-сентябрь).',
      suggestions: ['Доступные даты?', 'Групповые бронирования?', 'Варианты оплаты?'],
      language: 'ru'
    },
    'group': {
      message: 'Отлично для групп! 👥 Мы предлагаем скидки для 6+ человек и специальные корпоративные пакеты. Каждая яхта вмещает до 8 участников. Идеально для тимбилдинга, празднований или семейных приключений!',
      suggestions: ['Корпоративные события?', 'Тимбилдинг?', 'Частные чартеры?'],
      language: 'ru'
    }
  },

  // Итальянский
  'it': {
    'price': {
      message: 'La nostra esperienza di regata costa €199 a persona e include skipper professionale, tutta l\'attrezzatura, medaglia di regata, certificato e foto professionali. È un ottimo valore per una giornata completa di autentiche regate sul bellissimo Lago di Garda! 🛥️',
      suggestions: ['Cosa è incluso?', 'Come prenotare?', 'Sconti di gruppo?'],
      language: 'it'
    },
    'included': {
      message: 'Il pacchetto €199 include: ⛵ Skipper professionale e istruzione, 🦺 Tutta l\'attrezzatura di sicurezza, 🏆 Medaglia di regata e certificato, 📸 Foto e video professionali, 🥪 Rinfreschi leggeri e esperienza di regata completa con più gare!',
      suggestions: ['Serve esperienza?', 'Cosa portare?', 'Politica meteo?'],
      language: 'it'
    },
    'experience': {
      message: 'Non serve esperienza velica! I nostri skipper certificati forniscono istruzione completa. Accogliamo principianti assoluti - imparerete le basi della vela, parteciperete a vere regate e uscirete sentendovi campioni! 🏆',
      suggestions: ['Qual è il programma?', 'Quante persone per barca?', 'Requisiti di età?'],
      language: 'it'
    },
    'weather': {
      message: 'Navighiamo nella maggior parte delle condizioni! Il Lago di Garda ha un ottimo tempo per la vela con venti termici costanti. Se non è sicuro, riprogrammeremo senza costi. La pioggia leggera non ci ferma - fa parte dell\'avventura! ⛈️',
      suggestions: ['Politica di cancellazione?', 'Cosa indossare?', 'Stagione migliore?'],
      language: 'it'
    },
    'booking': {
      message: 'Prenotazione facile! 📱 Prenota online sul nostro sito, 📞 chiama +39 345 678 9012, o 📧 scrivi a info@gardaracing.com. Consigliamo di prenotare 2-3 giorni in anticipo, specialmente durante l\'alta stagione (giugno-settembre).',
      suggestions: ['Date disponibili?', 'Prenotazioni di gruppo?', 'Opzioni di pagamento?'],
      language: 'it'
    },
    'group': {
      message: 'Perfetto per gruppi! 👥 Offriamo sconti per 6+ persone e pacchetti aziendali speciali. Ogni yacht ospita fino a 8 partecipanti. Perfetto per team building, celebrazioni o avventure familiari!',
      suggestions: ['Eventi aziendali?', 'Team building?', 'Charter privati?'],
      language: 'it'
    }
  },

  // Немецкий
  'de': {
    'price': {
      message: 'Unser Yacht-Rennerlebnis kostet €199 pro Person und beinhaltet professionellen Skipper, alle Ausrüstung, Rennmedaille, Zertifikat und professionelle Fotos. Das ist ein ausgezeichneter Wert für einen ganzen Tag authentischer Yacht-Rennen auf dem wunderschönen Gardasee! 🛥️',
      suggestions: ['Was ist enthalten?', 'Wie buchen?', 'Gruppenrabatte?'],
      language: 'de'
    },
    'included': {
      message: 'Das €199 Paket beinhaltet: ⛵ Professioneller Skipper & Unterricht, 🦺 Alle Sicherheitsausrüstung, 🏆 Rennmedaille & Zertifikat, 📸 Professionelle Fotos & Videos, 🥪 Leichte Erfrischungen und vollständiges Rennerlebnis mit mehreren Rennen!',
      suggestions: ['Brauche ich Erfahrung?', 'Was mitbringen?', 'Wetter-Politik?'],
      language: 'de'
    },
    'experience': {
      message: 'Keine Segelerfahrung erforderlich! Unsere zertifizierten Skipper bieten vollständigen Unterricht. Wir begrüßen absolute Anfänger - Sie lernen Segel-Grundlagen, nehmen an echten Rennen teil und gehen als Champion! 🏆',
      suggestions: ['Wie ist der Zeitplan?', 'Wie viele Personen pro Boot?', 'Altersanforderungen?'],
      language: 'de'
    },
    'weather': {
      message: 'Wir segeln bei den meisten Bedingungen! Der Gardasee hat ausgezeichnetes Segelwetter mit konstanten thermischen Winden. Wenn unsicher, verschieben wir kostenlos. Leichter Regen stoppt uns nicht - es ist Teil des Abenteuers! ⛈️',
      suggestions: ['Stornierungsrichtlinie?', 'Was anziehen?', 'Beste Saison?'],
      language: 'de'
    },
    'booking': {
      message: 'Einfache Buchung! 📱 Online auf unserer Website buchen, 📞 anrufen +39 345 678 9012, oder 📧 E-Mail an info@gardaracing.com. Wir empfehlen 2-3 Tage im Voraus zu buchen, besonders in der Hochsaison (Juni-September).',
      suggestions: ['Verfügbare Termine?', 'Gruppenbuchungen?', 'Zahlungsoptionen?'],
      language: 'de'
    },
    'group': {
      message: 'Großartig für Gruppen! 👥 Wir bieten Rabatte für 6+ Personen und spezielle Firmenpakete. Jede Yacht fasst bis zu 8 Teilnehmer. Perfekt für Teambuilding, Feiern oder Familienabenteuer!',
      suggestions: ['Firmenevents?', 'Teambuilding?', 'Private Charter?'],
      language: 'de'
    }
  },

  // Французский
  'fr': {
    'price': {
      message: 'Notre expérience de course de yacht coûte €199 par personne et inclut skipper professionnel, tout l\'équipement, médaille de course, certificat et photos professionnelles. C\'est une excellente valeur pour une journée complète de courses authentiques sur le magnifique lac de Garde! 🛥️',
      suggestions: ['Qu\'est-ce qui est inclus?', 'Comment réserver?', 'Remises de groupe?'],
      language: 'fr'
    },
    'included': {
      message: 'Le forfait €199 inclut: ⛵ Skipper professionnel et instruction, 🦺 Tout l\'équipement de sécurité, 🏆 Médaille de course et certificat, 📸 Photos et vidéos professionnelles, 🥪 Rafraîchissements légers et expérience de course complète avec plusieurs courses!',
      suggestions: ['Ai-je besoin d\'expérience?', 'Que apporter?', 'Politique météo?'],
      language: 'fr'
    },
    'experience': {
      message: 'Aucune expérience de voile requise! Nos skippers certifiés fournissent une instruction complète. Nous accueillons les débutants absolus - vous apprendrez les bases de la voile, participerez à de vraies courses et repartirez en champion! 🏆',
      suggestions: ['Quel est le programme?', 'Combien de personnes par bateau?', 'Exigences d\'âge?'],
      language: 'fr'
    },
    'weather': {
      message: 'Nous naviguons dans la plupart des conditions! Le lac de Garde a un excellent temps de voile avec des vents thermiques constants. Si dangereux, nous reporterons sans frais. La pluie légère ne nous arrête pas - c\'est partie de l\'aventure! ⛈️',
      suggestions: ['Politique d\'annulation?', 'Que porter?', 'Meilleure saison?'],
      language: 'fr'
    },
    'booking': {
      message: 'Réservation facile! 📱 Réservez en ligne sur notre site, 📞 appelez +39 345 678 9012, ou 📧 email info@gardaracing.com. Nous recommandons de réserver 2-3 jours à l\'avance, surtout en haute saison (juin-septembre).',
      suggestions: ['Dates disponibles?', 'Réservations de groupe?', 'Options de paiement?'],
      language: 'fr'
    },
    'group': {
      message: 'Parfait pour les groupes! 👥 Nous offrons des remises pour 6+ personnes et des forfaits d\'entreprise spéciaux. Chaque yacht accueille jusqu\'à 8 participants. Parfait pour team building, célébrations ou aventures familiales!',
      suggestions: ['Événements d\'entreprise?', 'Team building?', 'Charters privés?'],
      language: 'fr'
    }
  },

  // Испанский
  'es': {
    'price': {
      message: 'Nuestra experiencia de regata de yate cuesta €199 por persona e incluye patrón profesional, todo el equipo, medalla de regata, certificado y fotos profesionales. ¡Es un excelente valor por un día completo de regatas auténticas en el hermoso Lago de Garda! 🛥️',
      suggestions: ['¿Qué está incluido?', '¿Cómo reservar?', '¿Descuentos de grupo?'],
      language: 'es'
    },
    'included': {
      message: 'El paquete de €199 incluye: ⛵ Patrón profesional e instrucción, 🦺 Todo el equipo de seguridad, 🏆 Medalla de regata y certificado, 📸 Fotos y videos profesionales, 🥪 Refrigerios ligeros y experiencia completa de regata con múltiples carreras!',
      suggestions: ['¿Necesito experiencia?', '¿Qué traer?', '¿Política del clima?'],
      language: 'es'
    },
    'experience': {
      message: '¡No se requiere experiencia en vela! Nuestros patrones certificados proporcionan instrucción completa.  Damos la bienvenida a principiantes absolutos - aprenderás los fundamentos de la vela, participarás en regatas reales y te irás sintiéndote como un campeón! 🏆',
      suggestions: ['¿Cuál es el horario?', '¿Cuántas personas por barco?', '¿Requisitos de edad?'],
      language: 'es'
    },
    'weather': {
      message: '¡Navegamos en la mayoría de las condiciones! El Lago de Garda tiene excelente clima para navegar con vientos térmicos constantes. Si no es seguro, reprogramaremos sin costo. La lluvia ligera no nos detiene - ¡es parte de la aventura! ⛈️',
      suggestions: ['¿Política de cancelación?', '¿Qué vestir?', '¿Mejor temporada?'],
      language: 'es'
    },
    'booking': {
      message: '¡Reserva fácil! 📱 Reserva en línea en nuestro sitio web, 📞 llama al +39 345 678 9012, o 📧 email a info@gardaracing.com. Recomendamos reservar con 2-3 días de anticipación, especialmente en temporada alta (junio-septiembre).',
      suggestions: ['¿Fechas disponibles?', '¿Reservas de grupo?', '¿Opciones de pago?'],
      language: 'es'
    },
    'group': {
      message: '¡Excelente para grupos! 👥 Ofrecemos descuentos para 6+ personas y paquetes corporativos especiales. Cada yate acomoda hasta 8 participantes. ¡Perfecto para team building, celebraciones o aventuras familiares!',
      suggestions: ['¿Eventos corporativos?', '¿Team building?', '¿Charters privados?'],
      language: 'es'
    }
  }
};

// Дефолтные ответы для каждого языка
const DEFAULT_RESPONSES: Record<string, ChatResponse> = {
  'en': {
    message: 'Thank you for your message! 😊 For specific questions, please call us at +39 345 678 9012 or email info@gardaracing.com. Our team will be happy to help!',
    suggestions: ['What\'s included?', 'Do I need experience?', 'How to book?'],
    language: 'en'
  },
  'ru': {
    message: 'Спасибо за ваше сообщение! 😊 Для конкретных вопросов, пожалуйста, позвоните нам по номеру +39 345 678 9012 или напишите на info@gardaracing.com. Наша команда будет рада помочь!',
    suggestions: ['Что включено?', 'Нужен ли опыт?', 'Как забронировать?'],
    language: 'ru'
  },
  'it': {
    message: 'Grazie per il tuo messaggio! 😊 Per domande specifiche, chiamaci al +39 345 678 9012 o scrivi a info@gardaracing.com. Il nostro team sarà felice di aiutarti!',
    suggestions: ['Cosa è incluso?', 'Serve esperienza?', 'Come prenotare?'],
    language: 'it'
  },
  'de': {
    message: 'Vielen Dank für Ihre Nachricht! 😊 Für spezifische Fragen rufen Sie uns bitte unter +39 345 678 9012 an oder schreiben Sie an info@gardaracing.com. Unser Team hilft Ihnen gerne weiter!',
    suggestions: ['Was ist enthalten?', 'Brauche ich Erfahrung?', 'Wie buche ich?'],
    language: 'de'
  },
  'fr': {
    message: 'Merci pour votre message! 😊 Pour des questions spécifiques, veuillez nous appeler au +39 345 678 9012 ou envoyer un email à info@gardaracing.com. Notre équipe sera heureuse de vous aider!',
    suggestions: ['Qu\'est-ce qui est inclus?', 'Ai-je besoin d\'expérience?', 'Comment réserver?'],
    language: 'fr'
  },
  'es': {
    message: '¡Gracias por tu mensaje! 😊 Para preguntas específicas, llámanos al +39 345 678 9012 o envía un correo a info@gardaracing.com. ¡Nuestro equipo estará encantado de ayudarte!',
    suggestions: ['¿Qué está incluido?', '¿Necesito experiencia?', '¿Cómo reservar?'],
    language: 'es'
  }
};

export const chatService = {
  async sendMessage(message: string, sessionId?: string, language: string = 'en'): Promise<ChatResponse> {
    // Проверяем, поддерживается ли язык
    if (!MULTILINGUAL_FAQ_RESPONSES[language]) {
      language = 'en'; // Дефолтный язык, если указанный не поддерживается
    }

    // Store user message
    if (sessionId) {
      await supabase.from('messages').insert({
        text: message,
        session_id: sessionId,
        sender: 'user',
        language: language
      });
    }

    // Enhanced keyword matching
    const lowerMessage = message.toLowerCase();
    let response: ChatResponse;

    // Price-related keywords
    if (this.matchesKeywords(lowerMessage, [
      'price', 'cost', '€', 'euro', 'money', 'expensive', 'cheap',
      'цена', 'стоимость', 'евро', 'деньги', 'дорого', 'дешево',
      'prezzo', 'costo', 'soldi', 'costoso', 'economico',
      'preis', 'kosten', 'geld', 'teuer', 'billig',
      'prix', 'coût', 'argent', 'cher', 'pas cher',
      'precio', 'costo', 'dinero', 'caro', 'barato'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].price;
    }
    // Package contents
    else if (this.matchesKeywords(lowerMessage, [
      'include', 'package', 'what', 'contain',
      'включено', 'пакет', 'что', 'содержит',
      'incluso', 'pacchetto', 'cosa', 'contiene',
      'enthalten', 'paket', 'was', 'beinhaltet',
      'inclus', 'forfait', 'quoi', 'contient',
      'incluido', 'paquete', 'qué', 'contiene'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].included;
    }
    // Experience level
    else if (this.matchesKeywords(lowerMessage, [
      'experience', 'beginner', 'learn', 'know', 'skill',
      'опыт', 'начинающий', 'учиться', 'знать', 'навык',
      'esperienza', 'principiante', 'imparare', 'conoscere', 'abilità',
      'erfahrung', 'anfänger', 'lernen', 'wissen', 'fähigkeit',
      'expérience', 'débutant', 'apprendre', 'savoir', 'compétence',
      'experiencia', 'principiante', 'aprender', 'saber', 'habilidad'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].experience;
    }
    // Weather conditions
    else if (this.matchesKeywords(lowerMessage, [
      'weather', 'rain', 'wind', 'sun', 'storm',
      'погода', 'дождь', 'ветер', 'солнце', 'шторм',
      'tempo', 'pioggia', 'vento', 'sole', 'tempesta',
      'wetter', 'regen', 'wind', 'sonne', 'sturm',
      'météo', 'pluie', 'vent', 'soleil', 'tempête',
      'clima', 'lluvia', 'viento', 'sol', 'tormenta'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].weather;
    }
    // Booking process
    else if (this.matchesKeywords(lowerMessage, [
      'book', 'reserve', 'how', 'when', 'schedule',
      'бронировать', 'резервировать', 'как', 'когда', 'расписание',
      'prenotare', 'riservare', 'come', 'quando', 'programma',
      'buchen', 'reservieren', 'wie', 'wann', 'zeitplan',
      'réserver', 'comment', 'quand', 'horaire',
      'reservar', 'cómo', 'cuándo', 'horario'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].booking;
    }
    // Group bookings
    else if (this.matchesKeywords(lowerMessage, [
      'group', 'discount', 'corporate', 'team', 'family',
      'группа', 'скидка', 'корпоратив', 'команда', 'семья',
      'gruppo', 'sconto', 'aziendale', 'squadra', 'famiglia',
      'gruppe', 'rabatt', 'firmen', 'team', 'familie',
      'groupe', 'remise', 'entreprise', 'équipe', 'famille',
      'grupo', 'descuento', 'corporativo', 'equipo', 'familia'
    ])) {
      response = MULTILINGUAL_FAQ_RESPONSES[language].group;
    }
    else {
      // Default response
      response = DEFAULT_RESPONSES[language] || DEFAULT_RESPONSES.en;
    }

    // Store bot response
    if (sessionId) {
      await supabase.from('messages').insert({
        text: response.message,
        session_id: sessionId,
        sender: 'bot',
        language: language
      });
    }

    return response;
  },

  // Определение языка сообщения
  detectLanguage(message: string): string {
    // Простая эвристика для определения языка
    // В реальном приложении лучше использовать библиотеку для определения языка
    
    // Кириллица (русский)
    if (/[а-яА-ЯёЁ]/.test(message)) {
      return 'ru';
    }
    
    // Итальянский (проверка на характерные слова и символы)
    if (/\b(ciao|grazie|come|sono|per)\b|[àèéìòù]/.test(message.toLowerCase())) {
      return 'it';
    }
    
    // Немецкий (проверка на характерные слова и символы)
    if (/\b(ich|bin|und|für|das|ist)\b|[äöüß]/.test(message.toLowerCase())) {
      return 'de';
    }
    
    // Французский (проверка на характерные слова и символы)
    if (/\b(je|suis|vous|pour|et|est)\b|[éèêëàâçùûüÿ]/.test(message.toLowerCase())) {
      return 'fr';
    }
    
    // Испанский (проверка на характерные слова и символы)
    if (/\b(hola|gracias|como|por|para|es)\b|[áéíóúñ¿¡]/.test(message.toLowerCase())) {
      return 'es';
    }
    
    // По умолчанию английский
    return 'en';
  },

  // Helper method for keyword matching
  matchesKeywords(message: string, keywords: string[]): boolean {
    return keywords.some(keyword => message.includes(keyword.toLowerCase()));
  },

  generateSessionId(): string {
    return `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  // Get quick replies based on language
  getQuickReplies(language: string = 'en'): string[] {
    const quickReplies = {
      'en': [
        "What's included in the €199 package?",
        "Do I need sailing experience?",
        "How do I book?",
        "Weather policy?",
        "Group discounts available?"
      ],
      'ru': [
        "Что включено в пакет за €199?",
        "Нужен ли мне опыт парусного спорта?",
        "Как забронировать?",
        "Политика погоды?",
        "Доступны ли групповые скидки?"
      ],
      'it': [
        "Cosa è incluso nel pacchetto da €199?",
        "Ho bisogno di esperienza velica?",
        "Come prenoto?",
        "Politica meteo?",
        "Sconti di gruppo disponibili?"
      ],
      'de': [
        "Was ist im €199-Paket enthalten?",
        "Brauche ich Segelerfahrung?",
        "Wie buche ich?",
        "Wetter-Politik?",
        "Gruppenrabatte verfügbar?"
      ],
      'fr': [
        "Qu'est-ce qui est inclus dans le forfait de €199?",
        "Ai-je besoin d'expérience en voile?",
        "Comment réserver?",
        "Politique météo?",
        "Remises de groupe disponibles?"
      ],
      'es': [
        "¿Qué está incluido en el paquete de €199?",
        "¿Necesito experiencia en vela?",
        "¿Cómo reservo?",
        "¿Política de clima?",
        "¿Descuentos de grupo disponibles?"
      ]
    };
    
    return quickReplies[language as keyof typeof quickReplies] || quickReplies.en;
  }
};