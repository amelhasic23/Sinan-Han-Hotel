const fs = require('fs');
let content = fs.readFileSync('SiminHan.min.js', 'utf8');

const additions = {
  en: {
    'footer-registration': 'Business Registration',
    'footer-registration-title': 'View official business registration document',
    'reg-title': 'Business Classification Notice',
    'reg-country': 'BOSNIA AND HERZEGOVINA',
    'reg-entity': 'FEDERATION OF BOSNIA AND HERZEGOVINA',
    'reg-institute': 'FEDERAL INSTITUTE OF STATISTICS SARAJEVO',
    'reg-dept': 'STATISTICS DEPT. FOR HERZEGOVINA-NERETVA CANTON REGION MOSTAR',
    'reg-number-label': 'Number:',
    'reg-date-label': 'Date:',
    'reg-law-basis': 'Pursuant to Article 7, Paragraph (1) and Article 11 of the Law on Classification of Activities in the Federation of BiH (Official Gazette of FBiH, No. 64/07 and 80/11), the following is issued:',
    'reg-notice-title': 'NOTICE ON CLASSIFICATION OF BUSINESS ENTITY ACCORDING TO ACTIVITY CLASSIFICATION',
    'reg-name-label': 'Business Name:',
    'reg-name-value': 'Accommodation in household "SINAN-HAN", owner Arif Jašari',
    'reg-address-label': 'Registered address:',
    'reg-id-label': 'ID Number:',
    'reg-code-label': 'Activity Code (KD BiH 2010):',
    'reg-activity-label': 'Activity Name:',
    'reg-activity-value': 'Holiday and other short-stay accommodation',
    'reg-explanation-title': 'Explanation:',
    'reg-explanation-p1': 'In the procedure conducted at the request of the party, or ex officio, it was determined that the conditions from Articles 9 and 11 of the Law on Classification of Activities in the Federation of Bosnia and Herzegovina have been met for issuing this notice.',
    'reg-explanation-p2': 'If the business entity considers that it has been incorrectly classified, it has the right within 15 days of receipt of this notice to submit to this Institute a request for reclassification with the required documentation.',
    'reg-authority-title': 'BY AUTHORITY OF THE DIRECTOR, CHIEF'
  },
  bs: {
    'footer-registration': 'Registracija djelatnosti',
    'footer-registration-title': 'Pogledajte službeni dokument o registraciji djelatnosti',
    'reg-title': 'Obavještenje o razvrstavanju',
    'reg-country': 'BOSNA I HERCEGOVINA',
    'reg-entity': 'FEDERACIJA BOSNE I HERCEGOVINE',
    'reg-institute': 'FEDERALNI ZAVOD ZA STATISTIKU SARAJEVO',
    'reg-dept': 'SLUŽBA ZA STATISTIKU ZA PODRUČJE HERCEGOVAČKO-NERETVANSKOG KANTONA MOSTAR',
    'reg-number-label': 'Broj:',
    'reg-date-label': 'Datum:',
    'reg-law-basis': 'Na osnovu člana 7. stav (1) i člana 11. Zakona o klasifikaciji djelatnosti u Federaciji Bosne i Hercegovine ("Službene novine Federacije BiH", br. 64/07 i 80/11), izdaje se:',
    'reg-notice-title': 'OBAVJEŠTENJE O RAZVRSTAVANJU POSLOVNOG SUBJEKTA PREMA KLASIFIKACIJI DJELATNOSTI',
    'reg-name-label': 'Naziv poslovnog subjekta:',
    'reg-name-value': 'Sobe u domaćinstvu "SINAN-HAN" vl. Arif Jašari',
    'reg-address-label': 'Sjedište i adresa:',
    'reg-id-label': 'Identifikacioni broj (ID):',
    'reg-code-label': 'Šifra djelatnosti (KD BIH 2010):',
    'reg-activity-label': 'Naziv djelatnosti:',
    'reg-activity-value': 'Odmarališta i slični objekti za kraći odmor',
    'reg-explanation-title': 'Obrazloženje:',
    'reg-explanation-p1': 'U postupku provedenom po zahtjevu stranke, odnosno službenoj dužnosti, utvrđeno je da su ispunjene pretpostavke iz člana 9. i 11. Zakona o klasifikaciji djelatnosti u Federaciji Bosne i Hercegovine, za izdavanje ovog obavještenja.',
    'reg-explanation-p2': 'Ukoliko poslovni subjekt smatra da je nepravilno razvrstan, ima pravo u roku od 15 dana od dana prijema ovog obavještenja podnijeti ovom Zavodu zahtjev za ponovno razvrstavanje sa potrebnom dokumentacijom.',
    'reg-authority-title': 'OVLAŠTENJU DIREKTORA NAČELNIK'
  },
  de: {
    'footer-registration': 'Gewerbeanmeldung',
    'footer-registration-title': 'Offizielles Gewerbeanmeldedokument anzeigen',
    'reg-title': 'Gewerbeklassifizierungsmitteilung',
    'reg-country': 'BOSNIEN UND HERZEGOWINA',
    'reg-entity': 'FÖDERATION BOSNIEN UND HERZEGOWINA',
    'reg-institute': 'FÖDERALES STATISTIKINSTITUT SARAJEVO',
    'reg-dept': 'STATISTIKABT. FÜR DEN KANTON HERZEGOWINA-NERETVA REGION MOSTAR',
    'reg-number-label': 'Nummer:',
    'reg-date-label': 'Datum:',
    'reg-law-basis': 'Gemäß Artikel 7, Absatz (1) und Artikel 11 des Gesetzes über die Klassifizierung der Tätigkeiten in der Föderation BiH (Amtsblatt FBiH, Nr. 64/07 und 80/11) wird Folgendes ausgestellt:',
    'reg-notice-title': 'MITTEILUNG ÜBER DIE KLASSIFIZIERUNG DES UNTERNEHMENS GEMÄß DER TÄTIGKEITSKLASSIFIZIERUNG',
    'reg-name-label': 'Unternehmensname:',
    'reg-name-value': 'Unterkunft im Haushalt "SINAN-HAN", Inhaber Arif Jašari',
    'reg-address-label': 'Eingetragene Adresse:',
    'reg-id-label': 'ID-Nummer:',
    'reg-code-label': 'Tätigkeitscode (KD BiH 2010):',
    'reg-activity-label': 'Tätigkeitsbezeichnung:',
    'reg-activity-value': 'Ferienunterkünfte und ähnliche Objekte für Kurzaufenthalte',
    'reg-explanation-title': 'Begründung:',
    'reg-explanation-p1': 'Im auf Antrag der Partei bzw. von Amts wegen durchgeführten Verfahren wurde festgestellt, dass die Voraussetzungen aus Artikel 9 und 11 des Gesetzes über die Klassifizierung der Tätigkeiten in der Föderation Bosnien und Herzegowina für die Ausstellung dieser Mitteilung erfüllt sind.',
    'reg-explanation-p2': 'Wenn das Unternehmen der Meinung ist, dass es falsch eingestuft wurde, hat es das Recht, innerhalb von 15 Tagen nach Erhalt dieser Mitteilung beim Institut einen Antrag auf Neuklassifizierung mit den erforderlichen Unterlagen einzureichen.',
    'reg-authority-title': 'IM AUFTRAG DES DIREKTORS, ABTEILUNGSLEITER'
  },
  fr: {
    'footer-registration': 'Enregistrement commercial',
    'footer-registration-title': "Voir le document officiel d\\'immatriculation de l\\'entreprise",
    'reg-title': "Avis de classification d\\'activité",
    'reg-country': 'BOSNIE-HERZÉGOVINE',
    'reg-entity': 'FÉDÉRATION DE BOSNIE-HERZÉGOVINE',
    'reg-institute': 'INSTITUT FÉDÉRAL DE STATISTIQUE DE SARAJEVO',
    'reg-dept': 'DÉPARTEMENT STATISTIQUE POUR LA RÉGION DU CANTON HERZÉGOVINE-NERETVA MOSTAR',
    'reg-number-label': 'Numéro :',
    'reg-date-label': 'Date :',
    'reg-law-basis': "Conformément à l\\'article 7, paragraphe (1) et à l\\'article 11 de la loi sur la classification des activités en Fédération de BiH (Journal officiel FBiH, n° 64/07 et 80/11), ce qui suit est délivré :",
    'reg-notice-title': "AVIS DE CLASSIFICATION DE L\\'ENTITÉ COMMERCIALE SELON LA CLASSIFICATION DES ACTIVITÉS",
    'reg-name-label': "Nom de l\\'entreprise :",
    'reg-name-value': '"SINAN-HAN", propriétaire Arif Jašari',
    'reg-address-label': 'Adresse enregistrée :',
    'reg-id-label': 'Numéro ID :',
    'reg-code-label': 'Code activité (KD BiH 2010) :',
    'reg-activity-label': "Nom de l\\'activité :",
    'reg-activity-value': 'Hébergements de vacances et autres logements de courte durée',
    'reg-explanation-title': 'Justification :',
    'reg-explanation-p1': "Dans la procédure menée à la demande de la partie ou d\\'office, il a été déterminé que les conditions des articles 9 et 11 de la loi sur la classification des activités en Fédération de Bosnie-Herzégovine sont remplies pour la délivrance du présent avis.",
    'reg-explanation-p2': "Si l\\'entité commerciale estime qu\\'elle a été incorrectement classée, elle a le droit, dans les 15 jours suivant la réception du présent avis, de soumettre à cet Institut une demande de reclassification avec la documentation requise.",
    'reg-authority-title': 'PAR DÉLÉGATION DU DIRECTEUR, CHEF DE SERVICE'
  },
  it: {
    'footer-registration': 'Registrazione aziendale',
    'footer-registration-title': "Visualizza il documento ufficiale di registrazione dell\\'attività",
    'reg-title': "Avviso di classificazione dell\\'attività",
    'reg-country': 'BOSNIA ED ERZEGOVINA',
    'reg-entity': 'FEDERAZIONE DI BOSNIA ED ERZEGOVINA',
    'reg-institute': 'ISTITUTO FEDERALE DI STATISTICA DI SARAJEVO',
    'reg-dept': 'DIPP. STATISTICHE PER LA REGIONE DEL CANTONE ERZEGOVINA-NERETVA MOSTAR',
    'reg-number-label': 'Numero:',
    'reg-date-label': 'Data:',
    'reg-law-basis': "Ai sensi dell\\'articolo 7, paragrafo (1) e dell\\'articolo 11 della legge sulla classificazione delle attività nella Federazione BiH (Gazzetta ufficiale FBiH, n. 64/07 e 80/11), viene emesso quanto segue:",
    'reg-notice-title': "AVVISO DI CLASSIFICAZIONE DEL SOGGETTO COMMERCIALE SECONDO LA CLASSIFICAZIONE DELLE ATTIVITÀ",
    'reg-name-label': "Nome dell\\'impresa:",
    'reg-name-value': '"SINAN-HAN", proprietario Arif Jašari',
    'reg-address-label': 'Indirizzo registrato:',
    'reg-id-label': 'Numero ID:',
    'reg-code-label': 'Codice attività (KD BiH 2010):',
    'reg-activity-label': "Nome dell\\'attività:",
    'reg-activity-value': 'Strutture ricettive per vacanze e alloggi simili per soggiorni brevi',
    'reg-explanation-title': 'Motivazione:',
    'reg-explanation-p1': "Nel procedimento condotto su richiesta della parte o d\\'ufficio, è stato accertato che sono soddisfatte le condizioni degli articoli 9 e 11 della legge sulla classificazione delle attività nella Federazione di Bosnia ed Erzegovina per il rilascio del presente avviso.",
    'reg-explanation-p2': "Se il soggetto commerciale ritiene di essere stato classificato in modo errato, ha il diritto, entro 15 giorni dal ricevimento del presente avviso, di presentare all\\'Istituto una richiesta di riclassificazione con la documentazione necessaria.",
    'reg-authority-title': 'PER DELEGA DEL DIRETTORE, CAPO SEZIONE'
  },
  tr: {
    'footer-registration': 'İşletme Kaydı',
    'footer-registration-title': 'Resmi işletme kayıt belgesini görüntüleyin',
    'reg-title': 'Faaliyet Sınıflandırma Bildirimi',
    'reg-country': 'BOSNA-HERSEK',
    'reg-entity': 'BOSNA-HERSEK FEDERASYONU',
    'reg-institute': 'FEDERASYON İSTATİSTİK ENSTİTÜSÜ SARAJEVO',
    'reg-dept': 'HERSEK-NERETVA KANTON BÖLGESİ İSTATİSTİK MÜDÜRLÜĞÜ MOSTAR',
    'reg-number-label': 'Numara:',
    'reg-date-label': 'Tarih:',
    'reg-law-basis': "BiH Federasyonu'ndaki Faaliyet Sınıflandırması Kanunu'nun (FBiH Resmi Gazetesi, No. 64/07 ve 80/11) 7. Maddesi, (1). Fıkrası ve 11. Maddesi uyarınca aşağıdakiler düzenlenmektedir:",
    'reg-notice-title': 'FAALİYET SINIFLANDIRMASINA GÖRE TİCARİ KURULUŞUN SINIFLANDIRILMASI HAKKINDA BİLDİRİM',
    'reg-name-label': 'İşletme Adı:',
    'reg-name-value': '"SINAN-HAN", sahip Arif Jašari',
    'reg-address-label': 'Kayıtlı Adres:',
    'reg-id-label': 'Kimlik Numarası:',
    'reg-code-label': 'Faaliyet Kodu (KD BiH 2010):',
    'reg-activity-label': 'Faaliyet Adı:',
    'reg-activity-value': 'Tatil ve benzeri kısa süreli konaklama tesisleri',
    'reg-explanation-title': 'Gerekçe:',
    'reg-explanation-p1': "Tarafın talebi veya resen yürütülen prosedürde, bu bildirimin verilmesi için Bosna-Hersek Federasyonu'ndaki Faaliyet Sınıflandırması Kanunu'nun 9. ve 11. maddelerindeki koşulların karşılandığı tespit edilmiştir.",
    'reg-explanation-p2': "Ticari kuruluş hatalı sınıflandırıldığını düşünüyorsa, bu bildirimin alınmasından itibaren 15 gün içinde gerekli belgelerle Enstitü'ye yeniden sınıflandırma talebinde bulunma hakkına sahiptir.",
    'reg-authority-title': 'MÜDÜRİN YETKİSİYLE, ŞUBE MÜDÜRİ'
  },
  ar: {
    'footer-registration': 'التسجيل التجاري',
    'footer-registration-title': 'عرض وثيقة التسجيل التجاري الرسمية',
    'reg-title': 'إشعار تصنيف النشاط التجاري',
    'reg-country': 'البوسنة والهرسك',
    'reg-entity': 'اتحاد البوسنة والهرسك',
    'reg-institute': 'معهد الإحصاء الفيدرالي سراييفو',
    'reg-dept': 'قسم الإحصاء لمنطقة كانتون الهرسك-نيريتفا موستار',
    'reg-number-label': 'الرقم:',
    'reg-date-label': 'التاريخ:',
    'reg-law-basis': 'استناداً إلى المادة 7، الفقرة (1) والمادة 11 من قانون تصنيف الأنشطة في اتحاد البوسنة والهرسك (الجريدة الرسمية لاتحاد البوسنة والهرسك، رقم 64/07 و80/11)، يُصدَر ما يلي:',
    'reg-notice-title': 'إشعار تصنيف الكيان التجاري وفق تصنيف الأنشطة',
    'reg-name-label': 'اسم الشركة:',
    'reg-name-value': '"SINAN-HAN"، المالك أريف ياشاري',
    'reg-address-label': 'العنوان المسجّل:',
    'reg-id-label': 'رقم الهوية:',
    'reg-code-label': 'رمز النشاط (KD BiH 2010):',
    'reg-activity-label': 'اسم النشاط:',
    'reg-activity-value': 'المنتجعات ومنشآت الإقامة المماثلة للإقامة القصيرة',
    'reg-explanation-title': 'التعليل:',
    'reg-explanation-p1': 'في الإجراء المُنفَّذ بناءً على طلب الطرف أو من تلقاء الجهة الرسمية، تبيَّن أن الشروط المنصوص عليها في المادتين 9 و11 من قانون تصنيف الأنشطة في اتحاد البوسنة والهرسك مستوفاةٌ لإصدار هذا الإشعار.',
    'reg-explanation-p2': 'إذا رأى الكيان التجاري أنه صُنِّف بشكل خاطئ، فله الحق في غضون 15 يومًا من استلام هذا الإشعار تقديم طلب إعادة التصنيف إلى هذه الهيئة مع الوثائق المطلوبة.',
    'reg-authority-title': 'بتفويض المدير، رئيس القسم'
  }
};

// Unique ending for each language's li-health-text value in the minified file
const langEndings = {
  en: "are in effect at this property.'",
  bs: "su na snazi u ovom smještaju.'",
  de: "und Hygienevorschriften.'",
  fr: "sont en vigueur dans cet établissement.'",
  it: "sono in vigore ulteriori misure di sicurezza e igiene.'",
  tr: "önlemleri alınmaktadır.'",
  ar: "في هذا الفندق.'"
};

for (const [lang, keys] of Object.entries(additions)) {
  const ending = langEndings[lang];
  let extra = '';
  for (const [k, v] of Object.entries(keys)) {
    extra += ",'" + k + "':'" + v + "'";
  }
  const newEnding = ending + extra;
  if (content.includes(ending)) {
    content = content.replace(ending, newEnding);
    console.log('Updated ' + lang + ': added ' + Object.keys(keys).length + ' keys');
  } else {
    console.log('ERROR: Could not find ending for ' + lang + ': ' + ending);
  }
}

fs.writeFileSync('SiminHan.min.js', content, 'utf8');
console.log('Done.');
