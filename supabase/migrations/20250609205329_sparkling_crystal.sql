/*
  # Populate CMS Content for About Page

  1. Content Population
    - Add all About page content in multiple languages
    - Include story descriptions, team information, values, and differentiators
    - Support for English, Russian, Italian, German, French, and Spanish

  2. Content Structure
    - Each content piece has a unique slug
    - Language-specific versions for each slug
    - All content marked as published
*/

-- Insert About page content for all languages

-- English content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Our Story Description', 'What started as a passion project by a group of sailing enthusiasts has grown into Lake Garda''s premier yacht racing experience provider. Our journey began in 2009 when founder Marco Benedetti decided to share his love for competitive sailing with visitors from around the world.', 'The story of how Garda Racing Yacht Club began', 'en', true),

('about-beginning-description', 'The Beginning Description', 'Lake Garda has always been a sailor''s paradise, with its consistent winds and stunning Alpine backdrop. Marco, a lifelong sailor and former competitive racer, recognized that many visitors to the lake wanted to experience authentic yacht racing but lacked the opportunity.', 'How Garda Racing started on Lake Garda', 'en', true),

('about-journey-description-1', 'Journey Description Part 1', 'Starting with a single yacht and a dream, Marco began offering personalized sailing experiences that combined professional instruction with the thrill of competitive racing. Word spread quickly about these unique adventures that allowed complete beginners to experience the excitement of yacht racing.', 'The early days of Garda Racing', 'en', true),

('about-journey-description-2', 'Journey Description Part 2', 'Today, we operate a fleet of modern racing yachts and have welcomed over 2,000 guests from more than 30 countries, each leaving with unforgettable memories and a newfound appreciation for the sport of sailing.', 'Garda Racing today', 'en', true),

('about-mission-description', 'Mission Description', 'To provide authentic, safe, and unforgettable yacht racing experiences that inspire a lifelong love of sailing while showcasing the natural beauty of Lake Garda.', 'Our mission statement', 'en', true),

('about-vision-description', 'Vision Description', 'To be recognized as Europe''s premier destination for yacht racing experiences, where every guest leaves as a confident sailor with memories that last a lifetime.', 'Our vision for the future', 'en', true),

('about-milestone-2009', 'Milestone 2009', 'Founded by passionate sailor Marco Benedetti with a single yacht and a dream to share authentic racing experiences', '2009 founding milestone', 'en', true),

('about-milestone-2012', 'Milestone 2012', 'Reached our first major milestone of satisfied customers from across Europe', '2012 customer milestone', 'en', true),

('about-milestone-2015', 'Milestone 2015', 'Achieved Royal Yachting Association certification for professional sailing instruction', '2015 RYA certification', 'en', true),

('about-milestone-2018', 'Milestone 2018', 'Added modern Bavaria racing yachts to provide the ultimate sailing experience', '2018 fleet expansion', 'en', true),

('about-milestone-2020', 'Milestone 2020', 'Launched online booking platform and digital guest services', '2020 digital innovation', 'en', true),

('about-milestone-2024', 'Milestone 2024', 'Celebrating over 2000 satisfied customers from 30+ countries worldwide', '2024 achievement milestone', 'en', true),

('about-values-safety-description', 'Safety First Value', 'Your safety is our absolute priority. We maintain the highest safety standards, use only certified equipment, and conduct thorough briefings before every experience.', 'Our commitment to safety', 'en', true),

('about-values-passion-description', 'Passion Value', 'We live and breathe sailing. Our genuine passion for the sport drives everything we do, from instruction quality to creating unforgettable memories.', 'Our passion for sailing', 'en', true),

('about-values-inclusive-description', 'Inclusive Excellence Value', 'Whether you''re a complete beginner or experienced sailor, everyone is welcome. We tailor each experience to ensure everyone feels confident and engaged.', 'Our inclusive approach', 'en', true),

('about-values-authentic-description', 'Authentic Racing Value', 'We provide genuine yacht racing experiences with real competition, official timing, and meaningful recognition of achievement.', 'Our authentic racing experience', 'en', true),

('about-values-innovation-description', 'Innovation Value', 'We constantly evolve our services, incorporating the latest sailing techniques, safety protocols, and guest experience innovations.', 'Our commitment to innovation', 'en', true),

