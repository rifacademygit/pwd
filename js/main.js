document.addEventListener('DOMContentLoaded', function () {
    // TTS Functionality
    const synth = window.speechSynthesis;
    let speakingButton = null;

    function speak(text, button) {
        if (synth.speaking) {
            if (speakingButton === button) {
                synth.cancel();
                return;
            }
            synth.cancel();
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
        };
        synth.speak(utterance);
    }

    document.querySelectorAll('.tts-button').forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            let textToSpeak = button.dataset.ttsText || (button.dataset.ttsTarget ? document.querySelector(button.dataset.ttsTarget).innerText : '');
            if (textToSpeak) speak(textToSpeak, button);
        });
    });

    window.addEventListener('beforeunload', () => {
        if (synth.speaking) synth.cancel();
    });

    // Accordion functionality
    document.querySelectorAll('.accordion-button').forEach(button => {
        button.addEventListener('click', () => {
            button.classList.toggle('active');
            button.nextElementSibling.classList.toggle('active');
        });
    });



// Flashcard functionality
document.querySelectorAll('.flashcard-container').forEach(container => {
    // Add tabindex to make it focusable
    container.setAttribute('tabindex', '0'); 

    const flipCard = () => {
        container.querySelector('.flashcard').classList.toggle('is-flipped');
    };

    container.addEventListener('click', flipCard);

    // Add keyboard event listener
    container.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault(); // Prevent the page from scrolling
            flipCard();
        }
    });
});


    // Scenario functionality
    const scenarioBtn = document.getElementById('scenario-btn');
    if (scenarioBtn) {
        const scenarioScenes = document.querySelectorAll('.scenario-scene');
        let currentScene = 0;
        scenarioBtn.addEventListener('click', () => {
            scenarioScenes[currentScene].classList.remove('active');
            currentScene = (currentScene + 1) % scenarioScenes.length;
            scenarioScenes[currentScene].classList.add('active');
            scenarioBtn.textContent = (currentScene === scenarioScenes.length - 1) ? 'Start Over' : 'Next Scene';
        });
    }

    // Modal functionality
    const modals = document.querySelectorAll('.modal');
    if (modals.length > 0) {
        const modalButtons = document.querySelectorAll('.modal-button');
        const closeButtons = document.querySelectorAll('.modal-close-btn');

        function closeModal() {
            modals.forEach(modal => {
                modal.classList.add('hidden');
                modal.classList.remove('flex');
            });
        }

        modalButtons.forEach(button => {
            button.addEventListener('click', () => {
                const modalId = button.dataset.modal;
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                }
            });
        });

        closeButtons.forEach(button => button.addEventListener('click', closeModal));
        modals.forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        });
    }

    // Progress Bar functionality
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        function updateProgressBar() {
            const scrollPosition = window.scrollY;
            const windowHeight = window.innerHeight;
            const docHeight = document.body.offsetHeight;
            const totalScrollable = docHeight - windowHeight;
            const scrollPercentage = totalScrollable > 0 ? (scrollPosition / totalScrollable) * 100 : 0;
            progressBar.style.width = Math.min(scrollPercentage, 100) + '%';
        }
        window.addEventListener('scroll', updateProgressBar);
        updateProgressBar();
    }

    // Social Model Animation
    const animateBtn = document.getElementById('animate-btn');
    if (animateBtn) {
        const personIcon = document.getElementById('person-icon');
        const barrierIcon = document.getElementById('barrier-icon');
        const resultText = document.getElementById('result-text');
        const inclusionText = document.getElementById('inclusion-text');
        const removeBarrierBtn = document.getElementById('remove-barrier-btn');
        const resetAnimationBtn = document.getElementById('reset-animation-btn');

        function resetAnimation() {
            personIcon.className = 'person-icon';
            barrierIcon.className = 'barrier-icon';
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
    }
    
    // --- REUSABLE QUIZ FUNCTIONALITY ---
    
    function initializeQuiz(config) {
        const form = document.getElementById(config.formId);
        if (!form) return;

        const resultsContainer = document.getElementById(config.resultsId);
        const scoreEl = document.getElementById(config.scoreId);
        const messageEl = document.getElementById(config.messageId);
        const submitBtn = document.getElementById(config.submitId);

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            let score = 0;
            const totalQuestions = Object.keys(config.correctAnswers).length;

            for (const questionName in config.correctAnswers) {
                const selectedOption = form.querySelector(`input[name="${questionName}"]:checked`);
                const feedbackEl = document.getElementById(`feedback-${questionName}`) || document.getElementById(`pre-feedback-${questionName}`);

                if (selectedOption) {
                    if (selectedOption.value === config.correctAnswers[questionName]) {
                        score++;
                        if (feedbackEl) {
                           feedbackEl.textContent = 'Correct!';
                           feedbackEl.className = 'feedback correct';
                        }
                    } else {
                        if (feedbackEl) {
                           feedbackEl.textContent = 'Incorrect.';
                           feedbackEl.className = 'feedback incorrect';
                        }
                    }
                } else {
                    if (feedbackEl) {
                       feedbackEl.textContent = 'Please select an answer.';
                       feedbackEl.className = 'feedback incorrect';
                    }
                }
                 if(feedbackEl) feedbackEl.style.display = 'block';
            }

            scoreEl.textContent = `${score} / ${totalQuestions}`;
            
            if (config.certificateConfig && score >= config.certificateConfig.passScore) {
                messageEl.textContent = "Excellent work! You have a strong understanding of disability inclusion principles.";
                const certificateSection = document.getElementById(config.certificateConfig.sectionId);
                if(certificateSection) certificateSection.style.display = 'block';
            } else if (score >= totalQuestions / 2) {
                messageEl.textContent = "Good job! You have a solid foundation. Review the lessons to strengthen your knowledge.";
            } else {
                messageEl.textContent = "It's a good start. We recommend reviewing the course materials to better understand these important concepts.";
            }

            resultsContainer.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            resultsContainer.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // --- DEFINE QUIZ ANSWERS AND CONFIGURATIONS ---

    const quizAnswers = {
        'q1': 'b', 'q2': 'b', 'q3': 'b', 'q4': 'c', 'q5': 'b',
        'q6': 'a', 'q7': 'b', 'q8': 'b', 'q9': 'a', 'q10': 'c'
    };
    
    const preQuizAnswers = {
        'pre-q1': 'b', 'pre-q2': 'b', 'pre-q3': 'b', 'pre-q4': 'c', 'pre-q5': 'b',
        'pre-q6': 'a', 'pre-q7': 'b', 'pre-q8': 'b', 'pre-q9': 'a', 'pre-q10': 'c'
    };

    const preQuizConfig = {
        formId: 'pre-quiz-form',
        resultsId: 'pre-quiz-results',
        scoreId: 'pre-quiz-score',
        messageId: 'pre-quiz-message',
        submitId: 'pre-submit-quiz',
        correctAnswers: preQuizAnswers
    };

    const finalQuizConfig = {
        formId: 'quiz-form',
        resultsId: 'quiz-results',
        scoreId: 'quiz-score',
        messageId: 'quiz-message',
        submitId: 'submit-quiz',
        correctAnswers: quizAnswers,
        certificateConfig: {
            sectionId: 'certificate-section',
            passScore: 8 
        }
    };
    
    initializeQuiz(preQuizConfig);
    initializeQuiz(finalQuizConfig);

    const downloadCertBtn = document.getElementById('download-cert-btn');
    if (downloadCertBtn) {
       downloadCertBtn.addEventListener('click', function() {
            const learnerName = "Valued Employee"; 
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
                    <circle cx="400" cy="450" r="50" fill="#dbeafe"/>
                    <circle cx="400" cy="450" r="45" fill="none" stroke="#1e3a8a" stroke-width="3"/>
                    <text x="400" y="445" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">FINANCIAL</text>
                    <text x="400" y="460" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">INCLUSION</text>
                    <text x="400" y="475" text-anchor="middle" font-size="12px" font-weight="bold" fill="#1e3a8a">2025</text>
                </svg>`;
            const dataUrl = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgContent);
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = 'Disability_Inclusion_Certificate.svg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
       });
    }

    // --- ADD THIS CODE FOR THEMES AND FONT SIZE ---
    const body = document.body;
    const themeNormalBtn = document.getElementById('theme-normal');
    const themeDarkBtn = document.getElementById('theme-dark');
    const themeYellowBtn = document.getElementById('theme-light-yellow');
    const fontIncreaseBtn = document.getElementById('font-increase');
    const fontDecreaseBtn = document.getElementById('font-decrease');
    const themeButtons = [themeNormalBtn, themeDarkBtn, themeYellowBtn];
    
    function setActiveThemeButton(activeBtn) {
        themeButtons.forEach(btn => {
            if(btn) {
                btn.classList.remove('bg-blue-500', 'text-white');
                btn.classList.add('border-gray-400');
            }
        });
        if(activeBtn) {
            activeBtn.classList.add('bg-blue-500', 'text-white');
            activeBtn.classList.remove('border-gray-400');
        }
    }

    if (themeNormalBtn) {
        themeNormalBtn.addEventListener('click', () => {
            body.classList.remove('theme-dark', 'theme-light-yellow');
            setActiveThemeButton(themeNormalBtn);
        });
    }
    if (themeDarkBtn) {
        themeDarkBtn.addEventListener('click', () => {
            body.classList.remove('theme-light-yellow');
            body.classList.add('theme-dark');
            setActiveThemeButton(themeDarkBtn);
        });
    }
    if (themeYellowBtn) {
        themeYellowBtn.addEventListener('click', () => {
            body.classList.remove('theme-dark');
            body.classList.add('theme-light-yellow');
            setActiveThemeButton(themeYellowBtn);
        });
    }

    let currentFontSize = 1; // Corresponds to 1rem (16px)
    const maxFontSize = 1.4; // Corresponds to 1.4rem (22.4px)
    const minFontSize = 0.8; // Corresponds to 0.8rem (12.8px)

    if (fontIncreaseBtn) {
        fontIncreaseBtn.addEventListener('click', () => {
            if (currentFontSize < maxFontSize) {
                currentFontSize = parseFloat((currentFontSize + 0.1).toFixed(2));
                document.documentElement.style.setProperty('--font-size', `${currentFontSize}rem`);
            }
        });
    }

    if (fontDecreaseBtn) {
        fontDecreaseBtn.addEventListener('click', () => {
            if (currentFontSize > minFontSize) {
                currentFontSize = parseFloat((currentFontSize - 0.1).toFixed(2));
                document.documentElement.style.setProperty('--font-size', `${currentFontSize}rem`);
            }
        });
    }
});
