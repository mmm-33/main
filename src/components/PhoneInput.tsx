import React, { useState, useEffect, useMemo } from 'react';
import { Controller, Control, FieldError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { parsePhoneNumberFromString, formatPhoneNumber, isValidPhoneNumber, getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { Phone, CheckCircle, XCircle, X } from 'lucide-react';

interface PhoneInputProps {
  name: string;
  control: Control<any>;
  label?: string;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

// Популярные страны для отображения в начале списка
const POPULAR_COUNTRIES = ['US', 'GB', 'DE', 'FR', 'IT', 'ES', 'RU', 'UA', 'PL', 'NL', 'AT', 'CH'];

// Define supported language codes
type SupportedLanguageCode = 'en' | 'ru' | 'de' | 'fr' | 'it' | 'es';

// Получение названий стран на разных языках
const getCountryName = (countryCode: string, language: string): string => {
  const countryNames: Record<string, Record<SupportedLanguageCode, string>> = {
    'US': { en: 'United States', ru: 'США', de: 'Vereinigte Staaten', fr: 'États-Unis', it: 'Stati Uniti', es: 'Estados Unidos' },
    'GB': { en: 'United Kingdom', ru: 'Великобритания', de: 'Vereinigtes Königreich', fr: 'Royaume-Uni', it: 'Regno Unito', es: 'Reino Unido' },
    'DE': { en: 'Germany', ru: 'Германия', de: 'Deutschland', fr: 'Allemagne', it: 'Germania', es: 'Alemania' },
    'FR': { en: 'France', ru: 'Франция', de: 'Frankreich', fr: 'France', it: 'Francia', es: 'Francia' },
    'IT': { en: 'Italy', ru: 'Италия', de: 'Italien', fr: 'Italie', it: 'Italia', es: 'Italia' },
    'ES': { en: 'Spain', ru: 'Испания', de: 'Spanien', fr: 'Espagne', it: 'Spagna', es: 'España' },
    'RU': { en: 'Russia', ru: 'Россия', de: 'Russland', fr: 'Russie', it: 'Russia', es: 'Rusia' },
    'UA': { en: 'Ukraine', ru: 'Украина', de: 'Ukraine', fr: 'Ukraine', it: 'Ucraina', es: 'Ucrania' },
    'PL': { en: 'Poland', ru: 'Польша', de: 'Polen', fr: 'Pologne', it: 'Polonia', es: 'Polonia' },
    'NL': { en: 'Netherlands', ru: 'Нидерланды', de: 'Niederlande', fr: 'Pays-Bas', it: 'Paesi Bassi', es: 'Países Bajos' },
    'AT': { en: 'Austria', ru: 'Австрия', de: 'Österreich', fr: 'Autriche', it: 'Austria', es: 'Austria' },
    'CH': { en: 'Switzerland', ru: 'Швейцария', de: 'Schweiz', fr: 'Suisse', it: 'Svizzera', es: 'Suiza' },
    'CA': { en: 'Canada', ru: 'Канада', de: 'Kanada', fr: 'Canada', it: 'Canada', es: 'Canadá' },
    'AU': { en: 'Australia', ru: 'Австралия', de: 'Australien', fr: 'Australie', it: 'Australia', es: 'Australia' },
    'JP': { en: 'Japan', ru: 'Япония', de: 'Japan', fr: 'Japon', it: 'Giappone', es: 'Japón' },
    'CN': { en: 'China', ru: 'Китай', de: 'China', fr: 'Chine', it: 'Cina', es: 'China' },
    'IN': { en: 'India', ru: 'Индия', de: 'Indien', fr: 'Inde', it: 'India', es: 'India' },
    'BR': { en: 'Brazil', ru: 'Бразилия', de: 'Brasilien', fr: 'Brésil', it: 'Brasile', es: 'Brasil' },
    'MX': { en: 'Mexico', ru: 'Мексика', de: 'Mexiko', fr: 'Mexique', it: 'Messico', es: 'México' },
    'AR': { en: 'Argentina', ru: 'Аргентина', de: 'Argentinien', fr: 'Argentine', it: 'Argentina', es: 'Argentina' },
    'CL': { en: 'Chile', ru: 'Чили', de: 'Chile', fr: 'Chili', it: 'Cile', es: 'Chile' },
    'CO': { en: 'Colombia', ru: 'Колумбия', de: 'Kolumbien', fr: 'Colombie', it: 'Colombia', es: 'Colombia' },
    'PE': { en: 'Peru', ru: 'Перу', de: 'Peru', fr: 'Pérou', it: 'Perù', es: 'Perú' },
    'VE': { en: 'Venezuela', ru: 'Венесуэла', de: 'Venezuela', fr: 'Venezuela', it: 'Venezuela', es: 'Venezuela' },
    'ZA': { en: 'South Africa', ru: 'ЮАР', de: 'Südafrika', fr: 'Afrique du Sud', it: 'Sudafrica', es: 'Sudáfrica' },
    'EG': { en: 'Egypt', ru: 'Египет', de: 'Ägypten', fr: 'Égypte', it: 'Egitto', es: 'Egipto' },
    'NG': { en: 'Nigeria', ru: 'Нигерия', de: 'Nigeria', fr: 'Nigeria', it: 'Nigeria', es: 'Nigeria' },
    'KE': { en: 'Kenya', ru: 'Кения', de: 'Kenia', fr: 'Kenya', it: 'Kenya', es: 'Kenia' },
    'MA': { en: 'Morocco', ru: 'Марокко', de: 'Marokko', fr: 'Maroc', it: 'Marocco', es: 'Marruecos' },
    'TN': { en: 'Tunisia', ru: 'Тунис', de: 'Tunesien', fr: 'Tunisie', it: 'Tunisia', es: 'Túnez' },
    'DZ': { en: 'Algeria', ru: 'Алжир', de: 'Algerien', fr: 'Algérie', it: 'Algeria', es: 'Argelia' },
    'LY': { en: 'Libya', ru: 'Ливия', de: 'Libyen', fr: 'Libye', it: 'Libia', es: 'Libia' },
    'SD': { en: 'Sudan', ru: 'Судан', de: 'Sudan', fr: 'Soudan', it: 'Sudan', es: 'Sudán' },
    'ET': { en: 'Ethiopia', ru: 'Эфиопия', de: 'Äthiopien', fr: 'Éthiopie', it: 'Etiopia', es: 'Etiopía' },
    'GH': { en: 'Ghana', ru: 'Гана', de: 'Ghana', fr: 'Ghana', it: 'Ghana', es: 'Ghana' },
    'UG': { en: 'Uganda', ru: 'Уганда', de: 'Uganda', fr: 'Ouganda', it: 'Uganda', es: 'Uganda' },
    'TZ': { en: 'Tanzania', ru: 'Танзания', de: 'Tansania', fr: 'Tanzanie', it: 'Tanzania', es: 'Tanzania' },
    'ZW': { en: 'Zimbabwe', ru: 'Зимбабве', de: 'Simbabwe', fr: 'Zimbabwe', it: 'Zimbabwe', es: 'Zimbabue' },
    'ZM': { en: 'Zambia', ru: 'Замбия', de: 'Sambia', fr: 'Zambie', it: 'Zambia', es: 'Zambia' },
    'MW': { en: 'Malawi', ru: 'Малави', de: 'Malawi', fr: 'Malawi', it: 'Malawi', es: 'Malaui' },
    'MZ': { en: 'Mozambique', ru: 'Мозамбик', de: 'Mosambik', fr: 'Mozambique', it: 'Mozambico', es: 'Mozambique' },
    'MG': { en: 'Madagascar', ru: 'Мадагаскар', de: 'Madagaskar', fr: 'Madagascar', it: 'Madagascar', es: 'Madagascar' },
    'MU': { en: 'Mauritius', ru: 'Маврикий', de: 'Mauritius', fr: 'Maurice', it: 'Mauritius', es: 'Mauricio' },
    'SC': { en: 'Seychelles', ru: 'Сейшелы', de: 'Seychellen', fr: 'Seychelles', it: 'Seychelles', es: 'Seychelles' },
    'RE': { en: 'Réunion', ru: 'Реюньон', de: 'Réunion', fr: 'Réunion', it: 'Riunione', es: 'Reunión' },
    'YT': { en: 'Mayotte', ru: 'Майотта', de: 'Mayotte', fr: 'Mayotte', it: 'Mayotte', es: 'Mayotte' },
    'KM': { en: 'Comoros', ru: 'Коморы', de: 'Komoren', fr: 'Comores', it: 'Comore', es: 'Comoras' },
    'DJ': { en: 'Djibouti', ru: 'Джибути', de: 'Dschibuti', fr: 'Djibouti', it: 'Gibuti', es: 'Yibuti' },
    'SO': { en: 'Somalia', ru: 'Сомали', de: 'Somalia', fr: 'Somalie', it: 'Somalia', es: 'Somalia' },
    'ER': { en: 'Eritrea', ru: 'Эритрея', de: 'Eritrea', fr: 'Érythrée', it: 'Eritrea', es: 'Eritrea' },
    'SS': { en: 'South Sudan', ru: 'Южный Судан', de: 'Südsudan', fr: 'Soudan du Sud', it: 'Sudan del Sud', es: 'Sudán del Sur' },
    'CF': { en: 'Central African Republic', ru: 'ЦАР', de: 'Zentralafrikanische Republik', fr: 'République centrafricaine', it: 'Repubblica Centrafricana', es: 'República Centroafricana' },
    'TD': { en: 'Chad', ru: 'Чад', de: 'Tschad', fr: 'Tchad', it: 'Ciad', es: 'Chad' },
    'CM': { en: 'Cameroon', ru: 'Камерун', de: 'Kamerun', fr: 'Cameroun', it: 'Camerun', es: 'Camerún' },
    'GQ': { en: 'Equatorial Guinea', ru: 'Экваториальная Гвинея', de: 'Äquatorialguinea', fr: 'Guinée équatoriale', it: 'Guinea Equatoriale', es: 'Guinea Ecuatorial' },
    'GA': { en: 'Gabon', ru: 'Габон', de: 'Gabun', fr: 'Gabon', it: 'Gabon', es: 'Gabón' },
    'CG': { en: 'Republic of the Congo', ru: 'Республика Конго', de: 'Republik Kongo', fr: 'République du Congo', it: 'Repubblica del Congo', es: 'República del Congo' },
    'CD': { en: 'Democratic Republic of the Congo', ru: 'ДР Конго', de: 'Demokratische Republik Kongo', fr: 'République démocratique du Congo', it: 'Repubblica Democratica del Congo', es: 'República Democrática del Congo' },
    'AO': { en: 'Angola', ru: 'Ангола', de: 'Angola', fr: 'Angola', it: 'Angola', es: 'Angola' },
    'NA': { en: 'Namibia', ru: 'Намибия', de: 'Namibia', fr: 'Namibie', it: 'Namibia', es: 'Namibia' },
    'BW': { en: 'Botswana', ru: 'Ботсвана', de: 'Botswana', fr: 'Botswana', it: 'Botswana', es: 'Botsuana' },
    'SZ': { en: 'Eswatini', ru: 'Эсватини', de: 'Eswatini', fr: 'Eswatini', it: 'Eswatini', es: 'Esuatini' },
    'LS': { en: 'Lesotho', ru: 'Лесото', de: 'Lesotho', fr: 'Lesotho', it: 'Lesotho', es: 'Lesoto' },
    'ST': { en: 'São Tomé and Príncipe', ru: 'Сан-Томе и Принсипи', de: 'São Tomé und Príncipe', fr: 'Sao Tomé-et-Principe', it: 'São Tomé e Príncipe', es: 'Santo Tomé y Príncipe' },
    'CV': { en: 'Cape Verde', ru: 'Кабо-Верде', de: 'Kap Verde', fr: 'Cap-Vert', it: 'Capo Verde', es: 'Cabo Verde' },
    'GW': { en: 'Guinea-Bissau', ru: 'Гвинея-Бисау', de: 'Guinea-Bissau', fr: 'Guinée-Bissau', it: 'Guinea-Bissau', es: 'Guinea-Bisáu' },
    'GN': { en: 'Guinea', ru: 'Гвинея', de: 'Guinea', fr: 'Guinée', it: 'Guinea', es: 'Guinea' },
    'SL': { en: 'Sierra Leone', ru: 'Сьерра-Леоне', de: 'Sierra Leone', fr: 'Sierra Leone', it: 'Sierra Leone', es: 'Sierra Leona' },
    'LR': { en: 'Liberia', ru: 'Либерия', de: 'Liberia', fr: 'Liberia', it: 'Liberia', es: 'Liberia' },
    'CI': { en: 'Côte d\'Ivoire', ru: 'Кот-д\'Ивуар', de: 'Elfenbeinküste', fr: 'Côte d\'Ivoire', it: 'Costa d\'Avorio', es: 'Costa de Marfil' },
    'BF': { en: 'Burkina Faso', ru: 'Буркина-Фасо', de: 'Burkina Faso', fr: 'Burkina Faso', it: 'Burkina Faso', es: 'Burkina Faso' },
    'ML': { en: 'Mali', ru: 'Мали', de: 'Mali', fr: 'Mali', it: 'Mali', es: 'Malí' },
    'NE': { en: 'Niger', ru: 'Нигер', de: 'Niger', fr: 'Niger', it: 'Niger', es: 'Níger' },
    'SN': { en: 'Senegal', ru: 'Сенегал', de: 'Senegal', fr: 'Sénégal', it: 'Senegal', es: 'Senegal' },
    'GM': { en: 'Gambia', ru: 'Гамбия', de: 'Gambia', fr: 'Gambie', it: 'Gambia', es: 'Gambia' },
    'MR': { en: 'Mauritania', ru: 'Мавритания', de: 'Mauretanien', fr: 'Mauritanie', it: 'Mauritania', es: 'Mauritania' },
    'EH': { en: 'Western Sahara', ru: 'Западная Сахара', de: 'Westsahara', fr: 'Sahara occidental', it: 'Sahara Occidentale', es: 'Sáhara Occidental' },
    'KR': { en: 'South Korea', ru: 'Южная Корея', de: 'Südkorea', fr: 'Corée du Sud', it: 'Corea del Sud', es: 'Corea del Sur' },
    'KP': { en: 'North Korea', ru: 'Северная Корея', de: 'Nordkorea', fr: 'Corée du Nord', it: 'Corea del Nord', es: 'Corea del Norte' },
    'TH': { en: 'Thailand', ru: 'Таиланд', de: 'Thailand', fr: 'Thaïlande', it: 'Tailandia', es: 'Tailandia' },
    'VN': { en: 'Vietnam', ru: 'Вьетнам', de: 'Vietnam', fr: 'Vietnam', it: 'Vietnam', es: 'Vietnam' },
    'LA': { en: 'Laos', ru: 'Лаос', de: 'Laos', fr: 'Laos', it: 'Laos', es: 'Laos' },
    'KH': { en: 'Cambodia', ru: 'Камбоджа', de: 'Kambodscha', fr: 'Cambodge', it: 'Cambogia', es: 'Camboya' },
    'MM': { en: 'Myanmar', ru: 'Мьянма', de: 'Myanmar', fr: 'Myanmar', it: 'Myanmar', es: 'Birmania' },
    'MY': { en: 'Malaysia', ru: 'Малайзия', de: 'Malaysia', fr: 'Malaisie', it: 'Malesia', es: 'Malasia' },
    'SG': { en: 'Singapore', ru: 'Сингапур', de: 'Singapur', fr: 'Singapour', it: 'Singapore', es: 'Singapur' },
    'ID': { en: 'Indonesia', ru: 'Индонезия', de: 'Indonesien', fr: 'Indonésie', it: 'Indonesia', es: 'Indonesia' },
    'BN': { en: 'Brunei', ru: 'Бруней', de: 'Brunei', fr: 'Brunei', it: 'Brunei', es: 'Brunéi' },
    'PH': { en: 'Philippines', ru: 'Филиппины', de: 'Philippinen', fr: 'Philippines', it: 'Filippine', es: 'Filipinas' },
    'TW': { en: 'Taiwan', ru: 'Тайвань', de: 'Taiwan', fr: 'Taïwan', it: 'Taiwan', es: 'Taiwán' },
    'HK': { en: 'Hong Kong', ru: 'Гонконг', de: 'Hongkong', fr: 'Hong Kong', it: 'Hong Kong', es: 'Hong Kong' },
    'MO': { en: 'Macao', ru: 'Макао', de: 'Macao', fr: 'Macao', it: 'Macao', es: 'Macao' },
    'MN': { en: 'Mongolia', ru: 'Монголия', de: 'Mongolei', fr: 'Mongolie', it: 'Mongolia', es: 'Mongolia' },
    'KZ': { en: 'Kazakhstan', ru: 'Казахстан', de: 'Kasachstan', fr: 'Kazakhstan', it: 'Kazakistan', es: 'Kazajistán' },
    'KG': { en: 'Kyrgyzstan', ru: 'Киргизия', de: 'Kirgisistan', fr: 'Kirghizistan', it: 'Kirghizistan', es: 'Kirguistán' },
    'TJ': { en: 'Tajikistan', ru: 'Таджикистан', de: 'Tadschikistan', fr: 'Tadjikistan', it: 'Tagikistan', es: 'Tayikistán' },
    'UZ': { en: 'Uzbekistan', ru: 'Узбекистан', de: 'Usbekistan', fr: 'Ouzbékistan', it: 'Uzbekistan', es: 'Uzbekistán' },
    'TM': { en: 'Turkmenistan', ru: 'Туркменистан', de: 'Turkmenistan', fr: 'Turkménistan', it: 'Turkmenistan', es: 'Turkmenistán' },
    'AF': { en: 'Afghanistan', ru: 'Афганистан', de: 'Afghanistan', fr: 'Afghanistan', it: 'Afghanistan', es: 'Afganistán' },
    'PK': { en: 'Pakistan', ru: 'Пакистан', de: 'Pakistan', fr: 'Pakistan', it: 'Pakistan', es: 'Pakistán' },
    'BD': { en: 'Bangladesh', ru: 'Бангладеш', de: 'Bangladesch', fr: 'Bangladesh', it: 'Bangladesh', es: 'Bangladés' },
    'LK': { en: 'Sri Lanka', ru: 'Шри-Ланка', de: 'Sri Lanka', fr: 'Sri Lanka', it: 'Sri Lanka', es: 'Sri Lanka' },
    'MV': { en: 'Maldives', ru: 'Мальдивы', de: 'Malediven', fr: 'Maldives', it: 'Maldive', es: 'Maldivas' },
    'NP': { en: 'Nepal', ru: 'Непал', de: 'Nepal', fr: 'Népal', it: 'Nepal', es: 'Nepal' },
    'BT': { en: 'Bhutan', ru: 'Бутан', de: 'Bhutan', fr: 'Bhoutan', it: 'Bhutan', es: 'Bután' },
    'IR': { en: 'Iran', ru: 'Иран', de: 'Iran', fr: 'Iran', it: 'Iran', es: 'Irán' },
    'IQ': { en: 'Iraq', ru: 'Ирак', de: 'Irak', fr: 'Irak', it: 'Iraq', es: 'Irak' },
    'SY': { en: 'Syria', ru: 'Сирия', de: 'Syrien', fr: 'Syrie', it: 'Siria', es: 'Siria' },
    'LB': { en: 'Lebanon', ru: 'Ливан', de: 'Libanon', fr: 'Liban', it: 'Libano', es: 'Líbano' },
    'JO': { en: 'Jordan', ru: 'Иордания', de: 'Jordanien', fr: 'Jordanie', it: 'Giordania', es: 'Jordania' },
    'IL': { en: 'Israel', ru: 'Израиль', de: 'Israel', fr: 'Israël', it: 'Israele', es: 'Israel' },
    'PS': { en: 'Palestine', ru: 'Палестина', de: 'Palästina', fr: 'Palestine', it: 'Palestina', es: 'Palestina' },
    'SA': { en: 'Saudi Arabia', ru: 'Саудовская Аравия', de: 'Saudi-Arabien', fr: 'Arabie saoudite', it: 'Arabia Saudita', es: 'Arabia Saudí' },
    'YE': { en: 'Yemen', ru: 'Йемен', de: 'Jemen', fr: 'Yémen', it: 'Yemen', es: 'Yemen' },
    'OM': { en: 'Oman', ru: 'Оман', de: 'Oman', fr: 'Oman', it: 'Oman', es: 'Omán' },
    'AE': { en: 'United Arab Emirates', ru: 'ОАЭ', de: 'Vereinigte Arabische Emirate', fr: 'Émirats arabes unis', it: 'Emirati Arabi Uniti', es: 'Emiratos Árabes Unidos' },
    'QA': { en: 'Qatar', ru: 'Катар', de: 'Katar', fr: 'Qatar', it: 'Qatar', es: 'Catar' },
    'BH': { en: 'Bahrain', ru: 'Бахрейн', de: 'Bahrain', fr: 'Bahreïn', it: 'Bahrein', es: 'Baréin' },
    'KW': { en: 'Kuwait', ru: 'Кувейт', de: 'Kuwait', fr: 'Koweït', it: 'Kuwait', es: 'Kuwait' },
    'TR': { en: 'Turkey', ru: 'Турция', de: 'Türkei', fr: 'Turquie', it: 'Turchia', es: 'Turquía' },
    'CY': { en: 'Cyprus', ru: 'Кипр', de: 'Zypern', fr: 'Chypre', it: 'Cipro', es: 'Chipre' },
    'GE': { en: 'Georgia', ru: 'Грузия', de: 'Georgien', fr: 'Géorgie', it: 'Georgia', es: 'Georgia' },
    'AM': { en: 'Armenia', ru: 'Армения', de: 'Armenien', fr: 'Arménie', it: 'Armenia', es: 'Armenia' },
    'AZ': { en: 'Azerbaijan', ru: 'Азербайджан', de: 'Aserbaidschan', fr: 'Azerbaïdjan', it: 'Azerbaigian', es: 'Azerbaiyán' },
    'BY': { en: 'Belarus', ru: 'Беларусь', de: 'Belarus', fr: 'Biélorussie', it: 'Bielorussia', es: 'Bielorrusia' },
    'MD': { en: 'Moldova', ru: 'Молдова', de: 'Moldawien', fr: 'Moldavie', it: 'Moldavia', es: 'Moldavia' },
    'RO': { en: 'Romania', ru: 'Румыния', de: 'Rumänien', fr: 'Roumanie', it: 'Romania', es: 'Rumania' },
    'BG': { en: 'Bulgaria', ru: 'Болгария', de: 'Bulgarien', fr: 'Bulgarie', it: 'Bulgaria', es: 'Bulgaria' },
    'GR': { en: 'Greece', ru: 'Греция', de: 'Griechenland', fr: 'Grèce', it: 'Grecia', es: 'Grecia' },
    'MK': { en: 'North Macedonia', ru: 'Северная Македония', de: 'Nordmazedonien', fr: 'Macédoine du Nord', it: 'Macedonia del Nord', es: 'Macedonia del Norte' },
    'AL': { en: 'Albania', ru: 'Албания', de: 'Albanien', fr: 'Albanie', it: 'Albania', es: 'Albania' },
    'RS': { en: 'Serbia', ru: 'Сербия', de: 'Serbien', fr: 'Serbie', it: 'Serbia', es: 'Serbia' },
    'ME': { en: 'Montenegro', ru: 'Черногория', de: 'Montenegro', fr: 'Monténégro', it: 'Montenegro', es: 'Montenegro' },
    'BA': { en: 'Bosnia and Herzegovina', ru: 'Босния и Герцеговина', de: 'Bosnien und Herzegowina', fr: 'Bosnie-Herzégovine', it: 'Bosnia ed Erzegovina', es: 'Bosnia y Herzegovina' },
    'HR': { en: 'Croatia', ru: 'Хорватия', de: 'Kroatien', fr: 'Croatie', it: 'Croazia', es: 'Croacia' },
    'SI': { en: 'Slovenia', ru: 'Словения', de: 'Slowenien', fr: 'Slovénie', it: 'Slovenia', es: 'Eslovenia' },
    'HU': { en: 'Hungary', ru: 'Венгрия', de: 'Ungarn', fr: 'Hongrie', it: 'Ungheria', es: 'Hungría' },
    'SK': { en: 'Slovakia', ru: 'Словакия', de: 'Slowakei', fr: 'Slovaquie', it: 'Slovacchia', es: 'Eslovaquia' },
    'CZ': { en: 'Czech Republic', ru: 'Чехия', de: 'Tschechien', fr: 'République tchèque', it: 'Repubblica Ceca', es: 'República Checa' },
    'LT': { en: 'Lithuania', ru: 'Литва', de: 'Litauen', fr: 'Lituanie', it: 'Lituania', es: 'Lituania' },
    'LV': { en: 'Latvia', ru: 'Латвия', de: 'Lettland', fr: 'Lettonie', it: 'Lettonia', es: 'Letonia' },
    'EE': { en: 'Estonia', ru: 'Эстония', de: 'Estland', fr: 'Estonie', it: 'Estonia', es: 'Estonia' },
    'FI': { en: 'Finland', ru: 'Финляндия', de: 'Finnland', fr: 'Finlande', it: 'Finlandia', es: 'Finlandia' },
    'SE': { en: 'Sweden', ru: 'Швеция', de: 'Schweden', fr: 'Suède', it: 'Svezia', es: 'Suecia' },
    'NO': { en: 'Norway', ru: 'Норвегия', de: 'Norwegen', fr: 'Norvège', it: 'Norvegia', es: 'Noruega' },
    'DK': { en: 'Denmark', ru: 'Дания', de: 'Dänemark', fr: 'Danemark', it: 'Danimarca', es: 'Dinamarca' },
    'IS': { en: 'Iceland', ru: 'Исландия', de: 'Island', fr: 'Islande', it: 'Islanda', es: 'Islandia' },
    'IE': { en: 'Ireland', ru: 'Ирландия', de: 'Irland', fr: 'Irlande', it: 'Irlanda', es: 'Irlanda' },
    'BE': { en: 'Belgium', ru: 'Бельгия', de: 'Belgien', fr: 'Belgique', it: 'Belgio', es: 'Bélgica' },
    'LU': { en: 'Luxembourg', ru: 'Люксембург', de: 'Luxemburg', fr: 'Luxembourg', it: 'Lussemburgo', es: 'Luxemburgo' },
    'PT': { en: 'Portugal', ru: 'Португалия', de: 'Portugal', fr: 'Portugal', it: 'Portogallo', es: 'Portugal' },
    'AD': { en: 'Andorra', ru: 'Андорра', de: 'Andorra', fr: 'Andorre', it: 'Andorra', es: 'Andorra' },
    'MC': { en: 'Monaco', ru: 'Монако', de: 'Monaco', fr: 'Monaco', it: 'Monaco', es: 'Mónaco' },
    'LI': { en: 'Liechtenstein', ru: 'Лихтенштейн', de: 'Liechtenstein', fr: 'Liechtenstein', it: 'Liechtenstein', es: 'Liechtenstein' },
    'SM': { en: 'San Marino', ru: 'Сан-Марино', de: 'San Marino', fr: 'Saint-Marin', it: 'San Marino', es: 'San Marino' },
    'VA': { en: 'Vatican City', ru: 'Ватикан', de: 'Vatikanstadt', fr: 'Cité du Vatican', it: 'Città del Vaticano', es: 'Ciudad del Vaticano' },
    'MT': { en: 'Malta', ru: 'Мальта', de: 'Malta', fr: 'Malte', it: 'Malta', es: 'Malta' },
    'NZ': { en: 'New Zealand', ru: 'Новая Зеландия', de: 'Neuseeland', fr: 'Nouvelle-Zélande', it: 'Nuova Zelanda', es: 'Nueva Zelanda' },
    'FJ': { en: 'Fiji', ru: 'Фиджи', de: 'Fidschi', fr: 'Fidji', it: 'Figi', es: 'Fiyi' },
    'PG': { en: 'Papua New Guinea', ru: 'Папуа — Новая Гвинея', de: 'Papua-Neuguinea', fr: 'Papouasie-Nouvelle-Guinée', it: 'Papua Nuova Guinea', es: 'Papúa Nueva Guinea' },
    'SB': { en: 'Solomon Islands', ru: 'Соломоновы Острова', de: 'Salomonen', fr: 'Îles Salomon', it: 'Isole Salomone', es: 'Islas Salomón' },
    'VU': { en: 'Vanuatu', ru: 'Вануату', de: 'Vanuatu', fr: 'Vanuatu', it: 'Vanuatu', es: 'Vanuatu' },
    'KI': { en: 'Kiribati', ru: 'Кирибати', de: 'Kiribati', fr: 'Kiribati', it: 'Kiribati', es: 'Kiribati' },
    'TV': { en: 'Tuvalu', ru: 'Тувалу', de: 'Tuvalu', fr: 'Tuvalu', it: 'Tuvalu', es: 'Tuvalu' },
    'TO': { en: 'Tonga', ru: 'Тонга', de: 'Tonga', fr: 'Tonga', it: 'Tonga', es: 'Tonga' },
    'WS': { en: 'Samoa', ru: 'Самоа', de: 'Samoa', fr: 'Samoa', it: 'Samoa', es: 'Samoa' },
    'NR': { en: 'Nauru', ru: 'Науру', de: 'Nauru', fr: 'Nauru', it: 'Nauru', es: 'Nauru' },
    'FM': { en: 'Micronesia', ru: 'Микронезия', de: 'Mikronesien', fr: 'Micronésie', it: 'Micronesia', es: 'Micronesia' },
    'MH': { en: 'Marshall Islands', ru: 'Маршалловы Острова', de: 'Marshallinseln', fr: 'Îles Marshall', it: 'Isole Marshall', es: 'Islas Marshall' },
    'PW': { en: 'Palau', ru: 'Палау', de: 'Palau', fr: 'Palaos', it: 'Palau', es: 'Palaos' },
    'CK': { en: 'Cook Islands', ru: 'Острова Кука', de: 'Cookinseln', fr: 'Îles Cook', it: 'Isole Cook', es: 'Islas Cook' },
    'NU': { en: 'Niue', ru: 'Ниуэ', de: 'Niue', fr: 'Niue', it: 'Niue', es: 'Niue' },
    'TK': { en: 'Tokelau', ru: 'Токелау', de: 'Tokelau', fr: 'Tokelau', it: 'Tokelau', es: 'Tokelau' },
    'WF': { en: 'Wallis and Futuna', ru: 'Уоллис и Футуна', de: 'Wallis und Futuna', fr: 'Wallis-et-Futuna', it: 'Wallis e Futuna', es: 'Wallis y Futuna' },
    'PF': { en: 'French Polynesia', ru: 'Французская Полинезия', de: 'Französisch-Polynesien', fr: 'Polynésie française', it: 'Polinesia Francese', es: 'Polinesia Francesa' },
    'NC': { en: 'New Caledonia', ru: 'Новая Каледония', de: 'Neukaledonien', fr: 'Nouvelle-Calédonie', it: 'Nuova Caledonia', es: 'Nueva Caledonia' },
    'GU': { en: 'Guam', ru: 'Гуам', de: 'Guam', fr: 'Guam', it: 'Guam', es: 'Guam' },
    'MP': { en: 'Northern Mariana Islands', ru: 'Северные Марианские острова', de: 'Nördliche Marianen', fr: 'Îles Mariannes du Nord', it: 'Isole Marianne Settentrionali', es: 'Islas Marianas del Norte' },
    'AS': { en: 'American Samoa', ru: 'Американское Самоа', de: 'Amerikanisch-Samoa', fr: 'Samoa américaines', it: 'Samoa Americane', es: 'Samoa Americana' },
    'PR': { en: 'Puerto Rico', ru: 'Пуэрто-Рико', de: 'Puerto Rico', fr: 'Porto Rico', it: 'Porto Rico', es: 'Puerto Rico' },
    'VI': { en: 'U.S. Virgin Islands', ru: 'Виргинские Острова (США)', de: 'Amerikanische Jungferninseln', fr: 'Îles Vierges des États-Unis', it: 'Isole Vergini Americane', es: 'Islas Vírgenes de los Estados Unidos' },
    'VG': { en: 'British Virgin Islands', ru: 'Виргинские Острова (Великобритания)', de: 'Britische Jungferninseln', fr: 'Îles Vierges britanniques', it: 'Isole Vergini Britanniche', es: 'Islas Vírgenes Británicas' },
    'AI': { en: 'Anguilla', ru: 'Ангилья', de: 'Anguilla', fr: 'Anguilla', it: 'Anguilla', es: 'Anguila' },
    'AG': { en: 'Antigua and Barbuda', ru: 'Антигуа и Барбуда', de: 'Antigua und Barbuda', fr: 'Antigua-et-Barbuda', it: 'Antigua e Barbuda', es: 'Antigua y Barbuda' },
    'KN': { en: 'Saint Kitts and Nevis', ru: 'Сент-Китс и Невис', de: 'St. Kitts und Nevis', fr: 'Saint-Christophe-et-Niévès', it: 'Saint Kitts e Nevis', es: 'San Cristóbal y Nieves' },
    'DM': { en: 'Dominica', ru: 'Доминика', de: 'Dominica', fr: 'Dominique', it: 'Dominica', es: 'Dominica' },
    'LC': { en: 'Saint Lucia', ru: 'Сент-Люсия', de: 'St. Lucia', fr: 'Sainte-Lucie', it: 'Santa Lucia', es: 'Santa Lucía' },
    'VC': { en: 'Saint Vincent and the Grenadines', ru: 'Сент-Винсент и Гренадины', de: 'St. Vincent und die Grenadinen', fr: 'Saint-Vincent-et-les-Grenadines', it: 'Saint Vincent e Grenadine', es: 'San Vicente y las Granadinas' },
    'GD': { en: 'Grenada', ru: 'Гренада', de: 'Grenada', fr: 'Grenade', it: 'Grenada', es: 'Granada' },
    'BB': { en: 'Barbados', ru: 'Барбадос', de: 'Barbados', fr: 'Barbade', it: 'Barbados', es: 'Barbados' },
    'TT': { en: 'Trinidad and Tobago', ru: 'Тринидад и Тобаго', de: 'Trinidad und Tobago', fr: 'Trinité-et-Tobago', it: 'Trinidad e Tobago', es: 'Trinidad y Tobago' },
    'JM': { en: 'Jamaica', ru: 'Ямайка', de: 'Jamaika', fr: 'Jamaïque', it: 'Giamaica', es: 'Jamaica' },
    'BS': { en: 'Bahamas', ru: 'Багамы', de: 'Bahamas', fr: 'Bahamas', it: 'Bahamas', es: 'Bahamas' },
    'CU': { en: 'Cuba', ru: 'Куба', de: 'Kuba', fr: 'Cuba', it: 'Cuba', es: 'Cuba' },
    'HT': { en: 'Haiti', ru: 'Гаити', de: 'Haiti', fr: 'Haïti', it: 'Haiti', es: 'Haití' },
    'DO': { en: 'Dominican Republic', ru: 'Доминиканская Республика', de: 'Dominikanische Republik', fr: 'République dominicaine', it: 'Repubblica Dominicana', es: 'República Dominicana' },
    'BZ': { en: 'Belize', ru: 'Белиз', de: 'Belize', fr: 'Belize', it: 'Belize', es: 'Belice' },
    'GT': { en: 'Guatemala', ru: 'Гватемала', de: 'Guatemala', fr: 'Guatemala', it: 'Guatemala', es: 'Guatemala' },
    'SV': { en: 'El Salvador', ru: 'Сальвадор', de: 'El Salvador', fr: 'Salvador', it: 'El Salvador', es: 'El Salvador' },
    'HN': { en: 'Honduras', ru: 'Гондурас', de: 'Honduras', fr: 'Honduras', it: 'Honduras', es: 'Honduras' },
    'NI': { en: 'Nicaragua', ru: 'Никарагуа', de: 'Nicaragua', fr: 'Nicaragua', it: 'Nicaragua', es: 'Nicaragua' },
    'CR': { en: 'Costa Rica', ru: 'Коста-Рика', de: 'Costa Rica', fr: 'Costa Rica', it: 'Costa Rica', es: 'Costa Rica' },
    'PA': { en: 'Panama', ru: 'Панама', de: 'Panama', fr: 'Panama', it: 'Panama', es: 'Panamá' },
    'EC': { en: 'Ecuador', ru: 'Эквадор', de: 'Ecuador', fr: 'Équateur', it: 'Ecuador', es: 'Ecuador' },
    'BO': { en: 'Bolivia', ru: 'Боливия', de: 'Bolivien', fr: 'Bolivie', it: 'Bolivia', es: 'Bolivia' },
    'PY': { en: 'Paraguay', ru: 'Парагвай', de: 'Paraguay', fr: 'Paraguay', it: 'Paraguay', es: 'Paraguay' },
    'UY': { en: 'Uruguay', ru: 'Уругвай', de: 'Uruguay', fr: 'Uruguay', it: 'Uruguay', es: 'Uruguay' },
    'GY': { en: 'Guyana', ru: 'Гайана', de: 'Guyana', fr: 'Guyana', it: 'Guyana', es: 'Guyana' },
    'SR': { en: 'Suriname', ru: 'Суринам', de: 'Suriname', fr: 'Suriname', it: 'Suriname', es: 'Surinam' },
    'GF': { en: 'French Guiana', ru: 'Французская Гвиана', de: 'Französisch-Guayana', fr: 'Guyane française', it: 'Guyana Francese', es: 'Guayana Francesa' },
    'FK': { en: 'Falkland Islands', ru: 'Фолклендские острова', de: 'Falklandinseln', fr: 'Îles Malouines', it: 'Isole Falkland', es: 'Islas Malvinas' },
    'GL': { en: 'Greenland', ru: 'Гренландия', de: 'Grönland', fr: 'Groenland', it: 'Groenlandia', es: 'Groenlandia' },
    'PM': { en: 'Saint Pierre and Miquelon', ru: 'Сен-Пьер и Микелон', de: 'Saint-Pierre und Miquelon', fr: 'Saint-Pierre-et-Miquelon', it: 'Saint-Pierre e Miquelon', es: 'San Pedro y Miquelón' },
    'BM': { en: 'Bermuda', ru: 'Бермуды', de: 'Bermuda', fr: 'Bermudes', it: 'Bermuda', es: 'Bermudas' },
    'TC': { en: 'Turks and Caicos Islands', ru: 'Теркс и Кайкос', de: 'Turks- und Caicosinseln', fr: 'Îles Turques-et-Caïques', it: 'Isole Turks e Caicos', es: 'Islas Turcas y Caicos' },
    'KY': { en: 'Cayman Islands', ru: 'Каймановы острова', de: 'Kaimaninseln', fr: 'Îles Caïmans', it: 'Isole Cayman', es: 'Islas Caimán' },
    'MS': { en: 'Montserrat', ru: 'Монтсеррат', de: 'Montserrat', fr: 'Montserrat', it: 'Montserrat', es: 'Montserrat' },
    'SX': { en: 'Sint Maarten', ru: 'Синт-Мартен', de: 'Sint Maarten', fr: 'Saint-Martin', it: 'Sint Maarten', es: 'Sint Maarten' },
    'MF': { en: 'Saint Martin', ru: 'Сен-Мартен', de: 'Saint-Martin', fr: 'Saint-Martin', it: 'Saint-Martin', es: 'San Martín' },
    'BL': { en: 'Saint Barthélemy', ru: 'Сен-Бартелеми', de: 'Saint-Barthélemy', fr: 'Saint-Barthélemy', it: 'Saint-Barthélemy', es: 'San Bartolomé' },
    'GP': { en: 'Guadeloupe', ru: 'Гваделупа', de: 'Guadeloupe', fr: 'Guadeloupe', it: 'Guadalupa', es: 'Guadalupe' },
    'MQ': { en: 'Martinique', ru: 'Мартиника', de: 'Martinique', fr: 'Martinique', it: 'Martinica', es: 'Martinica' },
    'AW': { en: 'Aruba', ru: 'Аруба', de: 'Aruba', fr: 'Aruba', it: 'Aruba', es: 'Aruba' },
    'CW': { en: 'Curaçao', ru: 'Кюрасао', de: 'Curaçao', fr: 'Curaçao', it: 'Curaçao', es: 'Curazao' },
    'BQ': { en: 'Caribbean Netherlands', ru: 'Карибские Нидерланды', de: 'Karibische Niederlande', fr: 'Pays-Bas caribéens', it: 'Paesi Bassi caraibici', es: 'Caribe Neerlandés' },
    'FO': { en: 'Faroe Islands', ru: 'Фарерские острова', de: 'Färöer', fr: 'Îles Féroé', it: 'Isole Fær Øer', es: 'Islas Feroe' },
    'AX': { en: 'Åland Islands', ru: 'Аландские острова', de: 'Åland', fr: 'Îles Åland', it: 'Isole Åland', es: 'Islas Åland' },
    'SJ': { en: 'Svalbard and Jan Mayen', ru: 'Шпицберген и Ян-Майен', de: 'Spitzbergen und Jan Mayen', fr: 'Svalbard et Jan Mayen', it: 'Svalbard e Jan Mayen', es: 'Svalbard y Jan Mayen' },
    'GI': { en: 'Gibraltar', ru: 'Гибралтар', de: 'Gibraltar', fr: 'Gibraltar', it: 'Gibilterra', es: 'Gibraltar' },
    'IM': { en: 'Isle of Man', ru: 'Остров Мэн', de: 'Isle of Man', fr: 'Île de Man', it: 'Isola di Man', es: 'Isla de Man' },
    'GG': { en: 'Guernsey', ru: 'Гернси', de: 'Guernsey', fr: 'Guernesey', it: 'Guernsey', es: 'Guernsey' },
    'JE': { en: 'Jersey', ru: 'Джерси', de: 'Jersey', fr: 'Jersey', it: 'Jersey', es: 'Jersey' },
  };

  // Получаем название страны на нужном языке или на английском, если перевод отсутствует
  const langKey = language.split('-')[0] as SupportedLanguageCode;
  return countryNames[countryCode]?.[langKey] || countryNames[countryCode]?.en || countryCode;
};

// Флаги стран в виде эмодзи
const getCountryFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
};

const PhoneInput: React.FC<PhoneInputProps> = ({
  name,
  control,
  label,
  error,
  disabled = false,
  required = false,
  placeholder,
  className = '',
}) => {
  const { t, i18n } = useTranslation();
  const [countryCode, setCountryCode] = useState<string>('IT'); // По умолчанию Италия, так как сайт про озеро Гарда
  const [nationalNumber, setNationalNumber] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [formattedNumber, setFormattedNumber] = useState<string>('');
  const [isFocused, setIsFocused] = useState<boolean>(false);

  // Получаем список стран
  const countries = useMemo(() => {
    const allCountries = getCountries();
    
    // Сортируем страны: сначала популярные, затем все остальные по алфавиту
    const popularCountriesSet = new Set(POPULAR_COUNTRIES);
    const popularCountries = POPULAR_COUNTRIES.filter(code => allCountries.includes(code));
    const otherCountries = allCountries
      .filter(code => !popularCountriesSet.has(code))
      .sort((a, b) => {
        const nameA = getCountryName(a, i18n.language);
        const nameB = getCountryName(b, i18n.language);
        return nameA.localeCompare(nameB);
      });
    
    return [...popularCountries, ...otherCountries];
  }, [i18n.language]);

  // Обработка изменения номера телефона
  const handlePhoneNumberChange = (
    countryCode: string,
    nationalNumber: string,
    onChange: (value: string) => void
  ) => {
    setNationalNumber(nationalNumber);
    
    // Форматируем номер для отображения
    try {
      const phoneNumber = parsePhoneNumberFromString(nationalNumber, countryCode);
      
      if (phoneNumber) {
        // Устанавливаем отформатированный номер для отображения
        setFormattedNumber(phoneNumber.formatNational());
        
        // Проверяем валидность номера
        const valid = isValidPhoneNumber(phoneNumber.number);
        setIsValid(valid);
        
        // Передаем полный номер в формате E.164 в форму
        onChange(phoneNumber.number);
      } else {
        setFormattedNumber(nationalNumber);
        setIsValid(false);
        onChange(`+${getCountryCallingCode(countryCode)}${nationalNumber}`);
      }
    } catch (error) {
      console.error('Error formatting phone number:', error);
      setFormattedNumber(nationalNumber);
      setIsValid(false);
      onChange(`+${getCountryCallingCode(countryCode)}${nationalNumber}`);
    }
  };

  // Обработка вставки номера из буфера обмена
  const handlePaste = (
    e: React.ClipboardEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    try {
      // Пытаемся распарсить вставленный номер
      const phoneNumber = parsePhoneNumberFromString(pastedText);
      
      if (phoneNumber) {
        // Если номер валидный, устанавливаем страну и национальный номер
        setCountryCode(phoneNumber.country || countryCode);
        setNationalNumber(phoneNumber.nationalNumber);
        setFormattedNumber(phoneNumber.formatNational());
        setIsValid(true);
        onChange(phoneNumber.number);
      } else {
        // Если не удалось распарсить, просто вставляем текст как есть
        setNationalNumber(pastedText);
        setFormattedNumber(pastedText);
        setIsValid(false);
        onChange(`+${getCountryCallingCode(countryCode)}${pastedText}`);
      }
    } catch (error) {
      console.error('Error parsing pasted phone number:', error);
      setNationalNumber(pastedText);
      setFormattedNumber(pastedText);
      setIsValid(false);
      onChange(`+${getCountryCallingCode(countryCode)}${pastedText}`);
    }
  };

  // Очистка поля ввода
  const handleClear = (onChange: (value: string) => void) => {
    setNationalNumber('');
    setFormattedNumber('');
    setIsValid(null);
    onChange('');
  };

  // Определение класса для индикации валидности
  const getValidationClass = () => {
    if (isValid === null) return '';
    return isValid ? 'border-green-500 focus:ring-green-500' : 'border-red-500 focus:ring-red-500';
  };

  // Определение иконки для индикации валидности
  const ValidationIcon = () => {
    if (isValid === null || !nationalNumber) return null;
    
    return isValid ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    );
  };

  return (
    <div className={`${className}`}>
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <Controller
        name={name}
        control={control}
        render={({ field: { onChange, value, ref } }) => {
          // При первой загрузке компонента с существующим значением
          useEffect(() => {
            if (value && typeof value === 'string' && !nationalNumber) {
              try {
                const phoneNumber = parsePhoneNumberFromString(value);
                if (phoneNumber) {
                  setCountryCode(phoneNumber.country || countryCode);
                  setNationalNumber(phoneNumber.nationalNumber);
                  setFormattedNumber(phoneNumber.formatNational());
                  setIsValid(true);
                }
              } catch (error) {
                console.error('Error parsing initial phone number:', error);
              }
            }
          }, []);

          return (
            <div className="relative">
              <div className="flex">
                {/* Выбор кода страны */}
                <div className="relative">
                  <select
                    value={countryCode}
                    onChange={(e) => {
                      setCountryCode(e.target.value);
                      handlePhoneNumberChange(e.target.value, nationalNumber, onChange);
                    }}
                    disabled={disabled}
                    className={`
                      w-32 px-2 py-3 border border-gray-300 rounded-l-lg
                      focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                      bg-gray-50 text-gray-900
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    aria-label={t('forms.selectCountry', 'Select country')}
                  >
                    {countries.map((code) => (
                      <option key={code} value={code}>
                        {getCountryFlag(code)} +{getCountryCallingCode(code)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Поле ввода номера */}
                <div className="relative flex-1">
                  <input
                    type="tel"
                    value={formattedNumber}
                    onChange={(e) => {
                      // Удаляем все нецифровые символы для обработки
                      const digits = e.target.value.replace(/\D/g, '');
                      handlePhoneNumberChange(countryCode, digits, onChange);
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onPaste={(e) => handlePaste(e, onChange)}
                    disabled={disabled}
                    placeholder={placeholder || t('forms.phoneNumberPlaceholder', 'Phone number')}
                    className={`
                      w-full px-4 py-3 border border-l-0 border-gray-300 rounded-r-lg
                      focus:outline-none focus:ring-2 focus:border-transparent
                      ${getValidationClass()}
                      ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                    ref={ref}
                    aria-invalid={error ? 'true' : 'false'}
                    aria-describedby={error ? `${name}-error` : undefined}
                  />

                  {/* Иконка валидации */}
                  {nationalNumber && (
                    <div className="absolute inset-y-0 right-10 flex items-center pr-3 pointer-events-none">
                      <ValidationIcon />
                    </div>
                  )}

                  {/* Кнопка очистки */}
                  {nationalNumber && !disabled && (
                    <button
                      type="button"
                      onClick={() => handleClear(onChange)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      aria-label={t('forms.clear', 'Clear')}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Сообщение об ошибке */}
              {error && (
                <p id={`${name}-error`} className="mt-1 text-sm text-red-600">
                  {error.message}
                </p>
              )}
              
              {/* Подсказка о формате */}
              {isFocused && !error && (
                <p className="mt-1 text-xs text-gray-500">
                  {t('forms.phoneNumberFormat', 'Enter phone number in national format')}
                </p>
              )}
            </div>
          );
        }}
      />
    </div>
  );
};

export default PhoneInput;