('about-team-marco-description', 'Marco Team Description', 'RYA Yachtmaster with 20+ years of sailing experience on Lake Garda. Former competitive racer turned passionate instructor.', 'Marco Benedetti bio', 'en', true),

('about-team-sofia-description', 'Sofia Team Description', 'Ensures every guest has an unforgettable experience. Multilingual hospitality expert with a passion for sailing.', 'Sofia Rossi bio', 'en', true),

('about-team-andreas-description', 'Andreas Team Description', 'Former Olympic sailor and certified sailing instructor. Brings world-class racing expertise to every experience.', 'Andreas Mueller bio', 'en', true),

('about-team-elena-description', 'Elena Team Description', 'Certified marine safety expert and sailing instructor. Ensures all experiences meet the highest safety standards.', 'Elena Bianchi bio', 'en', true),

('about-differentiators-authentic-description', 'Authentic Differentiator', 'Unlike tourist sailing trips, we offer real yacht racing with official timing, scoring, and competitive elements that create genuine excitement.', 'What makes our racing authentic', 'en', true),

('about-differentiators-professional-description', 'Professional Differentiator', 'Our RYA-certified skippers provide world-class instruction, ensuring you learn proper techniques while having fun.', 'Our professional instruction', 'en', true),

('about-differentiators-complete-description', 'Complete Package Differentiator', 'Everything included: professional photos, racing medals, certificates, safety equipment, and expert guidance.', 'Our complete experience package', 'en', true),

('about-differentiators-location-description', 'Location Differentiator', 'Lake Garda offers ideal sailing conditions with consistent thermal winds and stunning Alpine scenery.', 'Our perfect location', 'en', true),

('about-differentiators-multilingual-description', 'Multilingual Differentiator', 'Our team speaks English, Italian, German, and Russian, ensuring clear communication and comfort for all guests.', 'Our multilingual team', 'en', true),

('about-differentiators-flexible-description', 'Flexible Differentiator', 'Daily departures, weather guarantees, and flexible booking policies make planning your experience stress-free.', 'Our flexible approach', 'en', true);

-- Russian content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Описание нашей истории', 'То, что началось как проект энтузиастов парусного спорта, выросло в ведущего поставщика яхтенных гонок на озере Гарда. Наше путешествие началось в 2009 году, когда основатель Марко Бенедетти решил поделиться своей любовью к соревновательному парусному спорту с посетителями со всего мира.', 'История о том, как начался Garda Racing Yacht Club', 'ru', true),

('about-beginning-description', 'Описание начала', 'Озеро Гарда всегда было раем для моряков, с постоянными ветрами и потрясающим альпийским фоном. Марко, моряк на всю жизнь и бывший участник соревнований, понял, что многие посетители озера хотели испытать настоящие яхтенные гонки, но не имели такой возможности.', 'Как Garda Racing начался на озере Гарда', 'ru', true),

('about-journey-description-1', 'Описание путешествия часть 1', 'Начав с одной яхты и мечты, Марко начал предлагать персонализированные парусные впечатления, которые сочетали профессиональное обучение с острыми ощущениями соревновательных гонок. Слухи быстро распространились об этих уникальных приключениях, которые позволяли полным новичкам испытать волнение яхтенных гонок.', 'Ранние дни Garda Racing', 'ru', true),

('about-journey-description-2', 'Описание путешествия часть 2', 'Сегодня мы управляем флотом современных гоночных яхт и приветствовали более 2000 гостей из более чем 30 стран, каждый из которых уезжает с незабываемыми воспоминаниями и новой оценкой парусного спорта.', 'Garda Racing сегодня', 'ru', true),

('about-mission-description', 'Описание миссии', 'Предоставлять подлинные, безопасные и незабываемые впечатления от яхтенных гонок, которые вдохновляют на пожизненную любовь к парусному спорту, демонстрируя при этом природную красоту озера Гарда.', 'Наша миссия', 'ru', true),

('about-vision-description', 'Описание видения', 'Быть признанным как ведущее направление Европы для впечатлений от яхтенных гонок, где каждый гость уезжает уверенным моряком с воспоминаниями, которые останутся на всю жизнь.', 'Наше видение будущего', 'ru', true),

