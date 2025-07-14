document.addEventListener('DOMContentLoaded', function () {
    // TTS Functionality
    const synth = window.speechSynthesis;
    let currentUtterance = null;
    let speakingButton = null;

    function speak(text, button) {
        if (synth.speaking) {
            if (speakingButton === button) {
                synth.cancel(); // Stop if the same button is clicked
                return;
            }
            synth.cancel(); // Stop any previous speech
        }

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = () => {
            if (speakingButton) speakingButton.classList.remove('speaking');
            speakingButton = button;
            speakingButton.classList.add('speaking');
        };
        utterance.onend = () => {
            if (speakingButton) speakingButton.classList.remove('speaking');
            speakingButton = null;
            currentUtterance = null;
        };
        currentUtterance = utterance;
        synth.speak(utterance);
    }

    document.querySelectorAll('.tts-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            let textToSpeak = '';
            if (button.dataset.ttsText) {
                textToSpeak = button.dataset.ttsText;
            } else if (button.dataset.ttsTarget) {
                textToSpeak = document.querySelector(button.dataset.ttsTarget).innerText;
            }
            speak(textToSpeak, button);
        });
    });

    // Stop speech when closing the page
    window.addEventListener('beforeunload', () => {
        if(synth.speaking) synth.cancel();
    });

    // Accordion functionality
    const accordionButtons = document.querySelectorAll('.accordion-button');
    accordionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
        });
    });

    // Flashcard functionality
    const flashcards = document.querySelectorAll('.flashcard-container');
    flashcards.forEach(container => {
        container.addEventListener('click', () => {
            container.querySelector('.flashcard').classList.toggle('is-flipped');
        });
    });

    // Scenario functionality
    const scenarioBtn = document.getElementById('scenario-btn');
    const scenarioScenes = document.querySelectorAll('.scenario-scene');
    let currentScene = 0;
    scenarioBtn.addEventListener('click', () => {
        scenarioScenes[currentScene].classList.remove('active');
        currentScene = (currentScene + 1) % scenarioScenes.length;
        scenarioScenes[currentScene].classList.add('active');
        if(currentScene === scenarioScenes.length - 1) {
            scenarioBtn.textContent = 'Start Over';
        } else {
            scenarioBtn.textContent = 'Next Scene';
        }
    });

    // Modal functionality
    const modalButtons = document.querySelectorAll('.modal-button');
    const closeButtons = document.querySelectorAll('.modal-close-btn');
    const modals = document.querySelectorAll('.modal');

    modalButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modalId = button.dataset.modal;
            document.getElementById(modalId).classList.remove('hidden');
            document.getElementById(modalId).classList.add('flex');
        });
    });

    function closeModal() {
         modals.forEach(modal => {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });

    modals.forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
    });

    // Progress Bar functionality
    const progressBar = document.getElementById('progressBar');
    function updateProgressBar() {
        let scrollPosition = window.scrollY;
        let windowHeight = window.innerHeight;
        let docHeight = document.body.offsetHeight;
        
        let totalScrollable = docHeight - windowHeight;
        let scrollPercentage = (scrollPosition / totalScrollable) * 100;

        progressBar.style.width = Math.min(scrollPercentage, 100) + '%';
    }
    window.addEventListener('scroll', updateProgressBar);
    updateProgressBar();

    // Social Model Animation
    const personIcon = document.getElementById('person-icon');
    const barrierIcon = document.getElementById('barrier-icon');
    const resultText = document.getElementById('result-text');
    const inclusionText = document.getElementById('inclusion-text');
    const animateBtn = document.getElementById('animate-btn');
    const removeBarrierBtn = document.getElementById('remove-barrier-btn');
    const resetAnimationBtn = document.getElementById('reset-animation-btn');

    function resetAnimation() {
        personIcon.classList.remove('move', 'move-past');
        barrierIcon.classList.remove('removed');
        resultText.classList.remove('show');
        inclusionText.classList.remove('show');
    }

    animateBtn.addEventListener('click', () => {
        resetAnimation();
        setTimeout(() => {
            personIcon.classList.add('move');
            resultText.classList.add('show');
        }, 100);
    });

    removeBarrierBtn.addEventListener('click', () => {
        resetAnimation();
        setTimeout(() => {
            barrierIcon.classList.add('removed');
            personIcon.classList.add('move-past');
            inclusionText.classList.add('show');
        }, 100);
    });

    resetAnimationBtn.addEventListener('click', resetAnimation);

    // Quiz Functionality
    const quizForm = document.getElementById('quiz-form');
    const quizResults = document.getElementById('quiz-results');
    const quizScore = document.getElementById('quiz-score');
    const quizMessage = document.getElementById('quiz-message');
    const certificateSection = document.getElementById('certificate-section');
    const downloadCertBtn = document.getElementById('download-cert-btn');
    
    const correctAnswers = {
        q1: 'b', q2: 'b', q3: 'b', q4: 'c', q5: 'b',
        q6: 'a', q7: 'b', q8: 'b', q9: 'a', q10: 'c'
    };

    quizForm.addEventListener('submit', function(e) {
        e.preventDefault();
        let score = 0;
        const totalQuestions = Object.keys(correctAnswers).length;

        for (let i = 1; i <= totalQuestions; i++) {
            const questionName = 'q' + i;
            const selectedOption = quizForm.querySelector(`input[name="${questionName}"]:checked`);
            const feedbackEl = document.getElementById(`feedback-${questionName}`);
            
            if (selectedOption) {
                if (selectedOption.value === correctAnswers[questionName]) {
                    score++;
                    feedbackEl.textContent = 'Correct!';
                    feedbackEl.className = 'feedback correct';
                } else {
                    feedbackEl.textContent = 'Incorrect. The correct answer is highlighted by the Social Model.';
                    feedbackEl.className = 'feedback incorrect';
                }
                feedbackEl.style.display = 'block';
            } else {
                feedbackEl.textContent = 'Please select an answer.';
                feedbackEl.className = 'feedback incorrect';
                feedbackEl.style.display = 'block';
            }
        }

        quizScore.textContent = `${score} / ${totalQuestions}`;
        if (score >= 8) {
            quizMessage.textContent = "Excellent work! You have a strong understanding of disability inclusion principles.";
            certificateSection.style.display = 'block';
        } else if (score >= 5) {
            quizMessage.textContent = "Good job! You have a solid foundation. Review the lessons to strengthen your knowledge.";
            certificateSection.style.display = 'none';
        } else {
            quizMessage.textContent = "It's a good start. We recommend reviewing the course materials to better understand these important concepts.";
            certificateSection.style.display = 'none';
        }
        quizResults.style.display = 'block';
        document.getElementById('submit-quiz').disabled = true;
        document.getElementById('submit-quiz').classList.add('bg-gray-400', 'cursor-not-allowed');
        quizResults.scrollIntoView({ behavior: 'smooth' });
    });

    // Certificate Download
    downloadCertBtn.addEventListener('click', function() {
        const learnerName = "Valued Employee"; // Placeholder name
        const today = new Date();
        const dateString = today.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

        const svgContent = `
            <svg width="800" height="600" xmlns="http://www.w3.org/2000/svg" style="font-family: 'Inter', sans-serif; background-color: #f8fafc;">
                <defs>
                    <style>
                        .title { font-family: 'Playfair Display', serif; font-size: 48px; fill: #1e3a8a; }
                        .subtitle { font-size: 20px; fill: #475569; }
                        .name { font-size: 36px; font-weight: bold; fill: #1e40af; }
                        .body { font-size: 18px; fill: #334155; }
                        .date, .signature { font-size: 16px; fill: #475569; }
                    </style>
                </defs>
                
                <rect x="10" y="10" width="780" height="580" fill="none" stroke="#1e3a8a" stroke-width="5" rx="10"/>
                <rect x="20" y="20" width="760" height="560" fill="none" stroke="#60a5fa" stroke-width="2" rx="5"/>
                
                <text x="400" y="100" text-anchor="middle" class="title">Certificate of Completion</text>
                
                <text x="400" y="160" text-anchor="middle" class="subtitle">This certificate is proudly presented to</text>
                
                <text x="400" y="240" text-anchor="middle" class="name">${learnerName}</text>
                
                <line x1="200" y1="260" x2="600" y2="260" stroke="#60a5fa" stroke-width="1"/>
                
                <text x="400" y="320" text-anchor="middle" class="body">for successfully completing the course</text>
                <text x="400" y="350" text-anchor="middle" class="body" font-weight="bold">Disability Inclusion for Financial Service Providers</text>
                
                <text x="100" y="480" text-anchor="start" class="date">Date: ${dateString}</text>
                <line x1="100" y1="510" x2="300" y2="510" stroke="#475569" stroke-width="1"/>
                <text x="100" y="530" text-anchor="start" class="signature">Date</text>
                
                <text x="700" y="480" text-anchor="end" class="date">Head of Training</text>
                <line x1="500" y1="510" x2="700" y2="510" stroke="#475569" stroke-width="1"/>
                <text x="700" y="530" text-anchor="end" class="signature">Signature</text>

                <!-- Seal -->
                <circle cx="400" cy="450" r="50" fill="#dbeafe"/>
                <circle cx="400" cy="450" r="45" fill="none" stroke="#1e3a8a" stroke-width="3"/>
                <text x="400" y="445" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">FINANCIAL</text>
                <text x="400" y="460" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">INCLUSION</text>
                <text x="400" y="475" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">2025</text>
            </svg>
        `;

        const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'Disability_Inclusion_Certificate.svg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });

    // Theme and Font Size Controls
    const body = document.body;
    const themeNormalBtn = document.getElementById('theme-normal');
    const themeDarkBtn = document.getElementById('theme-dark');
    const themeYellowBtn = document.getElementById('theme-light-yellow');
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const themeButtons = [themeNormalBtn, themeDarkBtn, themeYellowBtn];
    
    function setActiveThemeButton(activeBtn) {
        themeButtons.forEach(btn => {
            btn.classList.remove('bg-blue-500', 'text-white');
            btn.classList.add('border-gray-400');
        });
        activeBtn.classList.add('bg-blue-500', 'text-white');
        activeBtn.classList.remove('border-gray-400');
    }

    themeNormalBtn.addEventListener('click', () => {
        body.classList.remove('theme-dark', 'theme-light-yellow');
        setActiveThemeButton(themeNormalBtn);
    });
    themeDarkBtn.addEventListener('click', () => {
        body.classList.remove('theme-light-yellow');
        body.classList.add('theme-dark');
        setActiveThemeButton(themeDarkBtn);
    });
    themeYellowBtn.addEventListener('click', () => {
        body.classList.remove('theme-dark');
        body.classList.add('theme-light-yellow');
        setActiveThemeButton(themeYellowBtn);
    });

    let currentFontSize = 1; // Corresponds to 1rem
    const maxFontSize = 1.4;
    const minFontSize = 0.8;

    fontIncreaseBtn.addEventListener('click', () => {
        if (currentFontSize < maxFontSize) {
            currentFontSize += 0.1;
            document.documentElement.style.setProperty('--font-size', `${currentFontSize}rem`);
        }
    });

    fontDecreaseBtn.addEventListener('click', () => {
         if (currentFontSize > minFontSize) {
            currentFontSize -= 0.1;
            document.documentElement.style.setProperty('--font-size', `${currentFontSize}rem`);
        }
    });

});
