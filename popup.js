document.addEventListener('DOMContentLoaded', async () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const translateBtn = document.getElementById('translateBtn');
    const statusDiv = document.getElementById('status');
    const languageSelect = document.getElementById('language');
    const debugMode = document.getElementById('debugMode');
    const confidenceSlider = document.getElementById('confidence');
    const confidenceValue = document.getElementById('confidenceValue');

    // Carica impostazioni salvate
    chrome.storage.local.get(['apiKey', 'language', 'debugMode', 'confidence'], (result) => {
        if (result.apiKey) apiKeyInput.value = result.apiKey;
        if (result.language) languageSelect.value = result.language;
        if (result.debugMode) debugMode.checked = result.debugMode;
        if (result.confidence) {
            confidenceSlider.value = result.confidence;
            confidenceValue.textContent = result.confidence;
        }
    });

    // Salva API key
    saveBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('Inserisci un API key valido!', 'error');
            return;
        }

        chrome.storage.local.set({
            apiKey: apiKey,
            language: languageSelect.value,
            debugMode: debugMode.checked,
            confidence: confidenceSlider.value
        }, () => {
            showStatus('✓ Impostazioni salvate!', 'success');
            setTimeout(() => statusDiv.style.display = 'none', 2000);
        });
    });

    // Update confidence display
    confidenceSlider.addEventListener('change', (e) => {
        confidenceValue.textContent = e.target.value;
    });

    // Traduci pagina
    translateBtn.addEventListener('click', async () => {
        const apiKey = apiKeyInput.value.trim();
        if (!apiKey) {
            showStatus('❌ Salva un API key prima!', 'error');
            return;
        }

        showStatus('⏳ Caricamento script...', 'info');
        translateBtn.disabled = true;

        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        chrome.tabs.sendMessage(tab.id, {
            action: 'startTranslation',
            apiKey: apiKey,
            language: languageSelect.value,
            debugMode: debugMode.checked,
            confidence: parseInt(confidenceSlider.value)
        }, (response) => {
            if (chrome.runtime.lastError) {
                showStatus('❌ Errore di comunicazione', 'error');
            } else if (response?.success) {
                showStatus(`✓ ${response.message}`, 'success');
            } else {
                showStatus(`❌ ${response?.message || 'Errore sconosciuto'}`, 'error');
            }
            translateBtn.disabled = false;
        });
    });

    function showStatus(message, type) {
        statusDiv.textContent = message;
        statusDiv.className = `status ${type}`;
        statusDiv.style.display = 'block';
    }
});