('about-milestone-2009', 'Веха 2009', 'Основан страстным моряком Марко Бенедетти с одной яхтой и мечтой поделиться подлинными гоночными впечатлениями', 'Веха основания 2009', 'ru', true),

('about-milestone-2012', 'Веха 2012', 'Достигли нашей первой крупной вехи довольных клиентов со всей Европы', 'Веха клиентов 2012', 'ru', true),

('about-milestone-2015', 'Веха 2015', 'Получили сертификацию Королевской яхтенной ассоциации для профессионального обучения парусному спорту', 'Сертификация RYA 2015', 'ru', true),

('about-milestone-2018', 'Веха 2018', 'Добавили современные гоночные яхты Bavaria для обеспечения максимального парусного опыта', 'Расширение флота 2018', 'ru', true),

('about-milestone-2020', 'Веха 2020', 'Запустили онлайн-платформу бронирования и цифровые гостевые сервисы', 'Цифровые инновации 2020', 'ru', true),

('about-milestone-2024', 'Веха 2024', 'Празднуем более 2000 довольных клиентов из 30+ стран по всему миру', 'Веха достижений 2024', 'ru', true),

('about-values-safety-description', 'Ценность безопасности', 'Ваша безопасность - наш абсолютный приоритет. Мы поддерживаем самые высокие стандарты безопасности, используем только сертифицированное оборудование и проводим тщательные инструктажи перед каждым опытом.', 'Наша приверженность безопасности', 'ru', true),

('about-values-passion-description', 'Ценность страсти', 'Мы живём и дышим парусным спортом. Наша искренняя страсть к этому виду спорта движет всем, что мы делаем, от качества обучения до создания незабываемых воспоминаний.', 'Наша страсть к парусному спорту', 'ru', true),

('about-values-inclusive-description', 'Ценность инклюзивности', 'Независимо от того, являетесь ли вы полным новичком или опытным моряком, все приветствуются. Мы адаптируем каждый опыт, чтобы все чувствовали себя уверенно и вовлечённо.', 'Наш инклюзивный подход', 'ru', true),

('about-values-authentic-description', 'Ценность подлинности', 'Мы предоставляем настоящие впечатления от яхтенных гонок с реальной конкуренцией, официальным хронометражем и значимым признанием достижений.', 'Наш подлинный гоночный опыт', 'ru', true),

('about-values-innovation-description', 'Ценность инноваций', 'Мы постоянно развиваем наши услуги, внедряя новейшие техники парусного спорта, протоколы безопасности и инновации в области гостевого опыта.', 'Наша приверженность инновациям', 'ru', true),

('about-team-marco-description', 'Описание Марко', 'RYA Яхтмастер с более чем 20-летним опытом плавания на озере Гарда. Бывший участник соревнований, ставший страстным инструктором.', 'Биография Марко Бенедетти', 'ru', true),

('about-team-sofia-description', 'Описание Софии', 'Обеспечивает незабываемые впечатления для каждого гостя. Многоязычный эксперт по гостеприимству с страстью к парусному спорту.', 'Биография Софии Росси', 'ru', true),

('about-team-andreas-description', 'Описание Андреаса', 'Бывший олимпийский моряк и сертифицированный инструктор по парусному спорту. Привносит мирового класса гоночный опыт в каждое мероприятие.', 'Биография Андреаса Мюллера', 'ru', true),

('about-team-elena-description', 'Описание Елены', 'Сертифицированный эксперт по морской безопасности и инструктор по парусному спорту. Обеспечивает соответствие всех мероприятий самым высоким стандартам безопасности.', 'Биография Елены Бьянки', 'ru', true),

('about-differentiators-authentic-description', 'Отличие подлинности', 'В отличие от туристических парусных поездок, мы предлагаем настоящие яхтенные гонки с официальным хронометражем, подсчётом очков и соревновательными элементами, которые создают настоящее волнение.', 'Что делает наши гонки подлинными', 'ru', true),

('about-differentiators-professional-description', 'Отличие профессионализма', 'Наши сертифицированные RYA шкиперы предоставляют обучение мирового класса, обеспечивая изучение правильных техник во время веселья.', 'Наше профессиональное обучение', 'ru', true),

