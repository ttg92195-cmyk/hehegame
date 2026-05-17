// ===== Hehe Snake Game =====
// A fun, colorful Snake game with mobile support

class SnakeGame {
    constructor() {
        // Canvas setup
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Grid settings
        this.gridSize = 20;
        this.tileCount = 20;
        
        // Set canvas size
        this.canvas.width = this.gridSize * this.tileCount;
        this.canvas.height = this.gridSize * this.tileCount;
        
        // Game state
        this.snake = [];
        this.food = {};
        this.bonusFood = null;
        this.bonusTimer = 0;
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        this.score = 0;
        this.highScore = parseInt(localStorage.getItem('heheSnakeHighScore')) || 0;
        this.gameRunning = false;
        this.gameSpeed = 120;
        this.lastTime = 0;
        this.accumulator = 0;
        this.particles = [];
        this.frameId = null;
        
        // Colors
        this.snakeColors = [
            '#00f5a0', '#00d9f5', '#7b68ee', '#ff6b9d', 
            '#ffd700', '#ff6347', '#00ced1', '#ff69b4'
        ];
        
        // DOM elements
        this.scoreEl = document.getElementById('score');
        this.highScoreEl = document.getElementById('high-score');
        this.finalScoreEl = document.getElementById('final-score');
        this.finalHighScoreEl = document.getElementById('final-high-score');
        this.newRecordEl = document.getElementById('new-record');
        
        // Update high score display
        this.highScoreEl.textContent = this.highScore;
        
        // Initialize
        this.setupEventListeners();
        this.setupTouchControls();
    }
    
    init() {
        // Reset snake
        this.snake = [
            { x: 10, y: 10 },
            { x: 9, y: 10 },
            { x: 8, y: 10 }
        ];
        
        // Reset direction
        this.direction = { x: 1, y: 0 };
        this.nextDirection = { x: 1, y: 0 };
        
        // Reset score
        this.score = 0;
        this.scoreEl.textContent = '0';
        
        // Reset bonus
        this.bonusFood = null;
        this.bonusTimer = 0;
        
        // Reset particles
        this.particles = [];
        
        // Spawn food
        this.spawnFood();
        
        // Game running
        this.gameRunning = true;
        this.gameSpeed = 120;
        this.lastTime = 0;
        this.accumulator = 0;
        
        // Start game loop
        if (this.frameId) cancelAnimationFrame(this.frameId);
        this.gameLoop(0);
    }
    
    spawnFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(seg => seg.x === newFood.x && seg.y === newFood.y));
        this.food = newFood;
    }
    
    spawnBonusFood() {
        if (this.bonusFood) return;
        let newBonus;
        do {
            newBonus = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (
            this.snake.some(seg => seg.x === newBonus.x && seg.y === newBonus.y) ||
            (this.food.x === newBonus.x && this.food.y === newBonus.y)
        );
        this.bonusFood = newBonus;
        this.bonusTimer = 150; // frames before bonus disappears
    }
    
    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;
            
            switch (e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
                    e.preventDefault();
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
                    e.preventDefault();
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
                    e.preventDefault();
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
                    e.preventDefault();
                    break;
            }
        });
        
        // Screen buttons
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => this.startGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
    }
    
    setupTouchControls() {
        // Mobile control buttons
        document.getElementById('btn-up').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
        });
        document.getElementById('btn-down').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
        });
        document.getElementById('btn-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
        });
        document.getElementById('btn-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
        });
        
        // Swipe controls on canvas
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            const absDx = Math.abs(dx);
            const absDy = Math.abs(dy);
            
            if (Math.max(absDx, absDy) < 20) return; // Too small
            
            if (absDx > absDy) {
                // Horizontal swipe
                if (dx > 0 && this.direction.x !== -1) this.nextDirection = { x: 1, y: 0 };
                else if (dx < 0 && this.direction.x !== 1) this.nextDirection = { x: -1, y: 0 };
            } else {
                // Vertical swipe
                if (dy > 0 && this.direction.y !== -1) this.nextDirection = { x: 0, y: 1 };
                else if (dy < 0 && this.direction.y !== 1) this.nextDirection = { x: 0, y: -1 };
            }
        });
    }
    
    startGame() {
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.init();
    }
    
    goHome() {
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
    }
    
    gameOver() {
        this.gameRunning = false;
        if (this.frameId) cancelAnimationFrame(this.frameId);
        
        // Check high score
        const isNewRecord = this.score > this.highScore;
        if (isNewRecord) {
            this.highScore = this.score;
            localStorage.setItem('heheSnakeHighScore', this.highScore);
        }
        
        // Update game over screen
        this.finalScoreEl.textContent = this.score;
        this.finalHighScoreEl.textContent = this.highScore;
        
        if (isNewRecord && this.score > 0) {
            this.newRecordEl.classList.remove('hidden');
        } else {
            this.newRecordEl.classList.add('hidden');
        }
        
        // Show game over screen
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.remove('hidden');
    }
    
    addParticles(x, y, color, count = 8) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x * this.gridSize + this.gridSize / 2,
                y: y * this.gridSize + this.gridSize / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                size: 2 + Math.random() * 4,
                color: color
            });
        }
    }
    
    update() {
        // Update direction
        this.direction = { ...this.nextDirection };
        
        // Calculate new head position
        const head = {
            x: this.snake[0].x + this.direction.x,
            y: this.snake[0].y + this.direction.y
        };
        
        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // Check self collision
        if (this.snake.some(seg => seg.x === head.x && seg.y === head.y)) {
            this.gameOver();
            return;
        }
        
        // Add new head
        this.snake.unshift(head);
        
        // Check food collision
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreEl.textContent = this.score;
            this.addParticles(this.food.x, this.food.y, '#ff6347');
            this.spawnFood();
            
            // Speed up slightly
            if (this.gameSpeed > 60) {
                this.gameSpeed -= 2;
            }
            
            // Chance to spawn bonus
            if (Math.random() < 0.3 && !this.bonusFood) {
                this.spawnBonusFood();
            }
        } else if (this.bonusFood && head.x === this.bonusFood.x && head.y === this.bonusFood.y) {
            this.score += 50;
            this.scoreEl.textContent = this.score;
            this.addParticles(this.bonusFood.x, this.bonusFood.y, '#ffd700', 15);
            this.bonusFood = null;
            this.bonusTimer = 0;
            // Don't remove tail - bonus food makes snake longer too
        } else {
            this.snake.pop();
        }
        
        // Update bonus timer
        if (this.bonusFood) {
            this.bonusTimer--;
            if (this.bonusTimer <= 0) {
                this.bonusFood = null;
            }
        }
        
        // Update particles
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            p.vx *= 0.95;
            p.vy *= 0.95;
            return p.life > 0;
        });
    }
    
    draw() {
        const ctx = this.ctx;
        const gs = this.gridSize;
        
        // Clear canvas
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid (subtle)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            ctx.beginPath();
            ctx.moveTo(i * gs, 0);
            ctx.lineTo(i * gs, this.canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * gs);
            ctx.lineTo(this.canvas.width, i * gs);
            ctx.stroke();
        }
        
        // Draw food
        const foodX = this.food.x * gs + gs / 2;
        const foodY = this.food.y * gs + gs / 2;
        
        // Food glow
        const glowGrad = ctx.createRadialGradient(foodX, foodY, 0, foodX, foodY, gs);
        glowGrad.addColorStop(0, 'rgba(255, 99, 71, 0.4)');
        glowGrad.addColorStop(1, 'rgba(255, 99, 71, 0)');
        ctx.fillStyle = glowGrad;
        ctx.fillRect(this.food.x * gs - gs / 2, this.food.y * gs - gs / 2, gs * 2, gs * 2);
        
        // Food body
        ctx.beginPath();
        ctx.arc(foodX, foodY, gs / 2 - 2, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6347';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(foodX - 2, foodY - 2, gs / 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
        
        // Draw bonus food
        if (this.bonusFood) {
            const bx = this.bonusFood.x * gs + gs / 2;
            const by = this.bonusFood.y * gs + gs / 2;
            
            // Bonus glow (pulsing)
            const pulseSize = gs * (1 + 0.3 * Math.sin(Date.now() / 200));
            const bonusGlow = ctx.createRadialGradient(bx, by, 0, bx, by, pulseSize);
            bonusGlow.addColorStop(0, 'rgba(255, 215, 0, 0.5)');
            bonusGlow.addColorStop(1, 'rgba(255, 215, 0, 0)');
            ctx.fillStyle = bonusGlow;
            ctx.fillRect(bx - pulseSize, by - pulseSize, pulseSize * 2, pulseSize * 2);
            
            // Star shape
            ctx.save();
            ctx.translate(bx, by);
            ctx.rotate(Date.now() / 500);
            this.drawStar(ctx, 0, 0, 5, gs / 2 - 1, gs / 4);
            ctx.fillStyle = '#ffd700';
            ctx.fill();
            ctx.restore();
            
            // Timer bar
            const barWidth = gs;
            const barFill = (this.bonusTimer / 150) * barWidth;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(this.bonusFood.x * gs, (this.bonusFood.y + 1) * gs, barWidth, 3);
            ctx.fillStyle = '#ffd700';
            ctx.fillRect(this.bonusFood.x * gs, (this.bonusFood.y + 1) * gs, barFill, 3);
        }
        
        // Draw snake
        this.snake.forEach((seg, i) => {
            const x = seg.x * gs;
            const y = seg.y * gs;
            const colorIndex = i % this.snakeColors.length;
            const color = this.snakeColors[colorIndex];
            
            // Snake segment shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.roundRect(x + 2, y + 2, gs - 2, gs - 2, 5);
            ctx.fill();
            
            // Snake segment
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.roundRect(x + 1, y + 1, gs - 2, gs - 2, 5);
            ctx.fill();
            
            // Head features
            if (i === 0) {
                // Head glow
                const headGlow = ctx.createRadialGradient(x + gs / 2, y + gs / 2, 0, x + gs / 2, y + gs / 2, gs);
                headGlow.addColorStop(0, 'rgba(0, 245, 160, 0.3)');
                headGlow.addColorStop(1, 'rgba(0, 245, 160, 0)');
                ctx.fillStyle = headGlow;
                ctx.fillRect(x - gs / 2, y - gs / 2, gs * 2, gs * 2);
                
                // Eyes
                const eyeOffsetX = this.direction.x * 3;
                const eyeOffsetY = this.direction.y * 3;
                
                ctx.fillStyle = '#fff';
                ctx.beginPath();
                ctx.arc(x + 6 + eyeOffsetX, y + 7 + eyeOffsetY, 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 14 + eyeOffsetX, y + 7 + eyeOffsetY, 3, 0, Math.PI * 2);
                ctx.fill();
                
                // Pupils
                ctx.fillStyle = '#000';
                ctx.beginPath();
                ctx.arc(x + 6 + eyeOffsetX * 1.3, y + 7 + eyeOffsetY * 1.3, 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.arc(x + 14 + eyeOffsetX * 1.3, y + 7 + eyeOffsetY * 1.3, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Shine on body
            if (i > 0) {
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.beginPath();
                ctx.roundRect(x + 3, y + 2, gs - 8, gs / 2 - 2, 3);
                ctx.fill();
            }
        });
        
        // Draw particles
        this.particles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }
    
    drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let step = Math.PI / spikes;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);
        
        for (let i = 0; i < spikes; i++) {
            ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
            rot += step;
            ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
            rot += step;
        }
        
        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
    }
    
    gameLoop(timestamp) {
        if (!this.gameRunning) return;
        
        if (!this.lastTime) this.lastTime = timestamp;
        const delta = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.accumulator += delta;
        
        while (this.accumulator >= this.gameSpeed) {
            this.update();
            this.accumulator -= this.gameSpeed;
        }
        
        this.draw();
        this.frameId = requestAnimationFrame((t) => this.gameLoop(t));
    }
}

// ===== Initialize Game =====
const game = new SnakeGame();
