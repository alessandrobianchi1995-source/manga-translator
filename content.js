chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'startTranslation') {
        console.log('🚀 Inizio traduzione...');
        
        // Carica Tesseract da CDN alternativo con fallback
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.0.4/dist/tesseract.min.js';
        script.onload = () => {
            console.log('✅ Tesseract caricato da jsdelivr');
            performTranslation(request, sendResponse);
        };
        script.onerror = () => {
            console.warn('Tesseract CDN 1 fallito, provo CDN 2...');
            // Fallback a CDN 2
            const script2 = document.createElement('script');
            script2.src = 'https://unpkg.com/tesseract.js@5.0.4/dist/tesseract.min.js';
            script2.onload = () => {
                console.log('✅ Tesseract caricato da unpkg');
                performTranslation(request, sendResponse);
            };
            script2.onerror = () => {
                console.error('Entrambi i CDN falliti');
                sendResponse({ success: false, message: '❌ Errore: Tesseract non si carica. Prova: 1) Disabilita ad-blocker/VPN 2) Ricarica estensione' });
            };
            document.head.appendChild(script2);
        };
        document.head.appendChild(script);
        
        return true;
    }
});

async function performTranslation(request, sendResponse) {
    try {
        const { apiKey, language, debugMode, confidence } = request;

        if (debugMode) console.log('Debug ON | Language:', language, '| Confidence:', confidence);

        // Verifica che Tesseract sia disponibile
        if (typeof Tesseract === 'undefined') {
            console.error('❌ Tesseract non è disponibile globalmente');
            sendResponse({ success: false, message: '❌ Tesseract non caricato. Disabilita ad-blocker e riprova.' });
            return;
        }

        // Trova immagine manga
        const img = [...document.images].find(i => 
            i.naturalWidth > 500 && i.naturalHeight > 800
        );

        if (!img) {
            sendResponse({ success: false, message: 'Nessuna immagine manga trovata' });
            return;
        }

        if (debugMode) console.log('📷 Immagine trovata:', img.src);

        // === OCR CON TESSERACT ===
        console.log('⏳ OCR in corso...');
        const result = await Tesseract.recognize(img.src, 'eng', {
            tessedit_pageseg_mode: '6',
            tessedit_char_whitelist: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,!?\'\"- :;…\n'
        });

        const validParagraphs = result.data.paragraphs.filter(p => {
            if (p.confidence < confidence) return false;
            const cleanText = p.text.trim().replace(/\s+/g, ' ');
            if (cleanText.length < 2) return false;
            const width = p.bbox.x1 - p.bbox.x0;
            if (width > img.naturalWidth * 0.95) return false;
            return true;
        });

        if (debugMode) console.log('📊 Testi trovati:', validParagraphs.length);

        if (validParagraphs.length === 0) {
            sendResponse({ success: false, message: 'Nessun balloon trovato! Prova: 1) Zoom+ 2) Diminuisci confidence' });
            return;
        }

        const originalTexts = validParagraphs.map(p => p.text.trim());

        if (debugMode) console.log('Testi originali:', originalTexts);

        // === TRADUZIONE GEMINI ===
        console.log('⏳ Traduzione in corso...');
        const languageMap = {
            italiano: 'italiano',
            spagnolo: 'spagnolo',
            francese: 'francese',
            tedesco: 'tedesco'
        };

        const promptText = `
Sei un traduttore di manga professionale. Ti fornirò testi estratti dai balloon.
Traduccili in ${languageMap[language]} naturale e colloquiale.
Se riconosci errori OCR, correggili.

REGOLE:
- Rispondi ESCLUSIVAMENTE con un array JSON di stringhe
- Mantieni lo stesso numero di elementi
- Testo conciso (adatto ai balloon)

Testi:
${JSON.stringify(originalTexts)}
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: promptText }] }],
                    generationConfig: {
                        responseMimeType: 'application/json',
                        temperature: 0.7
                    }
                })
            }
        );

        const data = await response.json();
        let translatedArray = [];

        try {
            const rawResponse = data.candidates[0].content.parts[0].text;
            translatedArray = JSON.parse(rawResponse);
        } catch (err) {
            if (debugMode) console.error('JSON Error:', data);
            sendResponse({ success: false, message: 'Errore Gemini: JSON non valido. Controlla l\'API key.' });
            return;
        }

        if (debugMode) console.log('✅ Traduzioni:', translatedArray);

        // === OVERLAY TESTI ===
        const rect = img.getBoundingClientRect();
        const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const scaleX = img.width / img.naturalWidth;
        const scaleY = img.height / img.naturalHeight;

        validParagraphs.forEach((p, index) => {
            const translatedText = translatedArray[index] || '';
            if (!translatedText) return;

            const box = document.createElement('div');
            box.className = 'manga-translator-box';
            
            const scaledX0 = p.bbox.x0 * scaleX;
            const scaledY0 = p.bbox.y0 * scaleY;
            const scaledWidth = (p.bbox.x1 - p.bbox.x0) * scaleX;
            const scaledHeight = (p.bbox.y1 - p.bbox.y0) * scaleY;

            box.style.position = 'absolute';
            box.style.left = (rect.left + scrollLeft + scaledX0) + 'px';
            box.style.top = (rect.top + scrollTop + scaledY0) + 'px';
            box.style.width = scaledWidth + 'px';
            box.style.height = scaledHeight + 'px';
            box.style.backgroundColor = '#ffffff';
            box.style.color = '#000000';
            box.style.fontSize = '13px';
            box.style.fontFamily = "'Comic Sans MS', cursive, sans-serif";
            box.style.fontWeight = 'bold';
            box.style.textAlign = 'center';
            box.style.display = 'flex';
            box.style.alignItems = 'center';
            box.style.justifyContent = 'center';
            box.style.zIndex = '99999999';
            box.style.borderRadius = '8px';
            box.style.padding = '8px';
            box.style.boxSizing = 'border-box';
            box.style.overflow = 'hidden';
            box.style.wordBreak = 'break-word';
            box.style.lineHeight = '1.3';
            box.style.border = '1px solid #ccc';

            box.innerText = translatedText;
            document.body.appendChild(box);
        });

        sendResponse({ 
            success: true, 
            message: `✅ ${validParagraphs.length} balloon tradotti!` 
        });

    } catch (error) {
        console.error('❌ Errore:', error);
        sendResponse({ success: false, message: `❌ Errore: ${error.message}` });
    }
}