('about-differentiators-complete-description', 'Отличие полного пакета', 'Всё включено: профессиональные фото, гоночные медали, сертификаты, оборудование безопасности и экспертное руководство.', 'Наш полный пакет опыта', 'ru', true),

('about-differentiators-location-description', 'Отличие расположения', 'Озеро Гарда предлагает идеальные условия для парусного спорта с постоянными термическими ветрами и потрясающими альпийскими пейзажами.', 'Наше идеальное расположение', 'ru', true),

('about-differentiators-multilingual-description', 'Отличие многоязычности', 'Наша команда говорит на английском, итальянском, немецком и русском языках, обеспечивая чёткое общение и комфорт для всех гостей.', 'Наша многоязычная команда', 'ru', true),

('about-differentiators-flexible-description', 'Отличие гибкости', 'Ежедневные отправления, гарантии погоды и гибкие политики бронирования делают планирование вашего опыта беззаботным.', 'Наш гибкий подход', 'ru', true);

-- Italian content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Descrizione della Nostra Storia', 'Quello che è iniziato come un progetto di passione di un gruppo di appassionati di vela è cresciuto fino a diventare il principale fornitore di esperienze di regata del Lago di Garda. Il nostro viaggio è iniziato nel 2009 quando il fondatore Marco Benedetti ha deciso di condividere il suo amore per la vela competitiva con visitatori da tutto il mondo.', 'La storia di come è nato il Garda Racing Yacht Club', 'it', true),

('about-beginning-description', 'Descrizione dell''Inizio', 'Il Lago di Garda è sempre stato un paradiso per i velisti, con i suoi venti costanti e lo splendido sfondo alpino. Marco, velista per tutta la vita ed ex corridore competitivo, ha riconosciuto che molti visitatori del lago volevano sperimentare autentiche regate di yacht ma non ne avevano l''opportunità.', 'Come Garda Racing è iniziato sul Lago di Garda', 'it', true),

('about-journey-description-1', 'Descrizione del Viaggio Parte 1', 'Iniziando con un singolo yacht e un sogno, Marco ha iniziato a offrire esperienze veliche personalizzate che combinavano istruzione professionale con il brivido delle corse competitive. La voce si è diffusa rapidamente su queste avventure uniche che permettevano ai principianti assoluti di sperimentare l''emozione delle regate di yacht.', 'I primi giorni di Garda Racing', 'it', true),

('about-journey-description-2', 'Descrizione del Viaggio Parte 2', 'Oggi, gestiamo una flotta di yacht da regata moderni e abbiamo accolto oltre 2.000 ospiti da più di 30 paesi, ognuno dei quali se ne va con ricordi indimenticabili e una nuova apprezzamento per lo sport della vela.', 'Garda Racing oggi', 'it', true),

('about-mission-description', 'Descrizione della Missione', 'Fornire esperienze autentiche, sicure e indimenticabili di regata che ispirano un amore per tutta la vita per la vela mostrando la bellezza naturale del Lago di Garda.', 'La nostra dichiarazione di missione', 'it', true),

('about-vision-description', 'Descrizione della Visione', 'Essere riconosciuti come la destinazione premier d''Europa per le esperienze di regata, dove ogni ospite se ne va come un velista sicuro con ricordi che durano una vita.', 'La nostra visione per il futuro', 'it', true),

('about-milestone-2009', 'Pietra Miliare 2009', 'Fondato dal velista appassionato Marco Benedetti con un singolo yacht e il sogno di condividere esperienze di regata autentiche', 'Pietra miliare della fondazione 2009', 'it', true),

('about-milestone-2012', 'Pietra Miliare 2012', 'Raggiunto il nostro primo importante traguardo di clienti soddisfatti da tutta Europa', 'Pietra miliare dei clienti 2012', 'it', true),

('about-milestone-2015', 'Pietra Miliare 2015', 'Ottenuta la certificazione della Royal Yachting Association per l''istruzione velica professionale', 'Certificazione RYA 2015', 'it', true),

('about-milestone-2018', 'Pietra Miliare 2018', 'Aggiunti moderni yacht da regata Bavaria per fornire l''esperienza velica definitiva', 'Espansione della flotta 2018', 'it', true),

