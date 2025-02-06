document.getElementById('input-text').addEventListener('input', convertText);

const supportedExtensions = ['.gif', '.webp', '.jpeg', '.jpg', '.mp4'];
let currentIndex = 0;
let words = [];
let displayInterval;
let errorMessages = {};

function convertText() {
    const inputText = document.getElementById('input-text').value.trim().toLowerCase();
    words = inputText.split(' ');
    currentIndex = 0;

    const displayArea = document.getElementById('display-area');
    displayArea.innerHTML = ''; // Clear existing content
    displayArea.classList.add('fade-in'); // Add fade-in class

    clearInterval(displayInterval);
    errorMessages = {};

    if (words.length > 0) {
        displayNextMedia();
    }
}

function displayNextMedia() {
    const displayArea = document.getElementById('display-area');
    const text = words[currentIndex];
    let foundMedia = false;

    for (let i = 0; i < supportedExtensions.length; i++) {
        const extension = supportedExtensions[i];
        const mediaPath = `signs/${text}${extension}`;

        if (extension === '.mp4') {
            const video = document.createElement('video');
            video.src = mediaPath;
            video.className = 'displayed-image';
            video.controls = true;

            video.onloadeddata = function () {
                if (!foundMedia) {
                    displayArea.innerHTML = '';
                    displayArea.appendChild(video);
                    video.play();
                    foundMedia = true;
                }
            };

            video.onerror = () => handleMediaError(text);
        } else {
            const img = document.createElement('img');
            img.src = mediaPath;
            img.className = 'displayed-image';

            img.onload = function () {
                if (!foundMedia) {
                    displayArea.innerHTML = '';
                    displayArea.appendChild(img);
                    foundMedia = true;
                }
            };

            img.onerror = () => handleMediaError(text);
        }
    }

    if (!foundMedia) {
        displayErrorMessage(text);
    } else {
        if (errorMessages[text]) {
            errorMessages[text].remove();
            delete errorMessages[text];
        }
    }

    currentIndex++;

    if (currentIndex < words.length) {
        displayInterval = setTimeout(displayNextMedia, 3000);
    } else {
        currentIndex = 0;
        displayInterval = setTimeout(displayNextMedia, 3000);
    }
}

function handleMediaError(text) {
    displayErrorMessage(text);
}

function displayErrorMessage(text) {
    const displayArea = document.getElementById('display-area');

    if (!errorMessages[text]) {
        const errorMsg = document.createElement('p');
        errorMsg.className = 'error-message';
        errorMsg.textContent = `Search image not found for "${text}".`;
        displayArea.appendChild(errorMsg);
        errorMessages[text] = errorMsg;
    }
}

function removeImage() {
    const displayArea = document.getElementById('display-area');
    displayArea.innerHTML = '';
    clearInterval(displayInterval);

    document.getElementById('input-text').value = '';
    words = [];
    currentIndex = 0;
    errorMessages = {};
}

function startRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            console.log('Speech recognition started');
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            document.getElementById('input-text').value = transcript;
            convertText();
        };

        recognition.onerror = function (event) {
            console.error('Speech recognition error:', event.error);
        };

        recognition.onend = function () {
            console.log('Speech recognition ended');
        };

        recognition.start();
    } else {
        alert('Speech recognition not supported in this browser. Please try using Google Chrome.');
    }
}


// Function to handle voice recognition for the translation input
function startTranslationRecognition() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = document.getElementById('from-language').value; // Set language from the select element
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = function () {
            console.log('Translation speech recognition started');
        };

        recognition.onresult = function (event) {
            const transcript = event.results[0][0].transcript.toLowerCase().trim();
            document.getElementById('input-translate').value = transcript;
        };

        recognition.onerror = function (event) {
            console.error('Translation speech recognition error:', event.error);
        };

        recognition.onend = function () {
            console.log('Translation speech recognition ended');
        };

        recognition.start();
    } else {
        alert('Speech recognition not supported in this browser. Please try using Google Chrome.');
    }
}


// New function to clear the translation fields
function clearTranslationFields() {
    document.getElementById('input-translate').value = ''; // Clear the input translation text area
    document.getElementById('output-translate').value = ''; // Clear the output translation text area
}


// Language Translation Using API
async function translateText() {
    const inputText = document.getElementById('input-translate').value;
    const fromLang = document.getElementById('from-language').value;
    const toLang = document.getElementById('to-language').value;

    if (!inputText) {
        alert("Please enter text to translate.");
        return;
    }

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(inputText)}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        document.getElementById('output-translate').value = data[0][0][0]; // Extract translated text
    } catch (error) {
        console.error("Error in translation:", error);
        alert("Translation failed. Google may have blocked this method.");
    }
}
