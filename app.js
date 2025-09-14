/**
 * Ultimate Mind Vault - 3D Puzzle Box Game
 * Advanced dyslexia-optimized puzzle experience with multiple themes and mechanics
 */

class UltimateMindVault {
    constructor() {
        // Core Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.puzzleBox = null;
        this.currentTheme = 'tutorial';
        this.currentBoxIndex = 0;
        
        // Interaction handling
        this.mouse = new THREE.Vector2();
        this.raycaster = new THREE.Raycaster();
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };
        this.interactiveObjects = [];
        
        // Game state management
        this.gameState = 'splash'; // splash, menu, preview, playing, victory
        this.gameData = this.loadGameData();
        this.currentPuzzles = [];
        this.puzzlesSolved = {};
        this.startTime = 0;
        this.gameTimer = null;
        
        // Audio system
        this.audioContext = null;
        this.audioEnabled = false;
        this.masterVolume = 0.75;
        this.instrumentTypes = {
            tutorial: 'sine',
            steampunk: 'sawtooth',
            crystal: 'triangle',
            space: 'square',
            temple: 'sine'
        };
        
        // Particle systems
        this.particleSystems = [];
        this.activeParticles = [];
        
        // Achievement system
        this.achievements = new Map();
        this.unlockedAchievements = new Set();
        
        // Mobile optimization
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.supportsHaptic = 'vibrate' in navigator;
        
        // Performance monitoring
        this.fps = 60;
        this.frameCount = 0;
        this.lastFPSCheck = 0;
        