('about-milestone-2020', 'Pietra Miliare 2020', 'Lanciata la piattaforma di prenotazione online e i servizi digitali per gli ospiti', 'Innovazione digitale 2020', 'it', true),

('about-milestone-2024', 'Pietra Miliare 2024', 'Celebrando oltre 2000 clienti soddisfatti da 30+ paesi in tutto il mondo', 'Pietra miliare dei risultati 2024', 'it', true),

('about-team-marco-description', 'Descrizione di Marco', 'RYA Yachtmaster con oltre 20 anni di esperienza velica sul Lago di Garda. Ex corridore competitivo diventato istruttore appassionato.', 'Biografia di Marco Benedetti', 'it', true),

('about-team-sofia-description', 'Descrizione di Sofia', 'Assicura che ogni ospite abbia un''esperienza indimenticabile. Esperta di ospitalità multilingue con passione per la vela.', 'Biografia di Sofia Rossi', 'it', true),

('about-team-andreas-description', 'Descrizione di Andreas', 'Ex velista olimpico e istruttore di vela certificato. Porta competenza di regata di livello mondiale a ogni esperienza.', 'Biografia di Andreas Mueller', 'it', true),

('about-team-elena-description', 'Descrizione di Elena', 'Esperta di sicurezza marina certificata e istruttore di vela. Assicura che tutte le esperienze soddisfino i più alti standard di sicurezza.', 'Biografia di Elena Bianchi', 'it', true);

-- German content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Unsere Geschichte Beschreibung', 'Was als Leidenschaftsprojekt einer Gruppe von Segelenthusiasten begann, ist zum führenden Anbieter von Yacht-Rennerlebnissen am Gardasee gewachsen. Unsere Reise begann 2009, als Gründer Marco Benedetti beschloss, seine Liebe zum Wettkampfsegeln mit Besuchern aus aller Welt zu teilen.', 'Die Geschichte, wie der Garda Racing Yacht Club begann', 'de', true),

('about-beginning-description', 'Der Anfang Beschreibung', 'Der Gardasee war schon immer ein Paradies für Segler, mit seinen konstanten Winden und der atemberaubenden Alpenkulisse. Marco, ein lebenslanger Segler und ehemaliger Wettkampffahrer, erkannte, dass viele Besucher des Sees authentische Yacht-Rennen erleben wollten, aber nicht die Gelegenheit dazu hatten.', 'Wie Garda Racing am Gardasee begann', 'de', true),

('about-journey-description-1', 'Reise Beschreibung Teil 1', 'Mit einer einzigen Yacht und einem Traum beginnend, bot Marco personalisierte Segelerlebnisse an, die professionelle Anleitung mit dem Nervenkitzel des Wettkampfsegelns kombinierten. Die Nachricht über diese einzigartigen Abenteuer, die es absoluten Anfängern ermöglichten, die Aufregung von Yacht-Rennen zu erleben, verbreitete sich schnell.', 'Die frühen Tage von Garda Racing', 'de', true),

('about-journey-description-2', 'Reise Beschreibung Teil 2', 'Heute betreiben wir eine Flotte moderner Renn-Yachten und haben über 2.000 Gäste aus mehr als 30 Ländern begrüßt, die alle mit unvergesslichen Erinnerungen und einer neuen Wertschätzung für den Segelsport abreisen.', 'Garda Racing heute', 'de', true),

('about-mission-description', 'Mission Beschreibung', 'Authentische, sichere und unvergessliche Yacht-Rennerlebnisse zu bieten, die eine lebenslange Liebe zum Segeln inspirieren und dabei die natürliche Schönheit des Gardasees zeigen.', 'Unsere Missionserklärung', 'de', true),

('about-vision-description', 'Vision Beschreibung', 'Als Europas führendes Ziel für Yacht-Rennerlebnisse anerkannt zu werden, wo jeder Gast als selbstbewusster Segler mit Erinnerungen abreist, die ein Leben lang halten.', 'Unsere Vision für die Zukunft', 'de', true),

('about-milestone-2009', 'Meilenstein 2009', 'Gegründet vom leidenschaftlichen Segler Marco Benedetti mit einer einzigen Yacht und dem Traum, authentische Rennerlebnisse zu teilen', 'Gründungsmeilenstein 2009', 'de', true),

