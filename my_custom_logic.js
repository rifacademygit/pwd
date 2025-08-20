document.addEventListener('DOMContentLoaded', function () {
    
    // --- UI & NAVIGATION ELEMENTS ---
    var navigationContainer = document.getElementById('navigation-container');
    var screens = document.querySelectorAll('.screen');
    var nextBtn = document.getElementById('next-btn');
    var prevBtn = document.getElementById('prev-btn');
    var progressBar = document.getElementById('progressBar');
    var currentScreen = 0;
    var totalScreens = screens.length;
    var preQuizCompleted = false;

    // --- SCREEN NAVIGATION LOGIC ---
    function showScreen(screenIndex) {
        screens.forEach(function(screen, index) {
            screen.classList.toggle('active', index === screenIndex);
        });
        progressBar.style.width = String((screenIndex / (totalScreens - 1)) * 100) + '%';
        
        if (screenIndex === totalScreens - 1) {
            navigationContainer.style.display = 'none';
        } else {
            navigationContainer.style.display = 'flex';
        }

        prevBtn.disabled = screenIndex === 0;
        
        // Disable next button on pre-quiz (screen 1) and final quiz (screen 5) until completed
        var onPreQuiz = (screenIndex === 1 && !preQuizCompleted);
        var onFinalQuiz = (screenIndex === 5 && !document.getElementById('quiz-form').hasAttribute('data-completed'));
        var onLastScreen = (screenIndex === totalScreens - 1);

        if (onPreQuiz || onFinalQuiz) {
             nextBtn.disabled = true;
        } else {
            nextBtn.disabled = onLastScreen;
        }
        
        nextBtn.textContent = (screenIndex === totalScreens - 2) ? 'Finish Course' : 'Next';
        window.scrollTo(0, 0);
    }

    nextBtn.addEventListener('click', function() {
        if (currentScreen < totalScreens - 1) {
            currentScreen++;
            showScreen(currentScreen);
        }
    });

    prevBtn.addEventListener('click', function() {
        if (currentScreen > 0) {
            currentScreen--;
            showScreen(currentScreen);
        }
    });

    // --- REUSABLE QUIZ FUNCTIONALITY ---
    function initializeQuiz(config) {
        var form = document.getElementById(config.formId);
        if (!form) return;

        var resultsContainer = document.getElementById(config.resultsId);
        var scoreEl = document.getElementById(config.scoreId);
        var messageEl = document.getElementById(config.messageId);
        var submitBtn = form.querySelector('button[type="submit"]');

        form.addEventListener('submit', function(e) {
            e.preventDefault();
            var allAnswered = true;

            for (var questionName in config.correctAnswers) {
                var selectedOption = form.querySelector('input[name="' + questionName + '"]:checked');
                var feedbackEl = document.getElementById(config.feedbackPrefix + questionName);
                var correctAnswerValue = config.correctAnswers[questionName];
                var correctInput = form.querySelector('input[name="' + questionName + '"][value="' + correctAnswerValue + '"]');

                if (selectedOption) {
                    var isCorrect = selectedOption.value === correctAnswerValue;
                    if (feedbackEl) {
                        feedbackEl.textContent = isCorrect ? 'Correct!' : 'Incorrect.';
                        feedbackEl.className = 'feedback ' + (isCorrect ? 'correct' : 'incorrect');
                        feedbackEl.style.display = 'block';
                    }
                } else {
                    allAnswered = false;
                    if (feedbackEl) {
                        feedbackEl.textContent = 'Please select an answer.';
                        feedbackEl.className = 'feedback incorrect';
                        feedbackEl.style.display = 'block';
                    }
                }
                
                // Highlight the correct answer
                if(correctInput) {
                    var correctLabel = correctInput.parentElement;
                    correctLabel.classList.add('border-green-500', 'ring-2', 'ring-green-200');
                    var checkmark = correctLabel.querySelector('.correct-checkmark');
                    if (!checkmark) {
                        checkmark = document.createElement('span');
                        checkmark.className = 'correct-checkmark ml-auto text-green-600';
                        checkmark.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';
                        correctLabel.appendChild(checkmark);
                    }
                }
            }
            
            if (!allAnswered) {
                return;
            }

            if(config.isFinalQuiz){
                if(resultsContainer) resultsContainer.style.display = 'block';
                form.setAttribute('data-completed', "true");
                nextBtn.disabled = false;
            } else {
                 if(resultsContainer) resultsContainer.style.display = 'block';
                 if(scoreEl) scoreEl.textContent = 'Completed';
                 if(messageEl) messageEl.textContent = "Thank you for completing the knowledge check. You can now proceed with the course.";
                 preQuizCompleted = true;
                 nextBtn.disabled = false;
            }

            if(submitBtn) {
                submitBtn.disabled = true;
                submitBtn.classList.add('bg-gray-400', 'cursor-not-allowed');
            }
        });
    }

    var quizAnswers = { 'q1': 'b', 'q2': 'b', 'q3': 'b', 'q4': 'c', 'q5': 'b', 'q6': 'a', 'q7': 'b', 'q8': 'b', 'q9': 'a', 'q10': 'c' };
    var preQuizAnswers = { 'pre-q1': 'b', 'pre-q2': 'b', 'pre-q3': 'b', 'pre-q4': 'c', 'pre-q5': 'b', 'pre-q6': 'a', 'pre-q7': 'b', 'pre-q8': 'b', 'pre-q9': 'a', 'pre-q10': 'c' };

    initializeQuiz({
        formId: 'pre-quiz-form',
        resultsId: 'pre-quiz-results',
        scoreId: 'pre-quiz-score',
        messageId: 'pre-quiz-message',
        feedbackPrefix: 'pre-feedback-',
        correctAnswers: preQuizAnswers,
        isFinalQuiz: false
    });

    initializeQuiz({
        formId: 'quiz-form',
        resultsId: 'quiz-results',
        scoreId: 'quiz-score',
        messageId: 'quiz-message',
        feedbackPrefix: 'feedback-',
        correctAnswers: quizAnswers,
        isFinalQuiz: true
    });
    
    // --- OTHER INTERACTIVE ELEMENTS ---
    var synth = window.speechSynthesis;
    var speakingButton = null;

    function speak(text, button) {
        if (synth.speaking) {
            if (speakingButton === button) { synth.cancel(); return; }
            synth.cancel();
        }
        var utterance = new SpeechSynthesisUtterance(text);
        utterance.onstart = function() {
            if (speakingButton) speakingButton.classList.remove('speaking');
            speakingButton = button;
            speakingButton.classList.add('speaking');
        };
        utterance.onend = function() {
            if (speakingButton) speakingButton.classList.remove('speaking');
            speakingButton = null;
        };
        synth.speak(utterance);
    }

    document.querySelectorAll('.tts-button').forEach(function(button) {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            var textToSpeak = button.dataset.ttsText || (button.dataset.ttsTarget ? document.querySelector(button.dataset.ttsTarget).textContent : '');
            if (textToSpeak) speak(textToSpeak, button);
        });
    });

    window.addEventListener('beforeunload', function() { if (synth.speaking) synth.cancel(); });

    document.querySelectorAll('.accordion-button').forEach(function(button) {
        button.addEventListener('click', function(e) {
            if (e.target.closest('.tts-button')) return;
            var content = button.nextElementSibling;
            button.classList.toggle('active');
            content.classList.toggle('active');
            button.setAttribute('aria-expanded', button.classList.contains('active'));
        });
    });

    document.querySelectorAll('.flashcard-container').forEach(function(container) {
        var flipCard = function() { container.querySelector('.flashcard').classList.toggle('is-flipped'); };
        container.addEventListener('click', flipCard);
        container.addEventListener('keydown', function(e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flipCard(); } });
    });

    var scenarioBtn = document.getElementById('scenario-btn');
    if (scenarioBtn) {
        var scenarioScenes = document.querySelectorAll('.scenario-scene');
        var currentScene = 0;
        scenarioBtn.addEventListener('click', function() {
            scenarioScenes[currentScene].classList.remove('active');
            currentScene = (currentScene + 1) % scenarioScenes.length;
            scenarioScenes[currentScene].classList.add('active');
            scenarioBtn.textContent = (currentScene === scenarioScenes.length - 1) ? 'Start Over' : 'Next Scene';
        });
    }
    
    var animateBtn = document.getElementById('animate-btn');
    if (animateBtn) {
        var personIcon = document.getElementById('person-icon');
        var barrierIcon = document.getElementById('barrier-icon');
        var resultText = document.getElementById('result-text');
        var inclusionText = document.getElementById('inclusion-text');
        var removeBarrierBtn = document.getElementById('remove-barrier-btn');
        var resetAnimationBtn = document.getElementById('reset-animation-btn');
        function resetAnimation() {
            personIcon.className = 'person-icon';
            barrierIcon.className = 'barrier-icon';
            resultText.classList.remove('show');
            inclusionText.classList.remove('show');
        }
        animateBtn.addEventListener('click', function() {
            resetAnimation();
            setTimeout(function() { personIcon.classList.add('move'); resultText.classList.add('show'); }, 100);
        });
        removeBarrierBtn.addEventListener('click', function() {
            resetAnimation();
            setTimeout(function() { barrierIcon.classList.add('removed'); personIcon.classList.add('move-past'); inclusionText.classList.add('show'); }, 100);
        });
        resetAnimationBtn.addEventListener('click', resetAnimation);
    }
    
    var body = document.body;
    var themeNormalBtn = document.getElementById('theme-normal');
    var themeDarkBtn = document.getElementById('theme-dark');
    var themeHighContrastBtn = document.getElementById('theme-high-contrast');
    var fontIncreaseBtn = document.getElementById('font-increase');
    var fontDecreaseBtn = document.getElementById('font-decrease');
    
    function setActiveThemeButton(activeBtn) {
        [themeNormalBtn, themeDarkBtn, themeHighContrastBtn].forEach(function(btn) {
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
        themeNormalBtn.addEventListener('click', function() { body.className = 'bg-gray-50 text-gray-800'; setActiveThemeButton(themeNormalBtn); });
    }
    if (themeDarkBtn) {
        themeDarkBtn.addEventListener('click', function() { body.className = 'bg-gray-50 text-gray-800 theme-dark'; setActiveThemeButton(themeDarkBtn); });
    }
    if (themeHighContrastBtn) {
        themeHighContrastBtn.addEventListener('click', function() { body.className = 'bg-gray-50 text-gray-800 theme-high-contrast'; setActiveThemeButton(themeHighContrastBtn); });
    }

    var currentFontSize = 1; 
    if(fontIncreaseBtn) {
        fontIncreaseBtn.addEventListener('click', function() {
            if (currentFontSize < 1.4) {
                currentFontSize = parseFloat((currentFontSize + 0.1).toFixed(2));
                document.documentElement.style.setProperty('--font-size', currentFontSize + 'rem');
            }
        });
    }
    if(fontDecreaseBtn) {
        fontDecreaseBtn.addEventListener('click', function() {
            if (currentFontSize > 0.8) {
                currentFontSize = parseFloat((currentFontSize - 0.1).toFixed(2));
                document.documentElement.style.setProperty('--font-size', currentFontSize + 'rem');
            }
        });
    }

    // --- INITIAL LOAD ---
    // Always start at the first screen when not using SCORM
    showScreen(0);
});