        this.init();
    }
    
    init() {
        this.setupGameData();
        this.setupAudio();
        this.setupGlobalEventListeners();
        this.loadProgress();
        
        // Start with splash screen
        setTimeout(() => {
            this.showSplashScreen();
        }, 100);
        
        // Start main game loop
        this.animate();
    }
    
    setupGameData() {
        // Initialize comprehensive game data structure
        this.gameData = {
            themes: {
                tutorial: {
                    name: "Tutorial Basics",
                    unlocked: true,
                    color: "#4A90E2",
                    boxes: 1,
                    completed: 0,
                    puzzleTypes: ['colorPattern', 'shapeAssembly', 'spatialRotation']
                },
                steampunk: {
                    name: "Clockwork Gears",
                    unlocked: false,
                    color: "#B8860B",
                    boxes: 5,
                    completed: 0,
                    puzzleTypes: ['rotatingGears', 'steamValves', 'clockworkTimer', 'mechanicalKeys', 'pressurePuzzle']
                },
                crystal: {
                    name: "Crystal Caves",
                    unlocked: false,
                    color: "#9370DB",
                    boxes: 5,
                    completed: 0,
                    puzzleTypes: ['lightRefraction', 'gemMatching', 'crystalGrowth', 'soundResonance', 'glowingTrails']
                },
                space: {
                    name: "Space Station",
                    unlocked: false,
                    color: "#00CED1",
                    boxes: 5,
                    completed: 0,
                    puzzleTypes: ['holographicInterface', 'circuitCompletion', 'gravityManipulation', 'energyFlow', 'alienSymbols']
                },
                temple: {
                    name: "Ancient Temple",
                    unlocked: false,
                    color: "#CD853F",
                    boxes: 5,
                    completed: 0,
                    puzzleTypes: ['slidingTiles', 'symbolRotation', 'waterFlow', 'torchLighting', 'hieroglyphPatterns']
                }
            },
            
            colorPalettes: {
                tutorial: ["#4A90E2", "#50E3C2", "#F5A623", "#D0021B", "#9013FE"],
                steampunk: ["#B8860B", "#CD853F", "#A0522D", "#8B4513", "#D2691E"],
                crystal: ["#9370DB", "#8A2BE2", "#7B68EE", "#6495ED", "#48D1CC"],
                space: ["#00CED1", "#1E90FF", "#00BFFF", "#87CEEB", "#B0E0E6"],
                temple: ["#CD853F", "#DAA520", "#B8860B", "#DEB887", "#F4A460"]
            },
            
            crystalShards: 0,
            totalGameTime: 0,
            highScores: {},
            settings: {
                volume: 75,
                highContrast: false,
                animationSpeed: 'normal',
                hapticFeedback: true
            }
        };
        
        this.initializeAchievements();
    }
    
    initializeAchievements() {
        const achievementData = [
            { id: 'firstBox', name: 'Box Breaker', description: 'Open your first puzzle box', icon: '📦', rarity: 'common' },
            { id: 'speedSolver', name: 'Lightning Fast', description: 'Complete box in under 60 seconds', icon: '⚡', rarity: 'rare' },
            { id: 'patternMaster', name: 'Pattern Genius', description: 'Perfect color sequences 10 times', icon: '🎨', rarity: 'epic' },
            { id: 'shapeWizard', name: 'Shape Master', description: 'Flawless shape assembly 15 times', icon: '🔷', rarity: 'epic' },
            { id: 'spatialGenius', name: '3D Visionary', description: 'Rotation puzzles without mistakes', icon: '👁️', rarity: 'legendary' },
            { id: 'explorer', name: 'World Explorer', description: 'Unlock all themes', icon: '🗺️', rarity: 'legendary' },
            { id: 'collector', name: 'Crystal Collector', description: 'Gather 100 crystal shards', icon: '💎', rarity: 'epic' },
            { id: 'perfectionist', name: 'Perfectionist', description: '100% completion', icon: '👑', rarity: 'legendary' }
        ];
        
        achievementData.forEach(achievement => {
            this.achievements.set(achievement.id, {
                ...achievement,
                unlocked: false,
                progress: 0,
                maxProgress: this.getAchievementMaxProgress(achievement.id)
            });
        });
    }
    
    getAchievementMaxProgress(id) {
        const progressMap = {
            firstBox: 1,
            speedSolver: 1,
            patternMaster: 10,
            shapeWizard: 15,
            spatialGenius: 1,
            explorer: 5,
            collector: 100,
            perfectionist: 1
        };
        return progressMap[id] || 1;
    }
    
    showSplashScreen() {
        // Hide audio unlock first
        document.getElementById('audio-unlock').classList.add('hidden');
        
        // Show splash screen
        document.getElementById('splash-screen').classList.remove('hidden');
        this.createSplashParticles();
        
        setTimeout(() => {
            this.gameState = 'menu';
            document.getElementById('splash-screen').classList.add('fade-out');
            setTimeout(() => {
                document.getElementById('splash-screen').classList.add('hidden');
                this.showMainMenu();
            }, 1000);
        }, 3500);
    }
    
    createSplashParticles() {
        const particleField = document.querySelector('.particle-field');
        if (!particleField) return;
        
        for (let i = 0; i < 30; i++) {
            const particle = document.createElement('div');
            particle.className = 'splash-particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 4 + 's';
            particle.style.setProperty('--drift', (Math.random() - 0.5) * 200 + 'px');
            particleField.appendChild(particle);
            
            setTimeout(() => particle.remove(), 8000);
        }
    }
    
    showMainMenu() {
        document.getElementById('main-menu').classList.remove('hidden');
        document.getElementById('main-menu').classList.add('show');
        this.updateThemeCards();
        this.updateCrystalCount();
        this.setupMenuEventListeners();
    }
    
    updateThemeCards() {
        const themes = Object.keys(this.gameData.themes);
        themes.forEach(themeId => {
            const theme = this.gameData.themes[themeId];
            const card = document.querySelector(`[data-theme="${themeId}"]`);
            
            if (card) {
                const progressFill = card.querySelector('.progress-fill');
                const boxesCompleted = card.querySelector('.boxes-completed');
                const unlockStatus = card.querySelector('.unlock-status');
                
                const progress = (theme.completed / theme.boxes) * 100;
                if (progressFill) progressFill.style.width = progress + '%';
                if (boxesCompleted) boxesCompleted.textContent = `${theme.completed}/${theme.boxes}`;
                
                if (theme.unlocked) {
                    card.classList.remove('locked');
                    if (unlockStatus) {
                        unlockStatus.textContent = '✓';
                        unlockStatus.classList.add('unlocked');
                    }
                } else {
                    card.classList.add('locked');
                    if (unlockStatus) {
                        unlockStatus.textContent = '🔒';
                        unlockStatus.classList.remove('unlocked');
                    }
                }
            }
        });
    }
    
    updateCrystalCount() {
        const crystalElement = document.getElementById('total-crystals');
        if (crystalElement) {
            crystalElement.textContent = this.gameData.crystalShards;
        }
    }
    
    setupGlobalEventListeners() {
        // Window events
        window.addEventListener('resize', () => this.onWindowResize());
        window.addEventListener('beforeunload', () => this.saveProgress());
        
        // Mobile touch optimization
        if (this.isMobile) {
            this.setupMobileControls();
        }
    }
    
    setupMenuEventListeners() {
        // Theme selection with direct event listeners
        document.querySelectorAll('.theme-card').forEach(card => {
            // Remove any existing event listeners
            card.replaceWith(card.cloneNode(true));
        });
        
        // Re-select cards after cloning
        document.querySelectorAll('.theme-card').forEach(card => {
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (!card.classList.contains('locked')) {
                    const themeId = card.dataset.theme;
                    console.log('Theme selected:', themeId); // Debug log
                    this.selectTheme(themeId);
                }
            });
            
            // Add visual feedback on hover
            card.addEventListener('mouseenter', () => {
                if (!card.classList.contains('locked')) {
                    card.style.transform = 'translateY(-8px)';
                    card.style.borderColor = 'var(--color-primary)';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (!card.classList.contains('locked')) {
                    card.style.transform = '';
                    card.style.borderColor = '';
                }
            });
        });
        
        // Modal controls with direct event listeners
        const achievementsBtn = document.getElementById('achievements-btn');
        if (achievementsBtn) {
            achievementsBtn.replaceWith(achievementsBtn.cloneNode(true));
            document.getElementById('achievements-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.showAchievements();
            });
        }
        
        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.replaceWith(settingsBtn.cloneNode(true));
            document.getElementById('settings-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.showSettings();
            });
        }
        
        // Modal close buttons
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal(e.target.closest('.modal'));
            });
        });
        
        // Audio unlock
        const enableAudio = document.getElementById('enable-audio');
        if (enableAudio) {
            enableAudio.addEventListener('click', (e) => {
                e.preventDefault();
                this.enableAudio();
            });
        }
        
        console.log('Menu event listeners set up'); // Debug log
    }
    
    setupMobileControls() {
        // Prevent zoom on double tap
        document.addEventListener('touchstart', (e) => {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
    }
    
    selectTheme(themeId) {
        console.log('Selecting theme:', themeId); // Debug log
        this.currentTheme = themeId;
        this.currentBoxIndex = this.gameData.themes[themeId].completed;
        
        // Hide main menu
        document.getElementById('main-menu').classList.add('hidden');
        document.getElementById('main-menu').classList.remove('show');
        
        this.showBoxPreview();
    }
    
    showBoxPreview() {
        console.log('Showing box preview'); // Debug log
        
        // Show box preview screen
        document.getElementById('box-preview').classList.remove('hidden');
        
        const theme = this.gameData.themes[this.currentTheme];
        const themeNameElement = document.getElementById('current-theme-name');
        const boxNumberElement = document.getElementById('current-box-number');
        
        if (themeNameElement) themeNameElement.textContent = theme.name;
        if (boxNumberElement) boxNumberElement.textContent = `Box ${this.currentBoxIndex + 1} of ${theme.boxes}`;
        
        this.setupPreviewEventListeners();
        this.setup3DPreview();
    }
    
    setupPreviewEventListeners() {
        // Back to menu button
        const backToMenu = document.getElementById('back-to-menu');
        if (backToMenu) {
            backToMenu.replaceWith(backToMenu.cloneNode(true));
            document.getElementById('back-to-menu').addEventListener('click', (e) => {
                e.preventDefault();
                this.backToMainMenu();
            });
        }
        
        // Start puzzle button
        const startPuzzle = document.getElementById('start-puzzle');
        if (startPuzzle) {
            startPuzzle.replaceWith(startPuzzle.cloneNode(true));
            document.getElementById('start-puzzle').addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Starting puzzle game'); // Debug log
                this.startPuzzleGame();
            });
        }
        
        // Hint button
        const hintBtn = document.getElementById('hint-btn');
        if (hintBtn) {
            hintBtn.replaceWith(hintBtn.cloneNode(true));
            document.getElementById('hint-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.showHint();
            });
        }
    }
    
    backToMainMenu() {
        // Hide all screens
        document.getElementById('box-preview').classList.add('hidden');
        document.getElementById('game-ui').classList.add('hidden');
        document.getElementById('victory-celebration').classList.add('hidden');
        
        // Show main menu
        this.gameState = 'menu';
        this.showMainMenu();
    }
    
    setup3DPreview() {
        const container = document.getElementById('box-preview-canvas');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Create preview scene
        const previewScene = new THREE.Scene();
        const previewCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        const previewRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        previewRenderer.setSize(container.clientWidth, container.clientHeight);
        previewRenderer.setClearColor(0x000000, 0);
        container.appendChild(previewRenderer.domElement);
        
        // Create themed preview box
        this.createPreviewBox(previewScene);
        
        previewCamera.position.set(0, 0, 300);
        
        // Preview animation loop
        const animatePreview = () => {
            if (this.gameState === 'preview' && document.getElementById('box-preview').classList.contains('hidden') === false) {
                requestAnimationFrame(animatePreview);
                
                // Gentle rotation
                previewScene.children.forEach(child => {
                    if (child.type === 'Group') {
                        child.rotation.y += 0.005;
                        child.rotation.x = Math.sin(Date.now() * 0.001) * 0.1;
                    }
                });
                
                previewRenderer.render(previewScene, previewCamera);
            }
        };
        
        this.gameState = 'preview';
        animatePreview();
    }
    
    createPreviewBox(scene) {
        const boxGroup = new THREE.Group();
        
        // Main box geometry
        const boxGeometry = new THREE.BoxGeometry(150, 150, 150);
        const boxMaterial = new THREE.MeshLambertMaterial({
            color: this.gameData.themes[this.currentTheme].color,
            transparent: true,
            opacity: 0.8
        });
        
        const mainBox = new THREE.Mesh(boxGeometry, boxMaterial);
        boxGroup.add(mainBox);
        
        // Add theme-specific decorations
        this.addThemeSpecificElements(boxGroup);
        
        // Lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        
        scene.add(ambientLight);
        scene.add(directionalLight);
        scene.add(boxGroup);
        
        // Particle effects around the box
        this.createPreviewParticles(scene);
    }
    
    addThemeSpecificElements(boxGroup) {
        const theme = this.currentTheme;
        
        switch (theme) {
            case 'steampunk':
                this.addSteampunkElements(boxGroup);
                break;
            case 'crystal':
                this.addCrystalElements(boxGroup);
                break;
            case 'space':
                this.addSpaceElements(boxGroup);
                break;
            case 'temple':
                this.addTempleElements(boxGroup);
                break;
            default:
                this.addTutorialElements(boxGroup);
        }
    }
    
    addSteampunkElements(boxGroup) {
        // Gears on sides
        for (let i = 0; i < 6; i++) {
            const gearGeometry = new THREE.CylinderGeometry(20, 20, 5, 8);
            const gearMaterial = new THREE.MeshLambertMaterial({ color: 0xCD853F });
            const gear = new THREE.Mesh(gearGeometry, gearMaterial);
            
            const angle = (i / 6) * Math.PI * 2;
            gear.position.set(Math.cos(angle) * 80, Math.sin(angle) * 80, 0);
            gear.rotation.z = angle;
            
            boxGroup.add(gear);
        }
    }
    
    addCrystalElements(boxGroup) {
        // Crystal formations
        for (let i = 0; i < 8; i++) {
            const crystalGeometry = new THREE.ConeGeometry(8, 30, 6);
            const crystalMaterial = new THREE.MeshLambertMaterial({
                color: this.gameData.colorPalettes.crystal[i % 5],
                transparent: true,
                opacity: 0.8
            });
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            
            crystal.position.set(
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200,
                (Math.random() - 0.5) * 200
            );
            crystal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
            
            boxGroup.add(crystal);
        }
    }
    
    addSpaceElements(boxGroup) {
        // Holographic panels
        for (let i = 0; i < 4; i++) {
            const panelGeometry = new THREE.PlaneGeometry(60, 40);
            const panelMaterial = new THREE.MeshBasicMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.3
            });
            const panel = new THREE.Mesh(panelGeometry, panelMaterial);
            
            panel.position.set(0, 0, 80);
            panel.rotation.y = (i / 4) * Math.PI * 2;
            
            boxGroup.add(panel);
        }
    }
    
    addTempleElements(boxGroup) {
        // Stone pillars
        for (let i = 0; i < 4; i++) {
            const pillarGeometry = new THREE.CylinderGeometry(10, 10, 80, 8);
            const pillarMaterial = new THREE.MeshLambertMaterial({ color: 0xCD853F });
            const pillar = new THREE.Mesh(pillarGeometry, pillarMaterial);
            
            const angle = (i / 4) * Math.PI * 2;
            pillar.position.set(Math.cos(angle) * 100, 0, Math.sin(angle) * 100);
            
            boxGroup.add(pillar);
        }
    }
    
    addTutorialElements(boxGroup) {
        // Simple geometric shapes
        const shapes = [
            new THREE.SphereGeometry(15, 16, 16),
            new THREE.BoxGeometry(25, 25, 25),
            new THREE.ConeGeometry(15, 30, 8)
        ];
        
        shapes.forEach((geometry, index) => {
            const material = new THREE.MeshLambertMaterial({
                color: this.gameData.colorPalettes.tutorial[index]
            });
            const mesh = new THREE.Mesh(geometry, material);
            
            const angle = (index / 3) * Math.PI * 2;
            mesh.position.set(Math.cos(angle) * 90, Math.sin(angle) * 90, 0);
            
            boxGroup.add(mesh);
        });
    }
    
    createPreviewParticles(scene) {
        const particleCount = 20;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 400;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
            
            const color = new THREE.Color(this.gameData.themes[this.currentTheme].color);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        
        const material = new THREE.PointsMaterial({
            size: 4,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });
        
        const particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }
    
    startPuzzleGame() {
        console.log('Starting puzzle game...'); // Debug log
        
        // Hide preview and show game UI
        document.getElementById('box-preview').classList.add('hidden');
        document.getElementById('game-ui').classList.remove('hidden');
        
        this.gameState = 'playing';
        this.startTime = Date.now();
        this.startGameTimer();
        
        this.setup3DGame();
        this.generatePuzzles();
        this.resetPuzzleProgress();
        this.setupGameEventListeners();
    }
    
    setupGameEventListeners() {
        // Game control buttons
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.replaceWith(pauseBtn.cloneNode(true));
            document.getElementById('pause-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.pauseGame();
            });
        }
        
        const resetPuzzle = document.getElementById('reset-puzzle');
        if (resetPuzzle) {
            resetPuzzle.replaceWith(resetPuzzle.cloneNode(true));
            document.getElementById('reset-puzzle').addEventListener('click', (e) => {
                e.preventDefault();
                this.resetCurrentPuzzle();
            });
        }
        
        const toggleAudio = document.getElementById('toggle-audio');
        if (toggleAudio) {
            toggleAudio.replaceWith(toggleAudio.cloneNode(true));
            document.getElementById('toggle-audio').addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleAudio();
            });
        }
        
        // Victory screen buttons
        const continueBtn = document.getElementById('continue-btn');
        if (continueBtn) {
            continueBtn.replaceWith(continueBtn.cloneNode(true));
            document.getElementById('continue-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.continueToNextBox();
            });
        }
        
        const replayBtn = document.getElementById('replay-btn');
        if (replayBtn) {
            replayBtn.replaceWith(replayBtn.cloneNode(true));
            document.getElementById('replay-btn').addEventListener('click', (e) => {
                e.preventDefault();
                this.replayCurrentBox();
            });
        }
        
        // Settings controls
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.masterVolume = e.target.value / 100;
                this.gameData.settings.volume = e.target.value;
                this.saveProgress();
            });
        }
        
        const contrastToggle = document.getElementById('contrast-toggle');
        if (contrastToggle) {
            contrastToggle.addEventListener('change', (e) => {
                this.gameData.settings.highContrast = e.target.checked;
                this.toggleHighContrast(e.target.checked);
                this.saveProgress();
            });
        }
        
        const hapticToggle = document.getElementById('haptic-toggle');
        if (hapticToggle) {
            hapticToggle.addEventListener('change', (e) => {
                this.gameData.settings.hapticFeedback = e.target.checked;
                this.saveProgress();
            });
        }
    }
    
    startGameTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const seconds = (elapsed % 60).toString().padStart(2, '0');
            const timerElement = document.getElementById('game-timer');
            if (timerElement) {
                timerElement.textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }
    
    setup3DGame() {
        const container = document.getElementById('game-canvas');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1a1a2e);
        this.scene.fog = new THREE.Fog(0x1a1a2e, 500, 1000);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 0, 500);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setClearColor(0x1a1a2e);
        
        container.appendChild(this.renderer.domElement);
        
        this.setupLighting();
        this.setupControls();
        this.createPuzzleBox();
    }
    
    setupLighting() {
        // Dynamic lighting system
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(300, 300, 200);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Theme-specific accent lighting
        const accentColor = new THREE.Color(this.gameData.themes[this.currentTheme].color);
        const accentLight = new THREE.PointLight(accentColor, 0.6, 800);
        accentLight.position.set(0, 200, 300);
        this.scene.add(accentLight);
        
        // Animated lighting effects
        this.animateLights();
    }
    
    animateLights() {
        const animateLoop = () => {
            if (this.gameState === 'playing') {
                const time = Date.now() * 0.001;
                
                // Gentle light movement
                this.scene.children.forEach(child => {
                    if (child.type === 'PointLight') {
                        child.position.x = Math.sin(time * 0.5) * 100;
                        child.position.z = 300 + Math.cos(time * 0.3) * 50;
                    }
                });
                
                requestAnimationFrame(animateLoop);
            }
        };
        animateLoop();
    }
    
    setupControls() {
        const canvas = this.renderer.domElement;
        
        // Mouse events
        canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        canvas.addEventListener('mouseup', (e) => this.onMouseUp(e));
        canvas.addEventListener('wheel', (e) => this.onMouseWheel(e));
        
        // Touch events for mobile
        canvas.addEventListener('touchstart', (e) => this.onTouchStart(e));
        canvas.addEventListener('touchmove', (e) => this.onTouchMove(e));
        canvas.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    createPuzzleBox() {
        this.puzzleBox = new THREE.Group();
        this.interactiveObjects = [];
        
        // Main box structure
        const boxGeometry = new THREE.BoxGeometry(200, 200, 200);
        const boxMaterial = new THREE.MeshLambertMaterial({
            color: new THREE.Color(this.gameData.themes[this.currentTheme].color),
            transparent: true,
            opacity: 0.7
        });
        
        const mainBox = new THREE.Mesh(boxGeometry, boxMaterial);
        mainBox.castShadow = true;
        mainBox.receiveShadow = true;
        this.puzzleBox.add(mainBox);
        
        // Add theme-specific puzzle mechanisms
        this.createThemePuzzles();
        
        this.scene.add(this.puzzleBox);
    }
    
    createThemePuzzles() {
        const theme = this.currentTheme;
        const puzzleTypes = this.gameData.themes[theme].puzzleTypes;
        
        // Create puzzle mechanisms for this box
        puzzleTypes.slice(0, 3).forEach((puzzleType, index) => {
            this.createSpecificPuzzle(puzzleType, index);
        });
    }
    
    createSpecificPuzzle(puzzleType, index) {
        const position = this.getPuzzlePosition(index);
        
        switch (puzzleType) {
            case 'colorPattern':
                this.createColorPatternPuzzle(position, index);
                break;
            case 'shapeAssembly':
                this.createShapeAssemblyPuzzle(position, index);
                break;
            case 'spatialRotation':
                this.createSpatialRotationPuzzle(position, index);
                break;
            default:
                this.createDefaultPuzzle(position, index);
        }
    }
    
    getPuzzlePosition(index) {
        const positions = [
            { x: 0, y: 50, z: 105, rotation: { x: 0, y: 0, z: 0 } },      // Front top
            { x: 105, y: 0, z: 0, rotation: { x: 0, y: Math.PI/2, z: 0 } }, // Right
            { x: 0, y: -50, z: 105, rotation: { x: 0, y: 0, z: 0 } },     // Front bottom
        ];
        
        return positions[index] || positions[0];
    }
    
    createColorPatternPuzzle(position, index) {
        const puzzleGroup = new THREE.Group();
        puzzleGroup.name = `puzzle_${index}`;
        puzzleGroup.position.set(position.x, position.y, position.z);
        puzzleGroup.rotation.set(position.rotation.x, position.rotation.y, position.rotation.z);
        
        // Background panel
        const panelGeometry = new THREE.BoxGeometry(80, 60, 5);
        const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        puzzleGroup.add(panel);
        
        // Color sequence targets
        const targetColors = this.generateColorSequence(3);
        const currentColors = [0, 0, 0];
        
        // Interactive color dials
        for (let i = 0; i < 3; i++) {
            const dialGeometry = new THREE.CylinderGeometry(8, 8, 6, 12);
            const dialMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color(this.gameData.colorPalettes[this.currentTheme][currentColors[i]])
            });
            
            const dial = new THREE.Mesh(dialGeometry, dialMaterial);
            dial.position.set((i - 1) * 20, 0, 3);
            dial.rotation.x = Math.PI / 2;
            
            dial.userData = {
                type: 'colorDial',
                puzzleIndex: index,
                dialIndex: i,
                interactive: true,
                targetColor: targetColors[i],
                currentColor: currentColors[i]
            };
            
            puzzleGroup.add(dial);
            this.interactiveObjects.push(dial);
        }
        
        // Target display
        for (let i = 0; i < 3; i++) {
            const targetGeometry = new THREE.CircleGeometry(6, 12);
            const targetMaterial = new THREE.MeshBasicMaterial({
                color: new THREE.Color(this.gameData.colorPalettes[this.currentTheme][targetColors[i]]),
                transparent: true,
                opacity: 0.7
            });
            
            const target = new THREE.Mesh(targetGeometry, targetMaterial);
            target.position.set((i - 1) * 20, 20, 3);
            puzzleGroup.add(target);
        }
        
        this.puzzleBox.add(puzzleGroup);
        
        // Initialize puzzle state
        this.puzzlesSolved[index] = {
            type: 'colorPattern',
            solved: false,
            targetColors,
            currentColors: [...currentColors],
            attempts: 0
        };
    }
    
    createShapeAssemblyPuzzle(position, index) {
        const puzzleGroup = new THREE.Group();
        puzzleGroup.name = `puzzle_${index}`;
        puzzleGroup.position.set(position.x, position.y, position.z);
        puzzleGroup.rotation.set(position.rotation.x, position.rotation.y, position.rotation.z);
        
        // Background panel
        const panelGeometry = new THREE.BoxGeometry(5, 80, 60);
        const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        puzzleGroup.add(panel);
        
        // Create shape slots and floating shapes
        const shapes = ['triangle', 'square', 'circle'];
        
        shapes.forEach((shapeType, i) => {
            // Shape slot
            const slotGeometry = this.getShapeGeometry(shapeType, 15);
            const slotMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x34495e,
                transparent: true,
                opacity: 0.5 
            });
            const slot = new THREE.Mesh(slotGeometry, slotMaterial);
            slot.position.set(3, (i - 1) * 25, 0);
            puzzleGroup.add(slot);
            
            // Floating shape
            const shapeGeometry = this.getShapeGeometry(shapeType, 12);
            const shapeMaterial = new THREE.MeshLambertMaterial({
                color: new THREE.Color(this.gameData.colorPalettes[this.currentTheme][i])
            });
            const shape = new THREE.Mesh(shapeGeometry, shapeMaterial);
            
            // Position shapes around the puzzle
            const angle = (i / 3) * Math.PI * 2 + Math.PI / 2;
            shape.position.set(
                Math.cos(angle) * 50 + position.x,
                Math.sin(angle) * 50 + position.y,
                position.z + 50
            );
            
            shape.userData = {
                type: 'floatingShape',
                puzzleIndex: index,
                shapeType: shapeType,
                interactive: true,
                placed: false,
                targetPosition: new THREE.Vector3(position.x + 3, position.y + (i - 1) * 25, position.z)
            };
            
            this.scene.add(shape);
            this.interactiveObjects.push(shape);
        });
        
        this.puzzleBox.add(puzzleGroup);
        
        // Initialize puzzle state
        this.puzzlesSolved[index] = {
            type: 'shapeAssembly',
            solved: false,
            shapesPlaced: { triangle: false, square: false, circle: false },
            attempts: 0
        };
    }
    
    createSpatialRotationPuzzle(position, index) {
        const puzzleGroup = new THREE.Group();
        puzzleGroup.name = `puzzle_${index}`;
        puzzleGroup.position.set(position.x, position.y, position.z);
        puzzleGroup.rotation.set(position.rotation.x, position.rotation.y, position.rotation.z);
        
        // Background panel
        const panelGeometry = new THREE.BoxGeometry(80, 5, 60);
        const panelMaterial = new THREE.MeshLambertMaterial({ color: 0x2c3e50 });
        const panel = new THREE.Mesh(panelGeometry, panelMaterial);
        puzzleGroup.add(panel);
        
        // Rotatable cylinder with pattern
        const cylinderGeometry = new THREE.CylinderGeometry(25, 25, 8, 16);
        const cylinderMaterial = new THREE.MeshLambertMaterial({ color: 0x3498db });
        const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
        cylinder.position.set(0, 0, 5);
        cylinder.rotation.x = Math.PI / 2;
        
        // Add pattern holes
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const x = Math.cos(angle) * 15;
            const y = Math.sin(angle) * 15;
            
            const holeGeometry = new THREE.CircleGeometry(3, 8);
            const holeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const hole = new THREE.Mesh(holeGeometry, holeMaterial);
            hole.position.set(x, y, 4.1);
            cylinder.add(hole);
        }
        
        cylinder.userData = {
            type: 'rotationCylinder',
            puzzleIndex: index,
            interactive: true,
            currentRotation: 0,
            targetRotation: Math.floor(Math.random() * 5) * 72 // 0, 72, 144, 216, 288 degrees
        };
        
        puzzleGroup.add(cylinder);
        this.interactiveObjects.push(cylinder);
        
        this.puzzleBox.add(puzzleGroup);
        
        // Initialize puzzle state
        this.puzzlesSolved[index] = {
            type: 'spatialRotation',
            solved: false,
            currentRotation: 0,
            targetRotation: cylinder.userData.targetRotation,
            attempts: 0
        };
    }
    
    createDefaultPuzzle(position, index) {
        // Fallback puzzle creation
        this.createColorPatternPuzzle(position, index);
    }
    
    getShapeGeometry(shapeType, size = 20) {
        switch (shapeType) {
            case 'triangle':
                return new THREE.ConeGeometry(size * 0.8, size * 1.5, 3);
            case 'square':
                return new THREE.BoxGeometry(size, size, size * 0.5);
            case 'circle':
                return new THREE.CylinderGeometry(size * 0.8, size * 0.8, size * 0.5, 16);
            default:
                return new THREE.BoxGeometry(size, size, size * 0.5);
        }
    }
    
    generateColorSequence(length) {
        const colors = Array.from({length: this.gameData.colorPalettes[this.currentTheme].length}, (_, i) => i);
        const sequence = [];
        
        for (let i = 0; i < length; i++) {
            sequence.push(colors[Math.floor(Math.random() * colors.length)]);
        }
        
        return sequence;
    }
    
    generatePuzzles() {
        // Initialize all puzzle states
        this.currentPuzzles = [];
        
        const theme = this.gameData.themes[this.currentTheme];
        const puzzleCount = 3; // Simplified to 3 puzzles for tutorial
        
        for (let i = 0; i < puzzleCount; i++) {
            if (!this.puzzlesSolved[i]) {
                this.puzzlesSolved[i] = {
                    type: theme.puzzleTypes[i],
                    solved: false,
                    attempts: 0,
                    startTime: Date.now()
                };
            }
        }
        
        this.updatePuzzleIndicators();
    }
    
    resetPuzzleProgress() {
        Object.keys(this.puzzlesSolved).forEach(key => {
            this.puzzlesSolved[key].solved = false;
            this.puzzlesSolved[key].attempts = 0;
        });
        
        this.updatePuzzleIndicators();
    }
    
    updatePuzzleIndicators() {
        document.querySelectorAll('.puzzle-dot').forEach((dot, index) => {
            dot.classList.remove('active', 'completed');
            
            if (this.puzzlesSolved[index]) {
                if (this.puzzlesSolved[index].solved) {
                    dot.classList.add('completed');
                } else {
                    dot.classList.add('active');
                }
            }
        });
    }
    
    // Event handlers for interaction
    onMouseDown(event) {
        event.preventDefault();
        this.isDragging = true;
        this.updateMousePosition(event);
        this.previousMousePosition = { x: event.clientX, y: event.clientY };
        
        this.handleInteraction();
    }
    
    onMouseMove(event) {
        this.updateMousePosition(event);
        
        if (this.isDragging) {
            // Camera orbit controls
            const deltaMove = {
                x: event.clientX - this.previousMousePosition.x,
                y: event.clientY - this.previousMousePosition.y
            };
            
            this.orbitCamera(deltaMove);
            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        }
    }
    
    onMouseUp(event) {
        this.isDragging = false;
    }
    
    updateMousePosition(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }
    
    orbitCamera(deltaMove) {
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(this.camera.position);
        
        spherical.theta -= deltaMove.x * 0.01;
        spherical.phi += deltaMove.y * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        
        this.camera.position.setFromSpherical(spherical);
        this.camera.lookAt(0, 0, 0);
    }
    
    handleInteraction() {
        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.interactiveObjects);
        
        if (intersects.length > 0) {
            const object = intersects[0].object;
            this.handleObjectClick(object);
        }
    }
    
    handleObjectClick(object) {
        const userData = object.userData;
        
        if (!userData.interactive) return;
        
        switch (userData.type) {
            case 'colorDial':
                this.handleColorDialClick(object, userData);
                break;
            case 'floatingShape':
                this.handleShapeClick(object, userData);
                break;
            case 'rotationCylinder':
                this.handleRotationClick(object, userData);
                break;
        }
        
        this.triggerHapticFeedback();
        this.createInteractionParticles(object.position);
    }
    
    handleColorDialClick(object, userData) {
        const { puzzleIndex, dialIndex } = userData;
        const puzzle = this.puzzlesSolved[puzzleIndex];
        
        if (puzzle.solved) return;
        
        // Cycle through colors
        const colorCount = this.gameData.colorPalettes[this.currentTheme].length;
        puzzle.currentColors[dialIndex] = (puzzle.currentColors[dialIndex] + 1) % colorCount;
        
        // Update visual
        object.material.color.setHex(
            new THREE.Color(this.gameData.colorPalettes[this.currentTheme][puzzle.currentColors[dialIndex]]).getHex()
        );
        
        // Update user data
        object.userData.currentColor = puzzle.currentColors[dialIndex];
        
        // Play audio feedback
        this.playNote(261.63 + dialIndex * 50, 0.2);
        
        // Check if puzzle is solved
        this.checkColorPatternSolved(puzzleIndex);
    }
    
    handleShapeClick(object, userData) {
        const { puzzleIndex, shapeType } = userData;
        const puzzle = this.puzzlesSolved[puzzleIndex];
        
        if (puzzle.solved || userData.placed) return;
        
        // Move shape to target position
        object.position.copy(userData.targetPosition);
        userData.placed = true;
        puzzle.shapesPlaced[shapeType] = true;
        
        this.playNote(329.63 + Object.keys(puzzle.shapesPlaced).indexOf(shapeType) * 100);
        this.checkShapeAssemblySolved(puzzleIndex);
    }
    
    handleRotationClick(object, userData) {
        const { puzzleIndex } = userData;
        const puzzle = this.puzzlesSolved[puzzleIndex];
        
        if (puzzle.solved) return;
        
        // Rotate cylinder by 72 degrees
        puzzle.currentRotation = (puzzle.currentRotation + 72) % 360;
        object.rotation.z = (puzzle.currentRotation * Math.PI) / 180;
        userData.currentRotation = puzzle.currentRotation;
        
        this.playNote(440);
        this.checkSpatialRotationSolved(puzzleIndex);
    }
    
    checkColorPatternSolved(puzzleIndex) {
        const puzzle = this.puzzlesSolved[puzzleIndex];
        
        const isSolved = puzzle.currentColors.every((color, index) => 
            color === puzzle.targetColors[index]
        );
        
        if (isSolved && !puzzle.solved) {
            puzzle.solved = true;
            this.playSuccessSound();
            this.createPuzzleSolvedEffect(puzzleIndex);
            this.updatePuzzleIndicators();
            this.checkAllPuzzlesSolved();
            this.updateAchievement('patternMaster', 1);
        }
    }
    
    checkShapeAssemblySolved(puzzleIndex) {
        const puzzle = this.puzzlesSolved[puzzleIndex];
        const allPlaced = Object.values(puzzle.shapesPlaced).every(placed => placed);
        
        if (allPlaced && !puzzle.solved) {
            puzzle.solved = true;
            this.playSuccessSound();
            this.createPuzzleSolvedEffect(puzzleIndex);
            this.updatePuzzleIndicators();
            this.checkAllPuzzlesSolved();
            this.updateAchievement('shapeWizard', 1);
        }
    }
    
    checkSpatialRotationSolved(puzzleIndex) {
        const puzzle = this.puzzlesSolved[puzzleIndex];
        
        if (puzzle.currentRotation === puzzle.targetRotation && !puzzle.solved) {
            puzzle.solved = true;
            this.playSuccessSound();
            this.createPuzzleSolvedEffect(puzzleIndex);
            this.updatePuzzleIndicators();
            this.checkAllPuzzlesSolved();
            this.updateAchievement('spatialGenius', 1);
        }
    }
    
    checkAllPuzzlesSolved() {
        const solvedCount = Object.values(this.puzzlesSolved).filter(puzzle => puzzle.solved).length;
        const totalCount = Object.keys(this.puzzlesSolved).length;
        
        if (solvedCount >= totalCount && totalCount > 0) {
            setTimeout(() => this.triggerVictory(), 1000);
        }
    }
    
    createPuzzleSolvedEffect(puzzleIndex) {
        const puzzlePosition = this.getPuzzlePosition(puzzleIndex);
        this.createParticleExplosion(new THREE.Vector3(puzzlePosition.x, puzzlePosition.y, puzzlePosition.z + 50));
    }
    
    createParticleExplosion(position) {
        const particleCount = 30;
        const particles = [];
        
        for (let i = 0; i < particleCount; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(2, 8, 8),
                new THREE.MeshBasicMaterial({
                    color: new THREE.Color(this.gameData.themes[this.currentTheme].color),
                    transparent: true,
                    opacity: 1
                })
            );
            
            particle.position.copy(position);
            particle.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            );
            
            particles.push(particle);
            this.scene.add(particle);
        }
        
        this.animateParticles(particles);
    }
    
    animateParticles(particles) {
        const animate = () => {
            particles.forEach((particle, index) => {
                if (!particle.parent) return; // Skip if already removed
                
                particle.position.add(particle.velocity);
                particle.material.opacity -= 0.02;
                particle.velocity.multiplyScalar(0.98);
                
                if (particle.material.opacity <= 0) {
                    this.scene.remove(particle);
                    particles.splice(index, 1);
                }
            });
            
            if (particles.length > 0) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    triggerVictory() {
        this.gameState = 'victory';
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const completionTime = Math.floor((Date.now() - this.startTime) / 1000);
        const crystalsEarned = this.calculateCrystalsEarned(completionTime);
        
        this.gameData.crystalShards += crystalsEarned;
        this.gameData.themes[this.currentTheme].completed++;
        
        // Show victory screen
        const victoryScreen = document.getElementById('victory-celebration');
        if (victoryScreen) {
            victoryScreen.classList.remove('hidden');
            const crystalsElement = document.getElementById('crystals-earned');
            if (crystalsElement) {
                crystalsElement.textContent = `+${crystalsEarned}`;
            }
        }
        
        // Create victory particles
        this.createVictoryParticleShow();
        
        // Play victory music
        this.playVictoryMusic();
        
        // Check for achievements
        this.checkVictoryAchievements(completionTime);
        
        // Unlock next theme if needed
        this.checkThemeUnlocks();
        
        // Save progress
        this.saveProgress();
    }
    
    calculateCrystalsEarned(completionTime) {
        let baseReward = 5;
        
        // Time bonus
        if (completionTime < 60) baseReward += 5; // Speed bonus
        if (completionTime < 30) baseReward += 5; // Lightning bonus
        
        // Difficulty bonus
        const difficulty = this.currentBoxIndex + 1;
        baseReward += difficulty * 2;
        
        return baseReward;
    }
    
    checkVictoryAchievements(completionTime) {
        // First box achievement
        if (this.gameData.themes[this.currentTheme].completed === 1) {
            this.unlockAchievement('firstBox');
        }
        
        // Speed achievement
        if (completionTime < 60) {
            this.unlockAchievement('speedSolver');
        }
        
        // Crystal collector
        this.updateAchievement('collector', this.gameData.crystalShards);
        
        // Explorer achievement
        const unlockedThemes = Object.values(this.gameData.themes).filter(theme => theme.unlocked).length;
        if (unlockedThemes >= 5) {
            this.unlockAchievement('explorer');
        }
    }
    
    checkThemeUnlocks() {
        const currentTheme = this.gameData.themes[this.currentTheme];
        
        // Unlock next theme if current theme is completed
        if (currentTheme.completed >= currentTheme.boxes) {
            const themeIds = Object.keys(this.gameData.themes);
            const currentIndex = themeIds.indexOf(this.currentTheme);
            
            if (currentIndex < themeIds.length - 1) {
                const nextThemeId = themeIds[currentIndex + 1];
                this.gameData.themes[nextThemeId].unlocked = true;
            }
        }
    }
    
    createVictoryParticleShow() {
        const container = document.querySelector('.celebration-particles');
        if (!container) return;
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'game-particle particle-sparkle';
                
                const colors = this.gameData.colorPalettes[this.currentTheme];
                particle.style.background = colors[Math.floor(Math.random() * colors.length)];
                
                const angle = Math.random() * Math.PI * 2;
                const distance = Math.random() * 200 + 50;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;
                
                particle.style.left = '50%';
                particle.style.top = '50%';
                particle.style.setProperty('--dx', dx + 'px');
                particle.style.setProperty('--dy', dy + 'px');
                
                container.appendChild(particle);
                
                setTimeout(() => particle.remove(), 2000);
            }, i * 50);
        }
    }
    
    // Audio system
    setupAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Auto-enable audio if possible
            if (this.audioContext.state === 'running') {
                this.audioEnabled = true;
            } else {
                // Show enable button for mobile
                document.getElementById('audio-unlock').classList.remove('hidden');
            }
        } catch (e) {
            console.log('Audio not supported');
            this.audioEnabled = false;
        }
        
        // Enable audio on any user interaction
        const enableAudioOnInteraction = () => {
            this.enableAudio();
            document.removeEventListener('click', enableAudioOnInteraction);
            document.removeEventListener('touchstart', enableAudioOnInteraction);
        };
        
        document.addEventListener('click', enableAudioOnInteraction);
        document.addEventListener('touchstart', enableAudioOnInteraction);
    }
    
    enableAudio() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            this.audioContext.resume().then(() => {
                this.audioEnabled = true;
                document.getElementById('audio-unlock').classList.add('hidden');
            });
        } else {
            this.audioEnabled = true;
            document.getElementById('audio-unlock').classList.add('hidden');
        }
    }
    
    playNote(frequency, duration = 0.2, type = 'sine') {
        if (!this.audioEnabled || !this.audioContext || this.audioContext.state !== 'running') return;
        
        try {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = this.instrumentTypes[this.currentTheme] || type;
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(this.masterVolume * 0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + duration);
        } catch (e) {
            console.log('Audio playback failed:', e);
        }
    }
    
    playSuccessSound() {
        const notes = [261.63, 329.63, 392.00, 523.25]; // C-E-G-C major chord
        notes.forEach((freq, index) => {
            setTimeout(() => this.playNote(freq, 0.5), index * 100);
        });
    }
    
    playVictoryMusic() {
        const melody = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50];
        melody.forEach((freq, index) => {
            setTimeout(() => this.playNote(freq, 0.4), index * 200);
        });
    }
    
    // Achievement system
    updateAchievement(achievementId, progress) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) return;
        
        achievement.progress = Math.min(achievement.progress + progress, achievement.maxProgress);
        
        if (achievement.progress >= achievement.maxProgress) {
            this.unlockAchievement(achievementId);
        }
    }
    
    unlockAchievement(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement || achievement.unlocked) return;
        
        achievement.unlocked = true;
        this.unlockedAchievements.add(achievementId);
        
        // Show achievement notification
        this.showAchievementNotification(achievement);
        
        // Audio feedback
        this.playNote(659.25, 0.3); // E note
        setTimeout(() => this.playNote(783.99, 0.5), 200); // G note
    }
    
    showAchievementNotification(achievement) {
        const notification = document.getElementById('achievement-notification');
        if (!notification) return;
        
        const achievementName = notification.querySelector('.achievement-name');
        if (achievementName) {
            achievementName.textContent = achievement.name;
            notification.classList.remove('hidden');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 4000);
        }
    }
    
    // Utility functions
    triggerHapticFeedback(intensity = 1) {
        if (this.supportsHaptic && this.gameData.settings.hapticFeedback && this.isMobile) {
            navigator.vibrate(intensity * 50);
        }
    }
    
    createInteractionParticles(position) {
        if (!this.scene) return;
        
        // Create small particle effect on interaction
        for (let i = 0; i < 5; i++) {
            const particle = new THREE.Mesh(
                new THREE.SphereGeometry(1, 6, 6),
                new THREE.MeshBasicMaterial({
                    color: 0xffffff,
                    transparent: true,
                    opacity: 1
                })
            );
            
            particle.position.copy(position);
            particle.position.add(new THREE.Vector3(
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20
            ));
            
            this.scene.add(particle);
            
            // Remove after short time
            setTimeout(() => {
                if (particle.parent) {
                    this.scene.remove(particle);
                }
            }, 500);
        }
    }
    
    onWindowResize() {
        if (this.camera && this.renderer) {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    // Touch event handlers
    onTouchStart(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.onMouseDown({
                clientX: touch.clientX,
                clientY: touch.clientY,
                preventDefault: () => {}
            });
        }
    }
    
    onTouchMove(event) {
        event.preventDefault();
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            this.onMouseMove({
                clientX: touch.clientX,
                clientY: touch.clientY
            });
        }
    }
    
    onTouchEnd(event) {
        event.preventDefault();
        this.onMouseUp(event);
    }
    
    onMouseWheel(event) {
        event.preventDefault();
        
        if (!this.camera) return;
        
        const distance = this.camera.position.distanceTo(new THREE.Vector3(0, 0, 0));
        const factor = event.deltaY * 0.001;
        const newDistance = Math.max(300, Math.min(800, distance + distance * factor));
        
        this.camera.position.normalize().multiplyScalar(newDistance);
    }
    
    // Modal management
    showAchievements() {
        const modal = document.getElementById('achievements-panel');
        if (!modal) return;
        
        const grid = modal.querySelector('.achievements-grid');
        if (!grid) return;
        
        // Clear existing content
        grid.innerHTML = '';
        
        // Populate achievements
        this.achievements.forEach((achievement, id) => {
            const card = document.createElement('div');
            card.className = `achievement-card ${achievement.unlocked ? 'unlocked' : 'locked'}`;
            
            card.innerHTML = `
                <div class="achievement-rarity rarity-${achievement.rarity}"></div>
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-name">${achievement.name}</div>
                <div class="achievement-description">${achievement.description}</div>
                ${!achievement.unlocked && achievement.maxProgress > 1 ? 
                    `<div class="achievement-progress">${achievement.progress}/${achievement.maxProgress}</div>` : 
                    ''}
            `;
            
            grid.appendChild(card);
        });
        
        modal.classList.remove('hidden');
    }
    
    showSettings() {
        const modal = document.getElementById('settings-panel');
        if (!modal) return;
        
        // Update setting values
        const volumeSlider = document.getElementById('volume-slider');
        const contrastToggle = document.getElementById('contrast-toggle');
        const hapticToggle = document.getElementById('haptic-toggle');
        
        if (volumeSlider) volumeSlider.value = this.gameData.settings.volume;
        if (contrastToggle) contrastToggle.checked = this.gameData.settings.highContrast;
        if (hapticToggle) hapticToggle.checked = this.gameData.settings.hapticFeedback;
        
        modal.classList.remove('hidden');
    }
    
    closeModal(modal) {
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    toggleHighContrast(enabled) {
        if (enabled) {
            document.body.classList.add('high-contrast');
        } else {
            document.body.classList.remove('high-contrast');
        }
    }
    
    // Game flow controls
    continueToNextBox() {
        const victoryScreen = document.getElementById('victory-celebration');
        if (victoryScreen) {
            victoryScreen.classList.add('hidden');
        }
        
        if (this.currentBoxIndex < this.gameData.themes[this.currentTheme].boxes - 1) {
            this.currentBoxIndex++;
            this.showBoxPreview();
        } else {
            // All boxes in theme completed, return to main menu
            this.backToMainMenu();
        }
    }
    
    replayCurrentBox() {
        const victoryScreen = document.getElementById('victory-celebration');
        if (victoryScreen) {
            victoryScreen.classList.add('hidden');
        }
        this.showBoxPreview();
    }
    
    resetCurrentPuzzle() {
        this.resetPuzzleProgress();
        this.startTime = Date.now();
    }
    
    pauseGame() {
        // Implementation for game pause
        this.gameState = this.gameState === 'paused' ? 'playing' : 'paused';
    }
    
    toggleAudio() {
        this.audioEnabled = !this.audioEnabled;
        const btn = document.getElementById('toggle-audio');
        if (btn) {
            btn.textContent = this.audioEnabled ? '🔊' : '🔇';
        }
    }
    
    showHint() {
        const hintsPanel = document.getElementById('hints-panel');
        const hintText = document.getElementById('hint-text');
        
        if (!hintsPanel || !hintText) return;
        
        // Generate context-aware hint
        const activePuzzles = Object.values(this.puzzlesSolved).filter(p => !p.solved);
        if (activePuzzles.length > 0) {
            const hintMessages = [
                "Look for glowing elements - they often hold the key!",
                "Try different combinations - patience is your ally!",
                "Each puzzle has a unique pattern - observe carefully!",
                "Colors and shapes follow logical sequences!",
                "Sometimes the solution is simpler than it appears!"
            ];
            
            hintText.textContent = hintMessages[Math.floor(Math.random() * hintMessages.length)];
        } else {
            hintText.textContent = "All puzzles solved! Great work!";
        }
        
        hintsPanel.classList.remove('hidden');
        
        setTimeout(() => {
            hintsPanel.classList.add('hidden');
        }, 3000);
    }
    
    // Save/Load system
    saveProgress() {
        try {
            const saveData = {
                gameData: this.gameData,
                achievements: Array.from(this.achievements.entries()),
                unlockedAchievements: Array.from(this.unlockedAchievements)
            };
            
            localStorage.setItem('mindVaultProgress', JSON.stringify(saveData));
        } catch (e) {
            console.log('Failed to save progress:', e);
        }
    }
    
    loadProgress() {
        try {
            const saveData = localStorage.getItem('mindVaultProgress');
            if (saveData) {
                const parsed = JSON.parse(saveData);
                
                this.gameData = { ...this.gameData, ...parsed.gameData };
                
                if (parsed.achievements) {
                    this.achievements = new Map(parsed.achievements);
                }
                
                if (parsed.unlockedAchievements) {
                    this.unlockedAchievements = new Set(parsed.unlockedAchievements);
                }
            }
        } catch (e) {
            console.log('Failed to load progress:', e);
        }
    }
    
    loadGameData() {
        // Load from provided JSON data or return empty object
        return window.gameDataJSON || {};
    }
    
    // Main animation loop
    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Performance monitoring
        this.frameCount++;
        const now = Date.now();
        if (now - this.lastFPSCheck >= 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSCheck = now;
        }
        
        // Update particle systems
        this.updateParticleSystems();
        
        // Render scene if in playing state
        if (this.scene && this.camera && this.renderer && this.gameState === 'playing') {
            // Gentle box rotation when not interacting
            if (!this.isDragging && this.puzzleBox) {
                this.puzzleBox.rotation.y += 0.002;
            }
            
            this.renderer.render(this.scene, this.camera);
        }
    }
    
    updateParticleSystems() {
        // Update any active particle systems
        this.activeParticles.forEach((particle, index) => {
            if (particle.update && particle.update()) {
                this.activeParticles.splice(index, 1);
            }
        });
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mindVaultGame = new UltimateMindVault();
});

// Handle window focus/blur for performance
window.addEventListener('blur', () => {
    if (window.mindVaultGame) {
        window.mindVaultGame.gameState = 'paused';
    }
});

window.addEventListener('focus', () => {
    if (window.mindVaultGame && window.mindVaultGame.gameState === 'paused') {
        window.mindVaultGame.gameState = 'playing';
    }
});