('about-milestone-2012', 'Meilenstein 2012', 'Erreichten unseren ersten wichtigen Meilenstein zufriedener Kunden aus ganz Europa', 'Kundenmeilenstein 2012', 'de', true),

('about-milestone-2015', 'Meilenstein 2015', 'Erhielten die Zertifizierung der Royal Yachting Association für professionelle Segelausbildung', 'RYA-Zertifizierung 2015', 'de', true),

('about-milestone-2018', 'Meilenstein 2018', 'Fügten moderne Bavaria-Renn-Yachten hinzu, um das ultimative Segelerlebnis zu bieten', 'Flottenerweiterung 2018', 'de', true),

('about-team-marco-description', 'Marco Team Beschreibung', 'RYA Yachtmaster mit über 20 Jahren Segelerfahrung auf dem Gardasee. Ehemaliger Wettkampffahrer, der zum leidenschaftlichen Ausbilder wurde.', 'Marco Benedetti Biografie', 'de', true),

('about-team-sofia-description', 'Sofia Team Beschreibung', 'Sorgt dafür, dass jeder Gast ein unvergessliches Erlebnis hat. Mehrsprachige Gastfreundschaftsexpertin mit Leidenschaft für das Segeln.', 'Sofia Rossi Biografie', 'de', true),

('about-team-andreas-description', 'Andreas Team Beschreibung', 'Ehemaliger Olympia-Segler und zertifizierter Segellehrer. Bringt Weltklasse-Rennexpertise in jedes Erlebnis ein.', 'Andreas Mueller Biografie', 'de', true),

('about-team-elena-description', 'Elena Team Beschreibung', 'Zertifizierte Meeressicherheitsexpertin und Segellehrerin. Stellt sicher, dass alle Erlebnisse den höchsten Sicherheitsstandards entsprechen.', 'Elena Bianchi Biografie', 'de', true);

-- French content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Description de Notre Histoire', 'Ce qui a commencé comme un projet de passion d''un groupe d''enthousiastes de la voile est devenu le principal fournisseur d''expériences de course de yacht du lac de Garde. Notre voyage a commencé en 2009 quand le fondateur Marco Benedetti a décidé de partager son amour pour la voile compétitive avec des visiteurs du monde entier.', 'L''histoire de la création du Garda Racing Yacht Club', 'fr', true),

('about-beginning-description', 'Description du Commencement', 'Le lac de Garde a toujours été un paradis pour les marins, avec ses vents constants et son magnifique décor alpin. Marco, un marin de toute une vie et ancien coureur compétitif, a reconnu que de nombreux visiteurs du lac voulaient vivre des courses de yacht authentiques mais n''en avaient pas l''opportunité.', 'Comment Garda Racing a débuté sur le lac de Garde', 'fr', true),

('about-journey-description-1', 'Description du Voyage Partie 1', 'Commençant avec un seul yacht et un rêve, Marco a commencé à offrir des expériences de voile personnalisées qui combinaient instruction professionnelle avec le frisson de la course compétitive. La nouvelle s''est rapidement répandue sur ces aventures uniques qui permettaient aux débutants complets de vivre l''excitation des courses de yacht.', 'Les débuts de Garda Racing', 'fr', true),

('about-journey-description-2', 'Description du Voyage Partie 2', 'Aujourd''hui, nous exploitons une flotte de yachts de course modernes et avons accueilli plus de 2 000 invités de plus de 30 pays, chacun repartant avec des souvenirs inoubliables et une nouvelle appréciation pour le sport de la voile.', 'Garda Racing aujourd''hui', 'fr', true),

('about-mission-description', 'Description de la Mission', 'Fournir des expériences de course de yacht authentiques, sûres et inoubliables qui inspirent un amour de la voile pour la vie tout en montrant la beauté naturelle du lac de Garde.', 'Notre énoncé de mission', 'fr', true),

('about-vision-description', 'Description de la Vision', 'Être reconnu comme la destination première d''Europe pour les expériences de course de yacht, où chaque invité repart comme un marin confiant avec des souvenirs qui durent toute une vie.', 'Notre vision pour l''avenir', 'fr', true),

