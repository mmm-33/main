/*
  # Legal Documents Content Migration

  1. New Content
    - Privacy Policy content in English and Russian
    - Terms of Service content in English and Russian  
    - Cancellation Policy content in English and Russian
    
  2. Content Structure
    - Each document is broken into logical sections for easier management
    - Supports multiple languages with proper fallbacks
    - All content is marked as published and ready for use
*/

-- English Privacy Policy Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('privacy-policy-title', 'Privacy Policy', 'Privacy Policy', 'Privacy policy for Garda Racing Yacht Club', 'en', true),

('privacy-policy-intro', 'Privacy Policy Introduction', 'We at Garda Racing Yacht Club respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights and how the law protects you.

Last updated: June 10, 2024', 'Introduction to our privacy policy', 'en', true),

('privacy-policy-information-collected', 'Information We Collect', '## 1. Information We Collect

We collect information you provide directly to us, such as when you:

- Make a booking for our yacht racing experiences
- Contact us through our website or phone
- Subscribe to our newsletter or marketing communications
- Participate in our chat support

### Personal Information

The types of personal information we may collect include:

- Name and contact information (email, phone number, address)
- Payment information (processed securely through Stripe)
- Booking preferences and special requirements
- Communication history and support interactions', 'Information collected by Garda Racing', 'en', true),

('privacy-policy-information-use', 'How We Use Your Information', '## 2. How We Use Your Information

We use the information we collect to:

- Process and manage your bookings
- Communicate with you about your reservations
- Provide customer support and respond to inquiries
- Send you marketing communications (with your consent)
- Improve our services and website functionality
- Comply with legal obligations', 'How we use collected information', 'en', true),

('privacy-policy-information-sharing', 'Information Sharing and Disclosure', '## 3. Information Sharing and Disclosure

We do not sell, trade, or otherwise transfer your personal information to third parties except:

- With your explicit consent
- To trusted service providers who assist in operating our business (e.g., payment processors, email services)
- When required by law or to protect our rights and safety
- In connection with a business transfer or merger', 'How we share information', 'en', true),

('privacy-policy-data-security', 'Data Security', '## 4. Data Security

We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes:

- SSL encryption for data transmission
- Secure database storage with access controls
- Regular security audits and updates
- Staff training on data protection practices', 'How we secure your data', 'en', true),

('privacy-policy-your-rights', 'Your Rights (GDPR)', '## 5. Your Rights (GDPR)

Under the General Data Protection Regulation (GDPR), you have the following rights:

- **Right of access:** Request copies of your personal data
- **Right to rectification:** Request correction of inaccurate data
- **Right to erasure:** Request deletion of your personal data
- **Right to restrict processing:** Request limitation of data processing
- **Right to data portability:** Request transfer of your data
- **Right to object:** Object to processing of your personal data

To exercise these rights, please contact us at privacy@gardaracing.com.', 'Your rights under GDPR', 'en', true),

('privacy-policy-cookies', 'Cookies and Tracking', '## 6. Cookies and Tracking

We use cookies and similar tracking technologies to enhance your experience on our website. These include:

- **Essential cookies:** Required for website functionality
- **Analytics cookies:** Help us understand website usage
- **Marketing cookies:** Used for targeted advertising (with consent)

You can control cookie preferences through your browser settings.', 'Our cookie policy', 'en', true),

('privacy-policy-data-retention', 'Data Retention', '## 7. Data Retention

We retain your personal information only as long as necessary to fulfill the purposes outlined in this policy, comply with legal obligations, resolve disputes, and enforce our agreements. Booking information is typically retained for 7 years for accounting and legal purposes.', 'How long we keep your data', 'en', true),

('privacy-policy-international-transfers', 'International Data Transfers', '## 8. International Data Transfers

Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place to protect your personal information in accordance with applicable data protection laws.', 'International data transfer policy', 'en', true),

('privacy-policy-childrens-privacy', 'Children''s Privacy', '## 9. Children''s Privacy

Our services are not directed to children under 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us immediately.', 'Children''s privacy policy', 'en', true),

('privacy-policy-changes', 'Changes to This Policy', '## 10. Changes to This Policy

We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this policy periodically.', 'Policy update information', 'en', true),

('privacy-policy-contact', 'Contact Information', '## 11. Contact Information

If you have any questions about this privacy policy or our data practices, please contact us:

**Garda Racing Yacht Club**  
Via del Porto 15  
38066 Riva del Garda, TN, Italy  
Email: privacy@gardaracing.com  
Phone: +39 345 678 9012', 'Contact information for privacy inquiries', 'en', true);

-- English Terms of Service Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('terms-of-service-title', 'Terms of Service', 'Terms of Service', 'Terms of service for Garda Racing Yacht Club', 'en', true),

('terms-of-service-intro', 'Terms of Service Introduction', 'Last updated: June 10, 2024', 'Introduction to our terms of service', 'en', true),

('terms-of-service-acceptance', 'Acceptance of Terms', '## 1. Acceptance of Terms

By accessing and using the services provided by Garda Racing Yacht Club ("we," "our," or "us"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.', 'Acceptance of terms', 'en', true),

('terms-of-service-description', 'Service Description', '## 2. Service Description

Garda Racing Yacht Club provides yacht racing experiences on Lake Garda, Italy. Our services include:

- Professional yacht racing instruction and guidance
- Use of sailing equipment and safety gear
- Racing yacht charter for the duration of the experience
- Professional photography and videography services
- Medal ceremony and certificate presentation', 'Description of our services', 'en', true),

('terms-of-service-booking', 'Booking and Payment Terms', '## 3. Booking and Payment Terms

### 3.1 Booking Process
- Bookings can be made online, by phone, or email
- All bookings are subject to availability
- A booking is confirmed only upon receipt of payment
- You will receive a confirmation email with booking details

### 3.2 Payment
- Full payment is required at the time of booking
- Prices are in Euros (€) and include all applicable taxes
- Payment is processed securely through Stripe
- We accept major credit cards and bank transfers

### 3.3 Pricing
Current pricing is €199 per person for the full-day yacht racing experience. Prices are subject to change without notice, but confirmed bookings will honor the price at the time of booking.', 'Booking and payment information', 'en', true),

('terms-of-service-requirements', 'Participant Requirements', '## 4. Participant Requirements

### 4.1 Age Requirements
- Participants must be at least 12 years old
- Participants under 18 must be accompanied by a parent or guardian
- All minors require signed parental consent

### 4.2 Health and Fitness
- Participants should be in reasonable physical condition
- You must disclose any medical conditions that may affect participation
- Pregnant women are advised not to participate
- We reserve the right to refuse participation for safety reasons

### 4.3 Experience Level
No prior sailing experience is required. Our professional instructors will provide all necessary training and guidance.', 'Requirements for participants', 'en', true),

('terms-of-service-safety', 'Safety and Liability', '## 5. Safety and Liability

### 5.1 Safety Measures
- All participants must attend the mandatory safety briefing
- Life jackets and safety equipment are provided and must be worn
- Participants must follow all instructions from the skipper
- Alcohol consumption is prohibited during the experience

### 5.2 Limitation of Liability
While we maintain comprehensive insurance and follow strict safety protocols, sailing involves inherent risks. By participating, you acknowledge and accept these risks. Our liability is limited to the maximum extent permitted by law.

We strongly recommend that participants have their own travel and activity insurance.', 'Safety and liability information', 'en', true),

('terms-of-service-weather', 'Weather and Cancellation Policy', '## 6. Weather and Cancellation Policy

### 6.1 Weather Conditions
- Experiences operate in most weather conditions
- We reserve the right to cancel for safety reasons
- Weather-related cancellations receive full refund or rescheduling
- Light rain does not typically result in cancellation

### 6.2 Participant Cancellations
- Free cancellation up to 48 hours before the experience
- 50% refund for cancellations 24-48 hours before
- No refund for cancellations less than 24 hours before
- Rescheduling is subject to availability', 'Weather and cancellation policy', 'en', true),

('terms-of-service-intellectual-property', 'Intellectual Property', '## 7. Intellectual Property

All content on our website and materials provided during the experience are protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works without our written permission.

Photos and videos taken during your experience may be used for marketing purposes unless you specifically opt out.', 'Intellectual property rights', 'en', true),

('terms-of-service-conduct', 'Conduct and Behavior', '## 8. Conduct and Behavior

Participants are expected to:
- Treat staff and other participants with respect
- Follow all safety instructions and guidelines
- Arrive on time and prepared for the experience
- Not engage in any illegal or dangerous activities

We reserve the right to remove participants who violate these standards without refund.', 'Expected conduct and behavior', 'en', true),

('terms-of-service-force-majeure', 'Force Majeure', '## 9. Force Majeure

We shall not be liable for any failure to perform our obligations due to circumstances beyond our reasonable control, including but not limited to natural disasters, government actions, strikes, or other unforeseeable events.', 'Force majeure clause', 'en', true),

('terms-of-service-governing-law', 'Governing Law', '## 10. Governing Law

These terms shall be governed by and construed in accordance with the laws of Italy. Any disputes shall be subject to the exclusive jurisdiction of the courts of Trento, Italy.', 'Governing law information', 'en', true),

('terms-of-service-changes', 'Changes to Terms', '## 11. Changes to Terms

We reserve the right to modify these terms at any time. Changes will be posted on our website and will take effect immediately. Continued use of our services constitutes acceptance of the modified terms.', 'Information about changes to terms', 'en', true),

('terms-of-service-contact', 'Contact Information', '## 12. Contact Information

For questions about these terms or our services, please contact us:

**Garda Racing Yacht Club**  
Via del Porto 15  
38066 Riva del Garda, TN, Italy  
Email: info@gardaracing.com  
Phone: +39 345 678 9012', 'Contact information for terms inquiries', 'en', true);

-- English Cancellation Policy Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('cancellation-policy-title', 'Cancellation Policy', 'Cancellation Policy', 'Cancellation policy for Garda Racing Yacht Club', 'en', true),

('cancellation-policy-intro', 'Cancellation Policy Introduction', 'Last updated: June 10, 2024

We understand that plans can change. Our cancellation policy is designed to be fair to both our customers and our business operations. Please read the terms carefully before booking.', 'Introduction to our cancellation policy', 'en', true),

('cancellation-policy-timeline', 'Cancellation Timeline & Refunds', '## Cancellation Timeline & Refunds

### 48+ Hours: 100% Full Refund
Cancel 48 hours or more before your scheduled experience for a complete refund.

### 24-48 Hours: 50% Refund
Cancellations between 24-48 hours receive a 50% refund of the total amount paid.

### Less than 24 Hours: No Refund
Cancellations less than 24 hours before departure are non-refundable.', 'Cancellation timeline and refund information', 'en', true),

('cancellation-policy-weather', 'Weather-Related Cancellations', '## Weather-Related Cancellations

### Our Weather Policy

Safety is our top priority. If weather conditions are deemed unsafe for sailing, we will cancel the experience and offer you the following options:

- **Full refund:** 100% refund processed within 5-7 business days
- **Reschedule:** Move your booking to another available date at no extra cost
- **Credit voucher:** Receive a voucher valid for 12 months

### What Constitutes Unsafe Weather?

- Wind speeds exceeding 25 knots (46 km/h)
- Thunderstorms or lightning in the area
- Visibility less than 500 meters due to fog
- Any other conditions deemed unsafe by our experienced skippers

Note: Light rain, overcast skies, or moderate winds do not typically result in cancellation. Our experiences operate in various weather conditions as part of the authentic sailing experience.', 'Weather-related cancellation policy', 'en', true),

('cancellation-policy-how-to-cancel', 'How to Cancel Your Booking', '## How to Cancel Your Booking

### Online Cancellation
Use the cancellation link in your booking confirmation email to cancel online 24/7.

This is the fastest method and provides immediate confirmation of your cancellation.

### Phone Cancellation
Call us at +39 345 678 9012

Available daily from 8:00 AM to 7:00 PM (March - October)

### Email Cancellation
Send your cancellation request to bookings@gardaracing.com

Include your booking reference number and reason for cancellation', 'How to cancel your booking', 'en', true),

('cancellation-policy-rescheduling', 'Rescheduling Policy', '## Rescheduling Policy

We understand that sometimes you need to change your plans rather than cancel completely. Our rescheduling policy offers flexibility:

### Free Rescheduling
- Reschedule up to 48 hours before your experience at no cost
- Subject to availability on your preferred new date
- Can be done online, by phone, or email
- No limit on the number of reschedules (within reason)

### Late Rescheduling
- Rescheduling within 24-48 hours: €25 administrative fee
- Rescheduling less than 24 hours: €50 administrative fee
- Subject to availability and weather conditions', 'Rescheduling policy information', 'en', true),

('cancellation-policy-special-circumstances', 'Special Circumstances', '## Special Circumstances

### Medical Emergencies
In case of medical emergencies or serious illness, we may waive our standard cancellation policy. Medical documentation may be required. Please contact us as soon as possible to discuss your situation.

### Travel Restrictions
If government-imposed travel restrictions prevent you from attending your booked experience, we will offer a full refund or the option to reschedule without penalty.

### Group Bookings
Group bookings (6+ people) may have different cancellation terms. Please refer to your group booking agreement or contact us for specific terms.', 'Special circumstances for cancellations', 'en', true),

('cancellation-policy-refund-processing', 'Refund Processing', '## Refund Processing

- **Credit Card Refunds:** 5-7 business days
- **Bank Transfer Refunds:** 7-10 business days
- **PayPal Refunds:** 3-5 business days

Refund processing times may vary depending on your bank or payment provider. You will receive an email confirmation once the refund has been processed.', 'Refund processing information', 'en', true),

('cancellation-policy-no-show', 'No-Show Policy', '## No-Show Policy

If you fail to show up for your scheduled experience without prior notice, this is considered a no-show and no refund will be provided.

Please contact us as soon as possible if you are running late or unable to attend.', 'No-show policy information', 'en', true),

('cancellation-policy-contact', 'Contact Us', '## Contact Us

If you have questions about our cancellation policy or need assistance with your booking, please do not hesitate to contact us:

### Phone Support
+39 345 678 9012
Daily: 8:00 AM - 7:00 PM

### Email Support
bookings@gardaracing.com
Response within 24 hours', 'Contact information for cancellation inquiries', 'en', true);

-- Russian Privacy Policy Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('privacy-policy-title', 'Политика конфиденциальности', 'Политика конфиденциальности', 'Политика конфиденциальности для Garda Racing Yacht Club', 'ru', true),

('privacy-policy-intro', 'Введение в политику конфиденциальности', 'Мы в Garda Racing Yacht Club уважаем вашу конфиденциальность и стремимся защищать ваши персональные данные. Эта политика конфиденциальности расскажет вам о том, как мы заботимся о ваших персональных данных, когда вы посещаете наш веб-сайт, и расскажет вам о ваших правах на конфиденциальность и о том, как закон защищает вас.

Последнее обновление: 10 июня 2024 г.', 'Введение в нашу политику конфиденциальности', 'ru', true),

('privacy-policy-information-collected', 'Информация, которую мы собираем', '## 1. Информация, которую мы собираем

Мы собираем информацию, которую вы предоставляете нам напрямую, например, когда вы:

- Бронируете наши яхтенные гонки
- Связываетесь с нами через наш веб-сайт или телефон
- Подписываетесь на нашу рассылку или маркетинговые сообщения
- Участвуете в нашем чате поддержки

### Персональная информация

Типы персональной информации, которую мы можем собирать, включают:

- Имя и контактную информацию (электронная почта, номер телефона, адрес)
- Платежную информацию (обрабатывается безопасно через Stripe)
- Предпочтения бронирования и особые требования
- История коммуникаций и взаимодействия с поддержкой', 'Информация, собираемая Garda Racing', 'ru', true),

('privacy-policy-information-use', 'Как мы используем вашу информацию', '## 2. Как мы используем вашу информацию

Мы используем собранную информацию для:

- Обработки и управления вашими бронированиями
- Общения с вами о ваших резервациях
- Предоставления клиентской поддержки и ответов на запросы
- Отправки вам маркетинговых сообщений (с вашего согласия)
- Улучшения наших услуг и функциональности веб-сайта
- Соблюдения юридических обязательств', 'Как мы используем собранную информацию', 'ru', true),

('privacy-policy-information-sharing', 'Обмен информацией и раскрытие', '## 3. Обмен информацией и раскрытие

Мы не продаем, не обмениваем и не передаем иным образом вашу личную информацию третьим лицам, за исключением:

- С вашего явного согласия
- Доверенным поставщикам услуг, которые помогают в работе нашего бизнеса (например, обработчики платежей, сервисы электронной почты)
- Когда это требуется по закону или для защиты наших прав и безопасности
- В связи с передачей бизнеса или слиянием', 'Как мы делимся информацией', 'ru', true),

('privacy-policy-data-security', 'Безопасность данных', '## 4. Безопасность данных

Мы внедряем соответствующие технические и организационные меры для защиты вашей личной информации от несанкционированного доступа, изменения, раскрытия или уничтожения. Это включает:

- SSL-шифрование для передачи данных
- Безопасное хранение базы данных с контролем доступа
- Регулярные аудиты безопасности и обновления
- Обучение персонала практикам защиты данных', 'Как мы защищаем ваши данные', 'ru', true),

('privacy-policy-your-rights', 'Ваши права (GDPR)', '## 5. Ваши права (GDPR)

В соответствии с Общим регламентом по защите данных (GDPR), у вас есть следующие права:

- **Право на доступ:** Запрашивать копии ваших персональных данных
- **Право на исправление:** Запрашивать исправление неточных данных
- **Право на удаление:** Запрашивать удаление ваших персональных данных
- **Право на ограничение обработки:** Запрашивать ограничение обработки данных
- **Право на переносимость данных:** Запрашивать передачу ваших данных
- **Право на возражение:** Возражать против обработки ваших персональных данных

Для осуществления этих прав, пожалуйста, свяжитесь с нами по адресу privacy@gardaracing.com.', 'Ваши права в соответствии с GDPR', 'ru', true),

('privacy-policy-cookies', 'Файлы cookie и отслеживание', '## 6. Файлы cookie и отслеживание

Мы используем файлы cookie и аналогичные технологии отслеживания для улучшения вашего опыта на нашем веб-сайте. Они включают:

- **Необходимые файлы cookie:** Необходимы для функционирования веб-сайта
- **Аналитические файлы cookie:** Помогают нам понять использование веб-сайта
- **Маркетинговые файлы cookie:** Используются для целевой рекламы (с согласия)

Вы можете управлять предпочтениями файлов cookie через настройки вашего браузера.', 'Наша политика в отношении файлов cookie', 'ru', true),

('privacy-policy-data-retention', 'Хранение данных', '## 7. Хранение данных

Мы храним вашу личную информацию только столько времени, сколько необходимо для выполнения целей, изложенных в этой политике, соблюдения юридических обязательств, разрешения споров и обеспечения наших соглашений. Информация о бронировании обычно хранится в течение 7 лет для бухгалтерских и юридических целей.', 'Как долго мы храним ваши данные', 'ru', true),

('privacy-policy-international-transfers', 'Международная передача данных', '## 8. Международная передача данных

Ваша информация может быть передана и обработана в странах, отличных от вашей страны проживания. Мы обеспечиваем соответствующие меры защиты для защиты вашей личной информации в соответствии с применимыми законами о защите данных.', 'Политика международной передачи данных', 'ru', true),

('privacy-policy-childrens-privacy', 'Конфиденциальность детей', '## 9. Конфиденциальность детей

Наши услуги не предназначены для детей младше 16 лет. Мы сознательно не собираем личную информацию от детей младше 16 лет. Если вам станет известно, что ребенок предоставил нам личную информацию, пожалуйста, немедленно свяжитесь с нами.', 'Политика конфиденциальности детей', 'ru', true),

('privacy-policy-changes', 'Изменения в этой политике', '## 10. Изменения в этой политике

Мы можем время от времени обновлять эту политику конфиденциальности. Мы уведомим вас о любых изменениях, разместив новую политику на этой странице и обновив дату "Последнее обновление". Мы рекомендуем вам периодически просматривать эту политику.', 'Информация об обновлениях политики', 'ru', true),

('privacy-policy-contact', 'Контактная информация', '## 11. Контактная информация

Если у вас есть вопросы об этой политике конфиденциальности или наших практиках в отношении данных, пожалуйста, свяжитесь с нами:

**Garda Racing Yacht Club**  
Via del Porto 15  
38066 Riva del Garda, TN, Italy  
Email: privacy@gardaracing.com  
Phone: +39 345 678 9012', 'Контактная информация для запросов о конфиденциальности', 'ru', true);

-- Russian Terms of Service Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('terms-of-service-title', 'Условия обслуживания', 'Условия обслуживания', 'Условия обслуживания для Garda Racing Yacht Club', 'ru', true),

('terms-of-service-intro', 'Введение в условия обслуживания', 'Последнее обновление: 10 июня 2024 г.', 'Введение в наши условия обслуживания', 'ru', true),

('terms-of-service-acceptance', 'Принятие условий', '## 1. Принятие условий

Получая доступ и используя услуги, предоставляемые Garda Racing Yacht Club ("мы", "наш" или "нас"), вы принимаете и соглашаетесь соблюдать условия и положения настоящего соглашения. Если вы не согласны соблюдать вышеуказанное, пожалуйста, не используйте эту услугу.', 'Принятие условий', 'ru', true),

('terms-of-service-description', 'Описание услуги', '## 2. Описание услуги

Garda Racing Yacht Club предоставляет опыт яхтенных гонок на озере Гарда, Италия. Наши услуги включают:

- Профессиональное обучение и руководство по яхтенным гонкам
- Использование парусного оборудования и снаряжения безопасности
- Аренда гоночной яхты на время опыта
- Профессиональные фото- и видеоуслуги
- Церемония награждения медалями и вручение сертификатов', 'Описание наших услуг', 'ru', true),

('terms-of-service-booking', 'Условия бронирования и оплаты', '## 3. Условия бронирования и оплаты

### 3.1 Процесс бронирования
- Бронирование можно сделать онлайн, по телефону или по электронной почте
- Все бронирования зависят от наличия мест
- Бронирование подтверждается только после получения оплаты
- Вы получите подтверждение по электронной почте с деталями бронирования

### 3.2 Оплата
- Полная оплата требуется во время бронирования
- Цены указаны в евро (€) и включают все применимые налоги
- Оплата обрабатывается безопасно через Stripe
- Мы принимаем основные кредитные карты и банковские переводы

### 3.3 Ценообразование
Текущая цена составляет €199 за человека за полнодневный опыт яхтенных гонок. Цены могут изменяться без предварительного уведомления, но подтвержденные бронирования будут соблюдать цену на момент бронирования.', 'Информация о бронировании и оплате', 'ru', true),

('terms-of-service-requirements', 'Требования к участникам', '## 4. Требования к участникам

### 4.1 Возрастные требования
- Участники должны быть не моложе 12 лет
- Участники младше 18 лет должны сопровождаться родителем или опекуном
- Все несовершеннолетние требуют подписанного родительского согласия

### 4.2 Здоровье и физическая форма
- Участники должны быть в разумной физической форме
- Вы должны раскрыть любые медицинские состояния, которые могут повлиять на участие
- Беременным женщинам не рекомендуется участвовать
- Мы оставляем за собой право отказать в участии по соображениям безопасности

### 4.3 Уровень опыта
Предварительный опыт парусного спорта не требуется. Наши профессиональные инструкторы предоставят все необходимое обучение и руководство.', 'Требования для участников', 'ru', true),

('terms-of-service-safety', 'Безопасность и ответственность', '## 5. Безопасность и ответственность

### 5.1 Меры безопасности
- Все участники должны присутствовать на обязательном инструктаже по безопасности
- Спасательные жилеты и оборудование безопасности предоставляются и должны быть надеты
- Участники должны следовать всем инструкциям шкипера
- Употребление алкоголя запрещено во время опыта

### 5.2 Ограничение ответственности
Хотя мы поддерживаем комплексное страхование и следуем строгим протоколам безопасности, парусный спорт связан с неотъемлемыми рисками. Участвуя, вы признаете и принимаете эти риски. Наша ответственность ограничена в максимальной степени, разрешенной законом.

Мы настоятельно рекомендуем участникам иметь собственное страхование путешествий и активностей.', 'Информация о безопасности и ответственности', 'ru', true),

('terms-of-service-weather', 'Погода и политика отмены', '## 6. Погода и политика отмены

### 6.1 Погодные условия
- Опыты проводятся в большинстве погодных условий
- Мы оставляем за собой право отменить по соображениям безопасности
- Отмены, связанные с погодой, получают полный возврат или перенос
- Легкий дождь обычно не приводит к отмене

### 6.2 Отмены участниками
- Бесплатная отмена до 48 часов до опыта
- 50% возврат за отмены за 24-48 часов до
- Без возврата за отмены менее чем за 24 часа до
- Перенос зависит от наличия мест', 'Политика погоды и отмены', 'ru', true),

('terms-of-service-intellectual-property', 'Интеллектуальная собственность', '## 7. Интеллектуальная собственность

Весь контент на нашем веб-сайте и материалы, предоставленные во время опыта, защищены авторским правом и другими законами об интеллектуальной собственности. Вы не можете воспроизводить, распространять или создавать производные работы без нашего письменного разрешения.

Фотографии и видео, сделанные во время вашего опыта, могут быть использованы в маркетинговых целях, если вы специально не откажетесь от этого.', 'Права интеллектуальной собственности', 'ru', true),

('terms-of-service-conduct', 'Поведение', '## 8. Поведение

От участников ожидается:
- Уважительное отношение к персоналу и другим участникам
- Следование всем инструкциям по безопасности и руководствам
- Своевременное прибытие и подготовка к опыту
- Не участвовать в каких-либо незаконных или опасных действиях

Мы оставляем за собой право удалить участников, нарушающих эти стандарты, без возврата средств.', 'Ожидаемое поведение', 'ru', true),

('terms-of-service-force-majeure', 'Форс-мажор', '## 9. Форс-мажор

Мы не несем ответственности за невыполнение наших обязательств из-за обстоятельств, находящихся вне нашего разумного контроля, включая, но не ограничиваясь, стихийные бедствия, правительственные действия, забастовки или другие непредвиденные события.', 'Положение о форс-мажоре', 'ru', true),

('terms-of-service-governing-law', 'Применимое право', '## 10. Применимое право

Эти условия регулируются и толкуются в соответствии с законами Италии. Любые споры подлежат исключительной юрисдикции судов Тренто, Италия.', 'Информация о применимом праве', 'ru', true),

('terms-of-service-changes', 'Изменения в условиях', '## 11. Изменения в условиях

Мы оставляем за собой право изменять эти условия в любое время. Изменения будут опубликованы на нашем веб-сайте и вступят в силу немедленно. Продолжение использования наших услуг означает принятие измененных условий.', 'Информация об изменениях условий', 'ru', true),

('terms-of-service-contact', 'Контактная информация', '## 12. Контактная информация

Для вопросов об этих условиях или наших услугах, пожалуйста, свяжитесь с нами:

**Garda Racing Yacht Club**  
Via del Porto 15  
38066 Riva del Garda, TN, Italy  
Email: info@gardaracing.com  
Phone: +39 345 678 9012', 'Контактная информация для запросов об условиях', 'ru', true);

-- Russian Cancellation Policy Content
INSERT INTO cms_content (slug, title, content, meta_description, language, published) VALUES
('cancellation-policy-title', 'Политика отмены', 'Политика отмены', 'Политика отмены для Garda Racing Yacht Club', 'ru', true),

('cancellation-policy-intro', 'Введение в политику отмены', 'Последнее обновление: 10 июня 2024 г.

Мы понимаем, что планы могут меняться. Наша политика отмены разработана, чтобы быть справедливой как для наших клиентов, так и для нашей бизнес-деятельности. Пожалуйста, внимательно прочитайте условия перед бронированием.', 'Введение в нашу политику отмены', 'ru', true),

('cancellation-policy-timeline', 'Сроки отмены и возвраты', '## Сроки отмены и возвраты

### 48+ часов: 100% полный возврат
Отмените за 48 часов или более до запланированного опыта для полного возврата.

### 24-48 часов: 50% возврат
Отмены между 24-48 часами получают 50% возврат от общей оплаченной суммы.

### Менее 24 часов: Без возврата
Отмены менее чем за 24 часа до отправления не подлежат возврату.', 'Информация о сроках отмены и возвратах', 'ru', true),

('cancellation-policy-weather', 'Отмены, связанные с погодой', '## Отмены, связанные с погодой

### Наша политика погоды

Безопасность - наш главный приоритет. Если погодные условия считаются небезопасными для плавания, мы отменим опыт и предложим вам следующие варианты:

- **Полный возврат:** 100% возврат обрабатывается в течение 5-7 рабочих дней
- **Перенос:** Перенос бронирования на другую доступную дату без дополнительной платы
- **Кредитный ваучер:** Получите ваучер, действительный в течение 12 месяцев

### Что составляет небезопасную погоду?

- Скорость ветра, превышающая 25 узлов (46 км/ч)
- Грозы или молнии в районе
- Видимость менее 500 метров из-за тумана
- Любые другие условия, считающиеся небезопасными нашими опытными шкиперами

Примечание: Легкий дождь, пасмурное небо или умеренные ветры обычно не приводят к отмене. Наши опыты проводятся в различных погодных условиях как часть подлинного парусного опыта.', 'Политика отмены, связанная с погодой', 'ru', true),

('cancellation-policy-how-to-cancel', 'Как отменить ваше бронирование', '## Как отменить ваше бронирование

### Онлайн-отмена
Используйте ссылку для отмены в вашем письме с подтверждением бронирования для отмены онлайн 24/7.

Это самый быстрый метод и предоставляет немедленное подтверждение вашей отмены.

### Отмена по телефону
Позвоните нам по номеру +39 345 678 9012

Доступно ежедневно с 8:00 до 19:00 (март - октябрь)

### Отмена по электронной почте
Отправьте ваш запрос на отмену на bookings@gardaracing.com

Укажите номер вашего бронирования и причину отмены', 'Как отменить ваше бронирование', 'ru', true),

('cancellation-policy-rescheduling', 'Политика переноса', '## Политика переноса

Мы понимаем, что иногда вам нужно изменить свои планы, а не отменять их полностью. Наша политика переноса предлагает гибкость:

### Бесплатный перенос
- Перенос до 48 часов до вашего опыта без дополнительной платы
- При наличии мест на вашу предпочтительную новую дату
- Можно сделать онлайн, по телефону или по электронной почте
- Нет ограничений на количество переносов (в разумных пределах)

### Поздний перенос
- Перенос в течение 24-48 часов: административный сбор €25
- Перенос менее чем за 24 часа: административный сбор €50
- При наличии мест и погодных условий', 'Информация о политике переноса', 'ru', true),

('cancellation-policy-special-circumstances', 'Особые обстоятельства', '## Особые обстоятельства

### Медицинские чрезвычайные ситуации
В случае медицинских чрезвычайных ситуаций или серьезных заболеваний мы можем отказаться от нашей стандартной политики отмены. Может потребоваться медицинская документация. Пожалуйста, свяжитесь с нами как можно скорее, чтобы обсудить вашу ситуацию.

### Ограничения на поездки
Если правительственные ограничения на поездки препятствуют вашему посещению забронированного опыта, мы предложим полный возврат или возможность переноса без штрафа.

### Групповые бронирования
Групповые бронирования (6+ человек) могут иметь разные условия отмены. Пожалуйста, обратитесь к вашему соглашению о групповом бронировании или свяжитесь с нами для конкретных условий.', 'Особые обстоятельства для отмен', 'ru', true),

('cancellation-policy-refund-processing', 'Обработка возвратов', '## Обработка возвратов

- **Возвраты на кредитные карты:** 5-7 рабочих дней
- **Возвраты банковским переводом:** 7-10 рабочих дней
- **Возвраты PayPal:** 3-5 рабочих дней

Время обработки возвратов может варьироваться в зависимости от вашего банка или поставщика платежей. Вы получите подтверждение по электронной почте, как только возврат будет обработан.', 'Информация об обработке возвратов', 'ru', true),

('cancellation-policy-no-show', 'Политика неявки', '## Политика неявки

Если вы не явитесь на запланированный опыт без предварительного уведомления, это считается неявкой, и возврат средств не предоставляется.

Пожалуйста, свяжитесь с нами как можно скорее, если вы опаздываете или не можете присутствовать.', 'Информация о политике неявки', 'ru', true),

('cancellation-policy-contact', 'Свяжитесь с нами', '## Свяжитесь с нами

Если у вас есть вопросы о нашей политике отмены или вам нужна помощь с вашим бронированием, пожалуйста, не стесняйтесь связаться с нами:

### Телефонная поддержка
+39 345 678 9012
Ежедневно: 8:00 - 19:00

### Поддержка по электронной почте
bookings@gardaracing.com
Ответ в течение 24 часов', 'Контактная информация для запросов об отмене', 'ru', true);