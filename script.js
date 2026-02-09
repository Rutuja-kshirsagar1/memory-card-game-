 // Game state variables
        let gameStarted = false;
        let gameOver = false;
        let moves = 0;
        let matches = 0;
        let score = 0;
        let timer = 0;
        let timerInterval = null;
        let flippedCards = [];
        let canFlip = true;
        let totalPairs = 0;
        let difficulty = 'medium'; // default difficulty
        let cardValues = [];

        // DOM elements
        const gameBoard = document.getElementById('game-board');
        const movesElement = document.getElementById('moves');
        const timerElement = document.getElementById('timer');
        const matchesElement = document.getElementById('matches');
        const scoreElement = document.getElementById('score');
        const gameStatus = document.getElementById('game-status');
        const startBtn = document.getElementById('start-btn');
        const resetBtn = document.getElementById('reset-btn');
        const hintBtn = document.getElementById('hint-btn');
        const diffBtns = document.querySelectorAll('.diff-btn');

        // Emojis for cards (using various categories for variety)
        const emojiCategories = {
            animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼'],
            fruits: ['🍎', '🍌', '🍒', '🍇', '🍊', '🍋', '🍉', '🍓'],
            vehicles: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️', '🚓', '🚑'],
            objects: ['📱', '💻', '⌚', '🕶️', '🎧', '🎮', '📷', '🔑'],
            sports: ['⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱']
        };

        // Initialize game
        function initGame() {
            // Reset game state
            gameStarted = false;
            gameOver = false;
            moves = 0;
            matches = 0;
            score = 0;
            timer = 0;
            flippedCards = [];
            canFlip = true;
            
            // Clear timer
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }
            
            // Update UI
            movesElement.textContent = moves;
            matchesElement.textContent = matches;
            scoreElement.textContent = score;
            timerElement.textContent = timer + 's';
            gameStatus.textContent = 'Click "Start Game" to begin!';
            startBtn.innerHTML = '<i class="fas fa-play"></i> Start Game';
            
            // Clear game board
            gameBoard.innerHTML = '';
            
            // Set grid based on difficulty
            let rows, cols;
            switch(difficulty) {
                case 'easy':
                    rows = 3;
                    cols = 4;
                    totalPairs = 6;
                    break;
                case 'medium':
                    rows = 4;
                    cols = 4;
                    totalPairs = 8;
                    break;
                case 'hard':
                    rows = 4;
                    cols = 6;
                    totalPairs = 12;
                    break;
            }
            
            // Update game board grid
            gameBoard.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
            
            // Generate card values
            generateCardValues();
            
            // Create cards
            for (let i = 0; i < cardValues.length; i++) {
                const card = document.createElement('div');
                card.className = 'card';
                card.dataset.index = i;
                card.dataset.value = cardValues[i];
                
                card.innerHTML = `
                    <div class="card-inner">
                        <div class="card-front">${cardValues[i]}</div>
                        <div class="card-back">?</div>
                    </div>
                `;
                
                card.addEventListener('click', () => flipCard(card));
                gameBoard.appendChild(card);
            }
        }

        // Generate random card values
        function generateCardValues() {
            // Select a random category
            const categories = Object.keys(emojiCategories);
            const selectedCategory = categories[Math.floor(Math.random() * categories.length)];
            const emojis = emojiCategories[selectedCategory];
            
            // Take the required number of emojis for pairs
            const selectedEmojis = emojis.slice(0, totalPairs);
            
            // Duplicate to create pairs and shuffle
            cardValues = [...selectedEmojis, ...selectedEmojis];
            shuffleArray(cardValues);
        }

        // Shuffle array using Fisher-Yates algorithm
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        // Start the game
        function startGame() {
            if (gameStarted) return;
            
            gameStarted = true;
            gameOver = false;
            startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause Game';
            gameStatus.textContent = 'Game started! Find matching pairs.';
            
            // Start timer
            timerInterval = setInterval(() => {
                timer++;
                timerElement.textContent = timer + 's';
            }, 1000);
        }

        // Pause the game
        function pauseGame() {
            if (!gameStarted || gameOver) return;
            
            gameStarted = false;
            clearInterval(timerInterval);
            timerInterval = null;
            startBtn.innerHTML = '<i class="fas fa-play"></i> Resume Game';
            gameStatus.textContent = 'Game paused';
        }

        // Flip a card
        function flipCard(card) {
            // Don't allow flipping if game not started, game over, card already flipped/matched, or two cards already flipped
            if (!gameStarted || gameOver || card.classList.contains('flipped') || 
                card.classList.contains('matched') || flippedCards.length >= 2 || !canFlip) {
                return;
            }
            
            // Flip the card
            card.classList.add('flipped');
            flippedCards.push(card);
            
            // Check for match when two cards are flipped
            if (flippedCards.length === 2) {
                moves++;
                movesElement.textContent = moves;
                
                // Disable flipping while checking
                canFlip = false;
                
                // Check if cards match
                const card1 = flippedCards[0];
                const card2 = flippedCards[1];
                
                if (card1.dataset.value === card2.dataset.value) {
                    // Match found
                    setTimeout(() => {
                        card1.classList.add('matched');
                        card2.classList.add('matched');
                        flippedCards = [];
                        canFlip = true;
                        
                        matches++;
                        matchesElement.textContent = matches;
                        
                        // Calculate score: more points for fewer moves and less time
                        score += Math.max(100 - moves - timer, 10);
                        scoreElement.textContent = score;
                        
                        // Check if game is complete
                        if (matches === totalPairs) {
                            endGame();
                        } else {
                            gameStatus.textContent = 'Match found! Keep going!';
                        }
                    }, 500);
                } else {
                    // No match - flip cards back after a delay
                    setTimeout(() => {
                        card1.classList.remove('flipped');
                        card2.classList.remove('flipped');
                        flippedCards = [];
                        canFlip = true;
                        gameStatus.textContent = 'No match. Try again!';
                    }, 1000);
                }
            }
        }

        // End the game
        function endGame() {
            gameOver = true;
            gameStarted = false;
            clearInterval(timerInterval);
            
            // Calculate final score
            const timeBonus = Math.max(300 - timer, 0);
            const movesBonus = Math.max(200 - moves, 0);
            score += timeBonus + movesBonus;
            scoreElement.textContent = score;
            
            // Display victory message
            let performance;
            if (moves <= totalPairs * 1.5) {
                performance = "Excellent memory!";
            } else if (moves <= totalPairs * 2) {
                performance = "Good job!";
            } else {
                performance = "Keep practicing!";
            }
            
            gameStatus.textContent = `You won! ${performance} Final Score: ${score}`;
            startBtn.innerHTML = '<i class="fas fa-play"></i> New Game';
            
            // Confetti effect
            showConfetti();
        }

        // Show a hint (briefly reveal all cards)
        function showHint() {
            if (!gameStarted || gameOver) {
                gameStatus.textContent = 'Start the game first!';
                return;
            }
            
            // Penalty for using hint
            score = Math.max(score - 50, 0);
            scoreElement.textContent = score;
            
            gameStatus.textContent = 'Remember the card positions!';
            
            // Flip all cards temporarily
            const cards = document.querySelectorAll('.card:not(.matched)');
            cards.forEach(card => {
                card.classList.add('flipped');
            });
            
            // Flip back after 2 seconds
            setTimeout(() => {
                cards.forEach(card => {
                    if (!card.classList.contains('matched')) {
                        card.classList.remove('flipped');
                    }
                });
                gameStatus.textContent = 'Back to the game!';
            }, 2000);
        }

        // Simple confetti effect
        function showConfetti() {
            const confettiCount = 100;
            const gameBoardRect = gameBoard.getBoundingClientRect();
            
            for (let i = 0; i < confettiCount; i++) {
                const confetti = document.createElement('div');
                confetti.innerHTML = ['🎉', '🎊', '🥳', '🌟', '⭐', '✨'][Math.floor(Math.random() * 6)];
                confetti.style.position = 'fixed';
                confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
                confetti.style.left = Math.random() * window.innerWidth + 'px';
                confetti.style.top = '-50px';
                confetti.style.zIndex = '9999';
                confetti.style.pointerEvents = 'none';
                document.body.appendChild(confetti);
                
                // Animate confetti falling
                const animation = confetti.animate([
                    { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight + 50}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 3000 + 2000,
                    easing: 'cubic-bezier(0.215, 0.610, 0.355, 1)'
                });
                
                // Remove confetti after animation
                animation.onfinish = () => confetti.remove();
            }
        }

        // Set difficulty level
        function setDifficulty(level) {
            difficulty = level;
            
            // Update active button
            diffBtns.forEach(btn => {
                if (btn.dataset.level === level) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
            
            // Reset game with new difficulty
            initGame();
        }

        // Event listeners
        startBtn.addEventListener('click', () => {
            if (!gameStarted) {
                startGame();
            } else {
                pauseGame();
            }
        });

        resetBtn.addEventListener('click', initGame);
        
        hintBtn.addEventListener('click', showHint);
        
        diffBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                setDifficulty(btn.dataset.level);
            });
        });

        // Initialize the game on load
        window.addEventListener('DOMContentLoaded', initGame);