('about-team-marco-description', 'Description de l''Équipe Marco', 'RYA Yachtmaster avec plus de 20 ans d''expérience de voile sur le lac de Garde. Ancien coureur compétitif devenu instructeur passionné.', 'Biographie de Marco Benedetti', 'fr', true),

('about-team-sofia-description', 'Description de l''Équipe Sofia', 'Assure que chaque invité ait une expérience inoubliable. Experte en hospitalité multilingue avec une passion pour la voile.', 'Biographie de Sofia Rossi', 'fr', true),

('about-team-andreas-description', 'Description de l''Équipe Andreas', 'Ancien marin olympique et instructeur de voile certifié. Apporte une expertise de course de classe mondiale à chaque expérience.', 'Biographie d''Andreas Mueller', 'fr', true),

('about-team-elena-description', 'Description de l''Équipe Elena', 'Experte en sécurité marine certifiée et instructrice de voile. Assure que toutes les expériences répondent aux plus hauts standards de sécurité.', 'Biographie d''Elena Bianchi', 'fr', true);

-- Spanish content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('about-story-description', 'Descripción de Nuestra Historia', 'Lo que comenzó como un proyecto de pasión de un grupo de entusiastas de la vela se ha convertido en el principal proveedor de experiencias de regatas de yate del Lago de Garda. Nuestro viaje comenzó en 2009 cuando el fundador Marco Benedetti decidió compartir su amor por la vela competitiva con visitantes de todo el mundo.', 'La historia de cómo comenzó el Garda Racing Yacht Club', 'es', true),

('about-beginning-description', 'Descripción del Comienzo', 'El Lago de Garda siempre ha sido un paraíso para los marineros, con sus vientos constantes y su impresionante telón de fondo alpino. Marco, un marinero de toda la vida y ex corredor competitivo, reconoció que muchos visitantes del lago querían experimentar auténticas regatas de yate pero carecían de la oportunidad.', 'Cómo Garda Racing comenzó en el Lago de Garda', 'es', true),

('about-journey-description-1', 'Descripción del Viaje Parte 1', 'Comenzando con un solo yate y un sueño, Marco comenzó a ofrecer experiencias de vela personalizadas que combinaban instrucción profesional con la emoción de las carreras competitivas. La noticia se extendió rápidamente sobre estas aventuras únicas que permitían a principiantes completos experimentar la emoción de las regatas de yate.', 'Los primeros días de Garda Racing', 'es', true),

('about-journey-description-2', 'Descripción del Viaje Parte 2', 'Hoy, operamos una flota de yates de regata modernos y hemos recibido a más de 2,000 invitados de más de 30 países, cada uno saliendo con recuerdos inolvidables y una nueva apreciación por el deporte de la vela.', 'Garda Racing hoy', 'es', true),

('about-mission-description', 'Descripción de la Misión', 'Proporcionar experiencias de regatas de yate auténticas, seguras e inolvidables que inspiren un amor de por vida por la navegación mientras mostramos la belleza natural del Lago de Garda.', 'Nuestra declaración de misión', 'es', true),

('about-vision-description', 'Descripción de la Visión', 'Ser reconocidos como el principal destino de Europa para experiencias de regatas de yate, donde cada invitado se va como un marinero confiado con recuerdos que duran toda la vida.', 'Nuestra visión para el futuro', 'es', true),

('about-team-marco-description', 'Descripción del Equipo Marco', 'RYA Yachtmaster con más de 20 años de experiencia en navegación en el Lago de Garda. Ex corredor competitivo convertido en instructor apasionado.', 'Biografía de Marco Benedetti', 'es', true),

('about-team-sofia-description', 'Descripción del Equipo Sofia', 'Asegura que cada invitado tenga una experiencia inolvidable. Experta en hospitalidad multilingüe con pasión por la vela.', 'Biografía de Sofia Rossi', 'es', true),

('about-team-andreas-description', 'Descripción del Equipo Andreas', 'Ex navegante olímpico e instructor de vela certificado. Aporta experiencia de regata de clase mundial a cada experiencia.', 'Biografía de Andreas Mueller', 'es', true),

('about-team-elena-description', 'Descripción del Equipo Elena', 'Experta certificada en seguridad marina e instructora de vela. Asegura que todas las experiencias cumplan con los más altos estándares de seguridad.', 'Biografía de Elena Bianchi', 'es', true);