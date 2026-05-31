# 🥸 Manga Translator Gemini

Estensione Chrome che traduce automaticamente i balloon dei manga da inglese a italiano (o altre lingue) usando **Tesseract OCR** e **Gemini AI**.

## ✨ Caratteristiche

- 📖 Traduzione automatica dei balloon manga
- 🎯 OCR con Tesseract.js
- 🤖 Powered by Google Gemini
- 🌍 Supporto multiple lingue (Italiano, Spagnolo, Francese, Tedesco)
- 🔧 Debug mode avanzato
- 💾 Salvataggio secure dell'API key

## 📦 Installazione

1. **Scarica il file ZIP** da GitHub (Code → Download ZIP)
2. **Estrai la cartella**
3. Apri `chrome://extensions/` nel tuo browser
4. Attiva **"Modalità sviluppatore"** (toggle in alto a destra)
5. Clicca **"Carica estensione non pacchettizzata"**
6. Seleziona la cartella estratta

## 🚀 Come usarla

### 1. Ottieni un API Key Gemini
- Visita https://makersuite.google.com/app/apikeys
- Crea una nuova API key
- Copia la key

### 2. Configura l'estensione
- Clicca l'icona dell'estensione (in alto a destra)
- Incolla la tua API key nel campo "API Key Gemini"
- Scegli la lingua di destinazione
- Clicca **"Salva"**

### 3. Traduci un manga
- Visita un sito di manga (es. w7.wistoriaswandandsword.com)
- Clicca l'icona dell'estensione
- Clicca **"▶️ Traduci questa pagina"**
- Aspetta il completamento!

## ⚙️ Opzioni avanzate

- **Debug Mode**: Attiva per vedere i dettagli nella console (F12)
- **Confidence**: Regola il livello minimo di confidenza dell'OCR (10-50%)

## 🔍 Troubleshooting

### "Nessuna immagine manga trovata"
- Verifica che la pagina contenga un'immagine grande (>500x800px)
- Prova ad aumentare lo zoom (Ctrl++)

### "Nessun balloon trovato"
- L'immagine potrebbe essere troppo piccola o sfocata
- Prova a diminuire il "Confidence" nelle opzioni avanzate
- Attiva Debug Mode per vedere cosa estrae Tesseract

### Errore API Key
- Verifica che la key sia corretta
- Controlla su https://makersuite.google.com che sia attivata
- Assicurati di avere crediti sufficienti

## 📝 Note

- L'estensione funziona meglio con immagini pulite e testo ben definito
- Tesseract potrebbe fare errori su testo molto piccolo
- Gemini corregge automaticamente gli errori OCR minori

## 🛠️ Struttura

```
manga-translator/
├── manifest.json      # Configurazione estensione
├── popup.html         # UI popup
├── popup.js          # Logica popup
├── styles.css        # Stili
├── content.js        # Script che gira sulle pagine
├── background.js     # Service worker
└── README.md         # Questo file
```

## 📄 Licenza

MIT License - Libero di usare e modificare

## 👨‍💻 Autore

Creato da **alessandrobianchi1995**

---

**Made with ❤️ | v1.0**