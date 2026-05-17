// ============================================================
// 🔫 HEHE FPS v3.2 - 3D First Person Shooter Game Engine
// Features: 6 Weapons, 4 Maps (Giant Forest), Humanoid Enemies,
//           Boss Fights, Procedural BGM, Native Landscape Lock
// Built with Three.js | Mobile + Desktop Support
// v3.2 Hotfix: Removed CSS transform rotation, using Android
//   native landscape lock via AndroidManifest + Capacitor config
// ============================================================

class HeheFPS {
    constructor() {
        this.scene = null; this.camera = null; this.renderer = null;
        this.clock = new THREE.Clock();

        // Game State
        this.isPlaying = false; this.isPaused = false; this.isDead = false;
        this.score = 0; this.kills = 0; this.wave = 1;
        this.enemiesRemaining = 0; this.enemiesSpawned = 0;
        this.enemiesPerWave = 5; this.waveDelay = false;
        this.bestScore = parseInt(localStorage.getItem('heheFPSBest')) || 0;

        // Player
        this.health = 100; this.maxHealth = 100;
        this.moveSpeed = 8; this.sprintSpeed = 14;
        this.isSprinting = false; this.velocity = new THREE.Vector3();
        this.moveForward = false; this.moveBackward = false;
        this.moveLeft = false; this.moveRight = false;

        // Camera
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitchObject = new THREE.Object3D();
        this.yawObject = new THREE.Object3D();
        this.mouseSensitivity = 0.002;
        this.isPointerLocked = false;

        // ========= 6 WEAPONS =========
        this.weapons = [
            { name:'PISTOL',   damage:25, fireRate:300,  ammo:12, maxAmmo:12, reloadTime:1500, spread:0.02, pellets:1, auto:false, icon:'🔫' },
            { name:'RIFLE',    damage:15, fireRate:100,  ammo:30, maxAmmo:30, reloadTime:2000, spread:0.04, pellets:1, auto:true,  icon:'🔫' },
            { name:'SHOTGUN',  damage:12, fireRate:800,  ammo:6,  maxAmmo:6,  reloadTime:2500, spread:0.12, pellets:8, auto:false, icon:'🔫' },
            { name:'SNIPER',   damage:100,fireRate:1200, ammo:5,  maxAmmo:5,  reloadTime:2500, spread:0.005,pellets:1, auto:false, icon:'🎯' },
            { name:'RPG',      damage:200,fireRate:2000, ammo:2,  maxAmmo:2,  reloadTime:3000, spread:0.03, pellets:1, auto:false, icon:'💥', explosive:true, explosionRadius:8 },
            { name:'MINIGUN',  damage:8,  fireRate:50,   ammo:100,maxAmmo:100,reloadTime:4000, spread:0.08, pellets:1, auto:true,  icon:'⚡' }
        ];
        this.currentWeapon = 0;
        this.lastFireTime = 0; this.isReloading = false;
        this.reloadStartTime = 0; this.weaponMesh = null;
        this.weaponRecoil = 0; this.mouseDown = false;

        // ========= 3 MAPS =========
        this.selectedMap = 'arena';
        this.maps = {
            arena: {
                name: 'Arena', size: 50, fogColor: 0x111122, groundColor: 0x222233,
                wallColor: 0x333355, neonColor: 0xff4444, skyColor: 0x111122,
                ambientIntensity: 0.6, dirIntensity: 0.8
            },
            warehouse: {
                name: 'Warehouse', size: 40, fogColor: 0x1a1510, groundColor: 0x332211,
                wallColor: 0x443322, neonColor: 0xffaa00, skyColor: 0x1a1510,
                ambientIntensity: 0.4, dirIntensity: 0.6
            },
            ruins: {
                name: 'Ruins', size: 60, fogColor: 0x0a1a0a, groundColor: 0x223322,
                wallColor: 0x445544, neonColor: 0x44ff44, skyColor: 0x0a1a0a,
                ambientIntensity: 0.3, dirIntensity: 1.0
            },
            forest: {
                name: 'Forest Ruins', size: 150, fogColor: 0x0a1a0a, groundColor: 0x1a2a1a,
                wallColor: 0x2a3a2a, neonColor: 0x66ff66, skyColor: 0x081208,
                ambientIntensity: 0.35, dirIntensity: 0.7
            }
        };

        // Enemies
        this.enemies = [];
        this.enemyTypes = {
            basic:  { health:50,  speed:3,   damage:10, color:0xff4444, size:1,   score:100 },
            fast:   { health:30,  speed:6,   damage:8,  color:0x44ff44, size:0.8, score:150 },
            tank:   { health:150, speed:1.5, damage:20, color:0x4444ff, size:1.5, score:250 },
            boss:   { health:800, speed:2,   damage:25, color:0xff8800, size:2.5, score:2000 }
        };

        // ========= BOSS SYSTEM =========
        this.currentBoss = null;
        this.bossPhase = 0;
        this.bossAttackTimer = 0;
        this.bossProjectiles = [];

        // World
        this.arenaSize = 50;
        this.walls = []; this.obstacles = []; this.pickups = [];

        // Effects
        this.particles = [];
        this.muzzleFlash = null;
        this.explosions = [];

        // ========= BGM SYSTEM =========
        this.bgmEnabled = true;
        this.bgmPlaying = false;
        this.bgmNodes = null;
        this.bgmInterval = null;

        // Mobile - Better detection for Capacitor APK
        this.isMobile = /Android|iPhone|iPad|iPod|webOS|mobile/i.test(navigator.userAgent) || 
            window.innerWidth <= 768 || 
            ('ontouchstart' in window) || 
            (navigator.maxTouchPoints > 0);
        this.joystickActive = false; this.joystickDir = { x:0, y:0 };
        this.touchLookActive = false;
        this.lastTouchX = 0; this.lastTouchY = 0; this.mobileShoot = false;

        // Raycaster
        this.raycaster = new THREE.Raycaster();

        // Audio
        this.audioCtx = null;

        this.init();
    }

    init() {
        this.showLoading();
        console.log('[HeheFPS] Initializing... Mobile:', this.isMobile);

        // ===== NATIVE LANDSCAPE LOCK for Mobile (v3.2 Hotfix) =====
        // Only use Screen Orientation API - NO CSS transform fallback
        // Android landscape is handled natively via AndroidManifest.xml
        this.lockOrientationNative();

        // Check Three.js loaded
        if (typeof THREE === 'undefined') {
            document.getElementById('load-text').textContent = 'Error: 3D Engine failed to load. Please restart.';
            document.getElementById('load-bar').style.background = '#ff4444';
            console.error('[HeheFPS] THREE.js not loaded!');
            return;
        }
        console.log('[HeheFPS] THREE.js loaded OK');

        try {
            this.initThree();
            this.initWorld();
            this.initPlayer();
            this.initWeapons();
            this.initEvents();
            this.initMobileControls();
            this.initMapSelector();
        } catch (e) {
            document.getElementById('load-text').textContent = 'Error: ' + e.message;
            document.getElementById('load-bar').style.background = '#ff4444';
            console.error('Game init error:', e);
            return;
        }

        // Fast loading - complete in ~1 second
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += 15 + Math.random() * 10;
            if (progress >= 100) { progress = 100; clearInterval(loadInterval);
                setTimeout(() => {
                    document.getElementById('loading-screen').classList.add('hidden');
                    document.getElementById('start-screen').classList.remove('hidden');
                }, 300);
            }
            document.getElementById('load-bar').style.width = progress + '%';
            document.getElementById('load-text').textContent = `Loading ${Math.floor(progress)}%`;
        }, 100);

        this.animate();
    }

    showLoading() { document.getElementById('loading-screen').classList.remove('hidden'); }

    // ==================== NATIVE LANDSCAPE LOCK (v3.2 Hotfix) ====================
    // v3.2: Removed forceLandscape() and applyCSSTransform() which caused
    // CSS transform:rotate(90deg) double-rotation on Android.
    // Now only uses the Screen Orientation API (no CSS fallback).
    // Android native landscape is enforced via:
    //   - AndroidManifest.xml: android:screenOrientation="landscape"
    //   - capacitor.config.json: android.orientation = "landscape"
    lockOrientationNative() {
        if (!this.isMobile) return;

        // Try native Screen Orientation API (works in Capacitor WebView)
        const tryLock = () => {
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape').then(() => {
                    console.log('[HeheFPS] Landscape locked via Screen Orientation API');
                }).catch(err => {
                    // Silently fail - AndroidManifest handles this natively in APK
                    console.log('[HeheFPS] Screen orientation lock not available:', err.message);
                });
            }
        };

        // Try on first user interaction (browsers require user gesture)
        const onFirstInteraction = () => {
            tryLock();
            document.removeEventListener('touchstart', onFirstInteraction);
            document.removeEventListener('click', onFirstInteraction);
        };
        document.addEventListener('touchstart', onFirstInteraction, { once: true });
        document.addEventListener('click', onFirstInteraction, { once: true });

        // Also try immediately (works in some Capacitor WebViews)
        tryLock();
    }

    // ==================== THREE.JS INIT ====================
    initThree() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        this.scene.fog = new THREE.Fog(0x111122, 30, 80);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.pitchObject.add(this.camera);
        this.yawObject.add(this.pitchObject);
        this.yawObject.position.set(0, 1.7, 0);
        this.scene.add(this.yawObject);

        this.renderer = new THREE.WebGLRenderer({ antialias: !this.isMobile });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, this.isMobile ? 1.5 : 2));
        this.renderer.shadowMap.enabled = !this.isMobile;
        if (!this.isMobile) this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-canvas-container').appendChild(this.renderer.domElement);

        window.addEventListener('resize', () => {
            // v3.2 Hotfix: Clean resize handler - no CSS transform involved
            // Canvas dimensions follow actual window size
            const w = window.innerWidth;
            const h = window.innerHeight;
            this.camera.aspect = w / h;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(w, h);
            console.log('[HeheFPS] Resize:', w, 'x', h);
        });

        // Also handle orientation change for smoother transitions on mobile
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                const w = window.innerWidth;
                const h = window.innerHeight;
                this.camera.aspect = w / h;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(w, h);
                console.log('[HeheFPS] Orientation changed, resize:', w, 'x', h);
            }, 100);
        });
    }

    // ==================== MAP SYSTEM ====================
    initMapSelector() {
        document.querySelectorAll('.map-card').forEach(card => {
            card.addEventListener('click', () => {
                document.querySelectorAll('.map-card').forEach(c => c.classList.remove('active'));
                card.classList.add('active');
                this.selectedMap = card.dataset.map;
            });
        });
    }

    loadMap(mapKey) {
        const map = this.maps[mapKey];
        this.arenaSize = map.size;

        // Update scene atmosphere
        this.scene.background = new THREE.Color(map.skyColor);
        this.scene.fog = new THREE.Fog(map.fogColor, map.size * 0.3, Math.min(map.size * 2, 300));

        // Ground
        const groundGeo = new THREE.PlaneGeometry(map.size * 2, map.size * 2);
        const groundMat = new THREE.MeshStandardMaterial({ color: map.groundColor, roughness: 0.9, metalness: 0.1 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
        this.scene.add(ground);

        const gridHelper = new THREE.GridHelper(map.size * 2, 40, map.fogColor, map.groundColor);
        this.scene.add(gridHelper);

        // Walls
        this.createWalls(map);
        // Obstacles (unique per map)
        if (mapKey === 'arena') this.createArenaObstacles(map);
        else if (mapKey === 'warehouse') this.createWarehouseObstacles(map);
        else if (mapKey === 'ruins') this.createRuinsObstacles(map);
        else if (mapKey === 'forest') this.createForestObstacles(map);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x334466, map.ambientIntensity);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffeedd, map.dirIntensity);
        dirLight.position.set(20, 30, 10); dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024; dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5; dirLight.shadow.camera.far = 100;
        dirLight.shadow.camera.left = -50; dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50; dirLight.shadow.camera.bottom = -50;
        this.scene.add(dirLight);

        // Corner point lights
        const half = map.size;
        [[-half,5,-half],[half,5,half],[-half,5,half],[half,5,-half]].forEach(pos => {
            const light = new THREE.PointLight(map.neonColor, 0.5, 30);
            light.position.set(...pos); this.scene.add(light);
        });

        // Center light
        const centerLight = new THREE.PointLight(map.neonColor, 0.8, 40);
        centerLight.position.set(0, 8, 0); this.scene.add(centerLight);
    }

    clearWorld() {
        // Remove everything except camera rig
        const toRemove = [];
        this.scene.traverse(child => {
            if (child !== this.scene && !(child instanceof THREE.Object3D && child.children.includes(this.camera))) {
                if (child !== this.yawObject && child !== this.pitchObject && child !== this.camera) {
                    toRemove.push(child);
                }
            }
        });
        toRemove.forEach(obj => this.scene.remove(obj));
        this.walls = []; this.obstacles = []; this.pickups = [];
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];
        this.explosions.forEach(e => this.scene.remove(e.mesh));
        this.explosions = [];
        this.bossProjectiles.forEach(p => this.scene.remove(p.mesh));
        this.bossProjectiles = [];
    }

    createWalls(map) {
        const wallMat = new THREE.MeshStandardMaterial({ color: map.wallColor, roughness: 0.7, metalness: 0.3 });
        const half = map.size; const wallHeight = 6;

        const wallConfigs = [
            { w:half*2, h:wallHeight, d:1, x:0, y:wallHeight/2, z:-half },
            { w:half*2, h:wallHeight, d:1, x:0, y:wallHeight/2, z:half },
            { w:1, h:wallHeight, d:half*2, x:-half, y:wallHeight/2, z:0 },
            { w:1, h:wallHeight, d:half*2, x:half, y:wallHeight/2, z:0 },
        ];

        wallConfigs.forEach(cfg => {
            const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.set(cfg.x, cfg.y, cfg.z);
            mesh.castShadow = true; mesh.receiveShadow = true;
            this.scene.add(mesh); this.walls.push(mesh);
        });

        // Neon strips
        const neonMat = new THREE.MeshBasicMaterial({ color: map.neonColor });
        wallConfigs.forEach(cfg => {
            const stripGeo = new THREE.BoxGeometry(cfg.w*0.98, 0.2, cfg.d*0.98);
            const strip = new THREE.Mesh(stripGeo, neonMat);
            strip.position.set(cfg.x, wallHeight - 0.5, cfg.z);
            this.scene.add(strip);
        });
    }

    createArenaObstacles(map) {
        const crateMat = new THREE.MeshStandardMaterial({ color:0x554433, roughness:0.8, metalness:0.2 });
        const metalMat = new THREE.MeshStandardMaterial({ color:0x445566, roughness:0.3, metalness:0.8 });

        const positions = [
            [-10,1,-10],[8,1,-15],[-15,1,8],[12,1,12],[-5,1,5],[5,1,-5],
            [-18,1,-18],[18,1,18],[0,1,-20],[-20,1,0],[15,1,-8],[-8,1,15],
            [22,1,5],[-5,1,-25],[25,1,-20],[-25,1,20]
        ];

        positions.forEach(pos => {
            const size = 1 + Math.random();
            const geo = new THREE.BoxGeometry(size, size, size);
            const mesh = new THREE.Mesh(geo, Math.random()>0.5 ? crateMat : metalMat);
            mesh.position.set(...pos); mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });

        // Columns
        const colMat = new THREE.MeshStandardMaterial({ color:0x556677, roughness:0.5, metalness:0.5 });
        [[-12,0,-12],[12,0,-12],[-12,0,12],[12,0,12]].forEach(pos => {
            const geo = new THREE.CylinderGeometry(0.8, 0.8, 5, 8);
            const mesh = new THREE.Mesh(geo, colMat);
            mesh.position.set(pos[0], 2.5, pos[2]); mesh.castShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });
    }

    createWarehouseObstacles(map) {
        const containerMat = new THREE.MeshStandardMaterial({ color:0x884422, roughness:0.7, metalness:0.3 });
        const shelfMat = new THREE.MeshStandardMaterial({ color:0x666655, roughness:0.5, metalness:0.5 });

        // Containers (large boxes)
        const containerPositions = [
            [-12,2,-12],[12,2,-12],[-12,2,12],[12,2,12],
            [0,2,-15],[-15,2,0],[15,2,0],[0,2,15],
            [-8,1.5,-5],[8,1.5,5],[5,1.5,-8],[-5,1.5,8]
        ];

        containerPositions.forEach((pos,i) => {
            const w = 2 + Math.random()*2, h = 1.5+Math.random()*2, d = 2+Math.random()*2;
            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, i%2===0 ? containerMat : shelfMat);
            mesh.position.set(pos[0], h/2, pos[2]); mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });

        // Shelving rows
        for (let x = -12; x <= 12; x += 8) {
            for (let z = -8; z <= 8; z += 16) {
                const geo = new THREE.BoxGeometry(0.3, 4, 6);
                const mesh = new THREE.Mesh(geo, shelfMat);
                mesh.position.set(x, 2, z); mesh.castShadow = true;
                mesh.userData.isObstacle = true;
                this.scene.add(mesh); this.obstacles.push(mesh);
            }
        }

        // Barrels
        const barrelMat = new THREE.MeshStandardMaterial({ color:0x445544, roughness:0.6, metalness:0.4 });
        [[-5,0,-8],[7,0,3],[-3,0,12],[10,0,-10],[-10,0,5]].forEach(pos => {
            const geo = new THREE.CylinderGeometry(0.6, 0.6, 1.2, 8);
            const mesh = new THREE.Mesh(geo, barrelMat);
            mesh.position.set(pos[0], 0.6, pos[2]); mesh.castShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });
    }

    createRuinsObstacles(map) {
        const stoneMat = new THREE.MeshStandardMaterial({ color:0x665544, roughness:0.9, metalness:0.1 });
        const pillarMat = new THREE.MeshStandardMaterial({ color:0x776655, roughness:0.7, metalness:0.2 });

        // Broken walls
        const wallPositions = [
            { x:-15, z:0, w:8, h:4, d:0.5, ry:0 },
            { x:10, z:-10, w:6, h:3, d:0.5, ry:Math.PI/4 },
            { x:0, z:15, w:10, h:5, d:0.5, ry:Math.PI/3 },
            { x:-8, z:-18, w:5, h:2.5, d:0.5, ry:Math.PI/6 },
            { x:20, z:5, w:7, h:3.5, d:0.5, ry:0 },
        ];

        wallPositions.forEach(cfg => {
            const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
            const mesh = new THREE.Mesh(geo, stoneMat);
            mesh.position.set(cfg.x, cfg.h/2, cfg.z); mesh.rotation.y = cfg.ry;
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });

        // Broken pillars
        const pillarPositions = [
            [-10,0,-10],[10,0,-10],[-10,0,10],[10,0,10],
            [0,0,-20],[0,0,20],[-20,0,0],[20,0,0],
            [-15,0,-20],[15,0,20],[-20,0,15],[20,0,-15]
        ];

        pillarPositions.forEach(pos => {
            const h = 2 + Math.random() * 4;
            const geo = new THREE.CylinderGeometry(0.6, 0.8, h, 8);
            const mesh = new THREE.Mesh(geo, pillarMat);
            mesh.position.set(pos[0], h/2, pos[2]); mesh.castShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        });

        // Rubble
        for (let i = 0; i < 20; i++) {
            const size = 0.3 + Math.random() * 0.8;
            const geo = new THREE.DodecahedronGeometry(size, 0);
            const mesh = new THREE.Mesh(geo, stoneMat);
            mesh.position.set((Math.random()-0.5)*map.size*1.5, size/2, (Math.random()-0.5)*map.size*1.5);
            mesh.rotation.set(Math.random(), Math.random(), Math.random());
            mesh.castShadow = true; mesh.userData.isObstacle = true;
            this.scene.add(mesh); this.obstacles.push(mesh);
        }

        // Archway
        const archGeo = new THREE.TorusGeometry(3, 0.5, 8, 16, Math.PI);
        const archMesh = new THREE.Mesh(archGeo, pillarMat);
        archMesh.position.set(0, 3, 0); archMesh.rotation.y = Math.PI/2;
        archMesh.castShadow = true;
        this.scene.add(archMesh);
    }

    // ==================== FOREST MAP (Giant Open World) ====================
    createForestObstacles(map) {
        const treeTrunkMat = new THREE.MeshStandardMaterial({ color: 0x4a3020, roughness: 0.9, metalness: 0.1 });
        const treeLeavesMat = new THREE.MeshStandardMaterial({ color: 0x1a5a1a, roughness: 0.8, metalness: 0.05, emissive: 0x0a2a0a, emissiveIntensity: 0.1 });
        const treeLeavesMat2 = new THREE.MeshStandardMaterial({ color: 0x2a6a2a, roughness: 0.8, metalness: 0.05 });
        const buildingMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.8, metalness: 0.2 });
        const roofMat = new THREE.MeshStandardMaterial({ color: 0x663322, roughness: 0.7, metalness: 0.3 });
        const wallMat2 = new THREE.MeshStandardMaterial({ color: 0x443322, roughness: 0.85, metalness: 0.15 });

        // ========= 3D TREES (100+ Procedural) =========
        const treeCount = 120;
        const occupiedPositions = []; // Track positions to avoid overlap

        for (let i = 0; i < treeCount; i++) {
            let x, z, tooClose;
            // Find a position that doesn't overlap with existing objects
            let attempts = 0;
            do {
                x = (Math.random() - 0.5) * map.size * 1.7;
                z = (Math.random() - 0.5) * map.size * 1.7;
                tooClose = false;
                for (const pos of occupiedPositions) {
                    if (Math.sqrt((x - pos.x) ** 2 + (z - pos.z) ** 2) < 5) {
                        tooClose = true; break;
                    }
                }
                attempts++;
            } while (tooClose && attempts < 20);

            occupiedPositions.push({ x, z });

            const treeGroup = new THREE.Group();

            // Trunk (CylinderGeometry)
            const trunkHeight = 3 + Math.random() * 4;
            const trunkRadius = 0.2 + Math.random() * 0.3;
            const trunkGeo = new THREE.CylinderGeometry(
                Math.max(0.1, trunkRadius * 0.6), Math.max(0.1, trunkRadius), trunkHeight, 6
            );
            const trunk = new THREE.Mesh(trunkGeo, treeTrunkMat);
            trunk.position.y = trunkHeight / 2;
            trunk.castShadow = true;
            treeGroup.add(trunk);

            // Leaves (ConeGeometry - 2-3 layers for fullness)
            const leavesMat = Math.random() > 0.5 ? treeLeavesMat : treeLeavesMat2;
            const layers = 2 + Math.floor(Math.random() * 2);
            for (let l = 0; l < layers; l++) {
                const leafRadius = (2.5 - l * 0.5) * (0.7 + Math.random() * 0.5);
                const leafHeight = 2.5 - l * 0.3;
                const leafGeo = new THREE.ConeGeometry(Math.max(0.5, leafRadius), Math.max(0.5, leafHeight), 7);
                const leaf = new THREE.Mesh(leafGeo, leavesMat);
                leaf.position.y = trunkHeight + l * 1.2;
                leaf.castShadow = true;
                treeGroup.add(leaf);
            }

            treeGroup.position.set(x, 0, z);
            this.scene.add(treeGroup);

            // Add trunk as obstacle with collision radius
            const collisionObs = new THREE.Object3D();
            collisionObs.position.set(x, trunkHeight / 2, z);
            collisionObs.userData = { isObstacle: true, collisionRadius: Math.max(1.0, trunkRadius * 3) };
            this.obstacles.push(collisionObs);
        }

        // ========= 3D BUILDINGS (Simple Box-based) =========
        const buildingConfigs = [
            { x: -50, z: -50, w: 10, h: 8, d: 8, roofH: 3 },
            { x: 40, z: -60, w: 8, h: 6, d: 12, roofH: 2.5 },
            { x: -60, z: 40, w: 12, h: 7, d: 10, roofH: 3 },
            { x: 55, z: 50, w: 9, h: 10, d: 9, roofH: 3.5 },
            { x: 0, z: -80, w: 14, h: 5, d: 8, roofH: 2 },
            { x: -80, z: 0, w: 7, h: 6, d: 7, roofH: 2 },
            { x: 80, z: -20, w: 10, h: 9, d: 10, roofH: 3 },
            { x: -30, z: 80, w: 8, h: 5, d: 6, roofH: 2 },
            { x: 30, z: 70, w: 6, h: 12, d: 6, roofH: 2 },
            { x: -90, z: -70, w: 10, h: 6, d: 10, roofH: 2.5 },
            { x: 90, z: 70, w: 8, h: 7, d: 12, roofH: 2.5 },
            { x: -20, z: -40, w: 6, h: 4, d: 6, roofH: 1.5 },
            { x: 60, z: -10, w: 5, h: 8, d: 5, roofH: 2 },
            { x: -70, z: 60, w: 11, h: 5, d: 7, roofH: 2 },
            { x: 10, z: 50, w: 7, h: 6, d: 9, roofH: 2.5 },
        ];

        buildingConfigs.forEach(cfg => {
            const buildingGroup = new THREE.Group();

            // Main body
            const bodyGeo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
            const body = new THREE.Mesh(bodyGeo, buildingMat);
            body.position.y = cfg.h / 2;
            body.castShadow = true; body.receiveShadow = true;
            buildingGroup.add(body);

            // Roof (pyramid-like using ConeGeometry or flat top)
            if (Math.random() > 0.3) {
                // Pointed roof
                const roofGeo = new THREE.ConeGeometry(Math.max(0.5, Math.max(cfg.w, cfg.d) * 0.7), cfg.roofH, 4);
                const roof = new THREE.Mesh(roofGeo, roofMat);
                roof.position.y = cfg.h + cfg.roofH / 2;
                roof.rotation.y = Math.PI / 4;
                roof.castShadow = true;
                buildingGroup.add(roof);
            } else {
                // Flat roof with border
                const flatRoofGeo = new THREE.BoxGeometry(cfg.w + 0.5, 0.3, cfg.d + 0.5);
                const flatRoof = new THREE.Mesh(flatRoofGeo, roofMat);
                flatRoof.position.y = cfg.h + 0.15;
                flatRoof.castShadow = true;
                buildingGroup.add(flatRoof);
            }

            // Windows (small emissive boxes)
            const windowMat = new THREE.MeshBasicMaterial({ color: 0xffdd66, transparent: true, opacity: 0.6 });
            for (let wy = 2; wy < cfg.h - 1; wy += 2.5) {
                for (let wx = -cfg.w / 2 + 1.5; wx < cfg.w / 2 - 1; wx += 2.5) {
                    if (Math.random() > 0.4) {
                        const winGeo = new THREE.BoxGeometry(0.8, 1.0, 0.1);
                        const win = new THREE.Mesh(winGeo, windowMat);
                        win.position.set(wx, wy, cfg.d / 2 + 0.06);
                        buildingGroup.add(win);
                        // Window on back wall
                        const win2 = win.clone();
                        win2.position.z = -cfg.d / 2 - 0.06;
                        buildingGroup.add(win2);
                    }
                }
            }

            // Door
            const doorGeo = new THREE.BoxGeometry(1.2, 2.0, 0.1);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x332211, roughness: 0.9, metalness: 0.1 });
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(0, 1.0, cfg.d / 2 + 0.06);
            buildingGroup.add(door);

            buildingGroup.position.set(cfg.x, 0, cfg.z);
            this.scene.add(buildingGroup);

            // Add building as obstacle with large collision radius
            const collisionObs = new THREE.Object3D();
            collisionObs.position.set(cfg.x, cfg.h / 2, cfg.z);
            collisionObs.userData = { isObstacle: true, collisionRadius: Math.max(cfg.w, cfg.d) * 0.6 };
            this.obstacles.push(collisionObs);
            occupiedPositions.push({ x: cfg.x, z: cfg.z });
        });

        // ========= BROKEN WALLS & RUINS scattered =========
        const ruinPositions = [
            { x: -40, z: 20, w: 6, h: 3, d: 0.5, ry: 0.3 },
            { x: 20, z: -30, w: 8, h: 2.5, d: 0.5, ry: 1.2 },
            { x: -10, z: 90, w: 5, h: 4, d: 0.5, ry: 0.8 },
            { x: 70, z: 30, w: 7, h: 3, d: 0.5, ry: 2.1 },
            { x: -90, z: -30, w: 4, h: 2, d: 0.5, ry: 0.5 },
        ];
        ruinPositions.forEach(cfg => {
            const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
            const mesh = new THREE.Mesh(geo, wallMat2);
            mesh.position.set(cfg.x, cfg.h / 2, cfg.z);
            mesh.rotation.y = cfg.ry;
            mesh.castShadow = true; mesh.receiveShadow = true;
            mesh.userData = { isObstacle: true, collisionRadius: cfg.w * 0.4 };
            this.scene.add(mesh); this.obstacles.push(mesh);
        });

        // ========= ROCKS =========
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x555544, roughness: 0.95, metalness: 0.05 });
        for (let i = 0; i < 30; i++) {
            const size = 0.5 + Math.random() * 1.5;
            const geo = new THREE.DodecahedronGeometry(size, 1);
            const rock = new THREE.Mesh(geo, rockMat);
            rock.position.set(
                (Math.random() - 0.5) * map.size * 1.6,
                size * 0.4,
                (Math.random() - 0.5) * map.size * 1.6
            );
            rock.rotation.set(Math.random() * 0.3, Math.random(), Math.random() * 0.3);
            rock.castShadow = true;
            rock.userData = { isObstacle: true, collisionRadius: size * 0.8 };
            this.scene.add(rock); this.obstacles.push(rock);
        }

        // ========= ADDITIONAL FOREST LIGHTS =========
        // Firefly-like point lights scattered
        for (let i = 0; i < 8; i++) {
            const light = new THREE.PointLight(0x44ff44, 0.3, 25);
            light.position.set(
                (Math.random() - 0.5) * map.size,
                3 + Math.random() * 5,
                (Math.random() - 0.5) * map.size
            );
            this.scene.add(light);
        }

        // Campfire lights near some buildings
        [[-50, 0, -45], [40, 0, -55], [-60, 0, 45], [55, 0, 55]].forEach(pos => {
            const fireLight = new THREE.PointLight(0xff6622, 1.2, 20);
            fireLight.position.set(pos[0], 1, pos[2]);
            this.scene.add(fireLight);

            // Fire visual (small emissive mesh)
            const fireGeo = new THREE.ConeGeometry(0.3, 0.8, 6);
            const fireMat = new THREE.MeshBasicMaterial({ color: 0xff4400, transparent: true, opacity: 0.8 });
            const fire = new THREE.Mesh(fireGeo, fireMat);
            fire.position.set(pos[0], 0.4, pos[2]);
            this.scene.add(fire);
        });
    }

    initWorld() {
        // Load the default map (selected by user on start screen)
        this.loadMap(this.selectedMap);
    }

    initPlayer() { this.yawObject.position.set(0, 1.7, this.arenaSize * 0.6); }

    // ==================== WEAPONS ====================
    initWeapons() { this.createWeaponMesh(); }

    createWeaponMesh() {
        if (this.weaponMesh) this.camera.remove(this.weaponMesh);
        const group = new THREE.Group();
        const colors = [0x444444, 0x556655, 0x665544, 0x335533, 0x554433, 0x445555];
        const bodyMat = new THREE.MeshStandardMaterial({ color:colors[this.currentWeapon], roughness:0.4, metalness:0.8 });

        const w = this.currentWeapon;
        if (w === 0) { // Pistol
            group.add(this.makeBox(0.06,0.12,0.25, bodyMat, 0,0,-0.1));
            group.add(this.makeBox(0.04,0.04,0.2, bodyMat, 0,0.04,-0.25));
            group.add(this.makeBox(0.05,0.1,0.06, bodyMat, 0,-0.08,-0.02, -0.3));
            group.position.set(0.25,-0.2,-0.4);
        } else if (w === 1) { // Rifle
            group.add(this.makeBox(0.06,0.1,0.5, bodyMat, 0,0,-0.2));
            group.add(this.makeBox(0.035,0.035,0.3, bodyMat, 0,0.03,-0.5));
            group.add(this.makeBox(0.05,0.08,0.15, bodyMat, 0,-0.02,0.1));
            group.add(this.makeBox(0.04,0.1,0.05, bodyMat, 0,-0.08,-0.05, -0.3));
            group.add(this.makeBox(0.04,0.12,0.04, bodyMat, 0,-0.12,-0.15));
            group.position.set(0.28,-0.22,-0.4);
        } else if (w === 2) { // Shotgun
            group.add(this.makeBox(0.07,0.1,0.45, bodyMat, 0,0,-0.18));
            const b1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.35,6), bodyMat);
            b1.rotation.x=Math.PI/2; b1.position.set(-0.02,0.04,-0.45); group.add(b1);
            const b2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.35,6), bodyMat);
            b2.rotation.x=Math.PI/2; b2.position.set(0.02,0.04,-0.45); group.add(b2);
            group.add(this.makeBox(0.05,0.1,0.06, bodyMat, 0,-0.08,0, -0.3));
            group.add(this.makeBox(0.06,0.06,0.1, bodyMat, 0,0,-0.28));
            group.position.set(0.25,-0.22,-0.4);
        } else if (w === 3) { // Sniper
            group.add(this.makeBox(0.05,0.08,0.7, bodyMat, 0,0,-0.25));
            group.add(this.makeBox(0.03,0.03,0.4, bodyMat, 0,0.02,-0.65));
            // Scope
            const scopeMat = new THREE.MeshStandardMaterial({color:0x222222, roughness:0.2, metalness:0.9});
            group.add(this.makeBox(0.04,0.06,0.12, scopeMat, 0,0.08,-0.3));
            const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.02,0.02,0.04,8), new THREE.MeshBasicMaterial({color:0x44aaff}));
            lens.rotation.x=Math.PI/2; lens.position.set(0,0.08,-0.36); group.add(lens);
            group.add(this.makeBox(0.04,0.12,0.04, bodyMat, 0,-0.1,-0.15));
            group.position.set(0.3,-0.22,-0.4);
        } else if (w === 4) { // RPG
            group.add(this.makeBox(0.08,0.1,0.6, bodyMat, 0,0,-0.2));
            const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,0.5,8), bodyMat);
            tube.rotation.x=Math.PI/2; tube.position.set(0,0.02,-0.5); group.add(tube);
            // Warhead
            const warhead = new THREE.Mesh(new THREE.ConeGeometry(0.04,0.12,8), new THREE.MeshStandardMaterial({color:0x44aa44, roughness:0.5, metalness:0.5}));
            warhead.rotation.x=Math.PI/2; warhead.position.set(0,0.02,-0.78); group.add(warhead);
            group.add(this.makeBox(0.05,0.1,0.06, bodyMat, 0,-0.08,-0.05, -0.3));
            group.position.set(0.25,-0.22,-0.35);
        } else { // Minigun
            group.add(this.makeBox(0.08,0.1,0.4, bodyMat, 0,0,-0.15));
            // Multiple barrels
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.015,0.015,0.35,6), bodyMat);
                barrel.rotation.x = Math.PI/2;
                barrel.position.set(Math.cos(angle)*0.03, 0.03+Math.sin(angle)*0.03, -0.4);
                group.add(barrel);
            }
            group.add(this.makeBox(0.06,0.15,0.08, bodyMat, 0,-0.1,-0.05));
            // Ammo belt
            const belt = new THREE.Mesh(new THREE.BoxGeometry(0.03,0.08,0.15), bodyMat);
            belt.position.set(0.05,-0.05,-0.08); group.add(belt);
            group.position.set(0.28,-0.24,-0.4);
        }

        // Muzzle flash
        const flashGeo = new THREE.SphereGeometry(0.1, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({color:0xffaa00, transparent:true, opacity:0});
        this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
        this.muzzleFlash.position.set(0, 0.02, -0.8);
        group.add(this.muzzleFlash);

        this.weaponMesh = group;
        this.camera.add(this.weaponMesh);
    }

    makeBox(w,h,d,mat,x,y,z,rx) {
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
        mesh.position.set(x,y,z);
        if (rx) mesh.rotation.x = rx;
        return mesh;
    }

    switchWeapon(index) {
        if (index === this.currentWeapon || this.isReloading) return;
        this.currentWeapon = index;
        this.createWeaponMesh();
        this.updateHUD();
        document.querySelectorAll('.weapon-slot').forEach((el, i) => el.classList.toggle('active', i === index));
    }

    shoot() {
        const weapon = this.weapons[this.currentWeapon];
        const now = Date.now();
        if (this.isReloading) return;
        if (now - this.lastFireTime < weapon.fireRate) return;
        if (weapon.ammo <= 0) { this.reload(); return; }

        this.lastFireTime = now;
        weapon.ammo--;
        this.playSound('shoot');
        if (this.muzzleFlash) { this.muzzleFlash.material.opacity = 1; setTimeout(()=>{if(this.muzzleFlash)this.muzzleFlash.material.opacity=0;},50); }
        this.weaponRecoil = 0.05;
        this.pitchObject.rotation.x += 0.01;

        // RPG - explosive
        if (weapon.explosive) {
            const dir = new THREE.Vector3(0,0,-1);
            dir.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));
            dir.normalize();
            this.fireRocket(dir);
        } else {
            for (let i = 0; i < weapon.pellets; i++) {
                const direction = new THREE.Vector3(0,0,-1);
                direction.x += (Math.random()-0.5)*weapon.spread;
                direction.y += (Math.random()-0.5)*weapon.spread;
                direction.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));
                direction.normalize();
                this.raycaster.set(this.camera.getWorldPosition(new THREE.Vector3()), direction);
                this.raycaster.far = 100;

                const enemyMeshes = this.enemies.map(e => e.mesh);
                const hits = this.raycaster.intersectObjects(enemyMeshes, true);

                if (hits.length > 0) {
                    const hit = hits[0];
                    const enemy = this.enemies.find(e => e.mesh === hit.object || e.mesh.children.includes(hit.object));
                    if (enemy) {
                        this.hitEnemy(enemy, weapon.damage);
                        this.showHitMarker();
                        this.spawnParticles(hit.point, enemy.type.color, 5);
                    }
                } else {
                    const wallHits = this.raycaster.intersectObjects([...this.walls, ...this.obstacles]);
                    if (wallHits.length > 0) {
                        this.spawnParticles(wallHits[0].point, 0xffaa00, 3);
                        this.createBulletHole(wallHits[0]);
                    }
                }
                this.createBulletTrail(direction);
            }
        }

        this.updateHUD();
        if (weapon.ammo <= 0) setTimeout(() => this.reload(), 300);
    }

    // RPG Rocket
    fireRocket(direction) {
        const rocketGeo = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 6);
        const rocketMat = new THREE.MeshBasicMaterial({ color: 0xff4400 });
        const rocket = new THREE.Mesh(rocketGeo, rocketMat);
        const pos = this.camera.getWorldPosition(new THREE.Vector3());
        rocket.position.copy(pos);
        rocket.quaternion.copy(this.camera.getWorldQuaternion(new THREE.Quaternion()));
        rocket.rotateX(Math.PI/2);
        this.scene.add(rocket);

        const rocketData = {
            mesh: rocket, direction: direction.clone(), speed: 40, life: 3,
            damage: this.weapons[this.currentWeapon].damage,
            radius: this.weapons[this.currentWeapon].explosionRadius
        };

        const rocketInterval = setInterval(() => {
            if (this.isDead || !this.isPlaying) { clearInterval(rocketInterval); this.scene.remove(rocket); return; }
            rocket.position.add(direction.clone().multiplyScalar(0.5));
            rocketData.life -= 0.016;

            // Check enemy hit
            for (const enemy of this.enemies) {
                if (rocket.position.distanceTo(enemy.mesh.position) < 2) {
                    this.createExplosion(rocket.position.clone(), rocketData.radius);
                    // Damage all enemies in radius
                    this.enemies.forEach(e => {
                        if (rocket.position.distanceTo(e.mesh.position) < rocketData.radius) {
                            this.hitEnemy(e, rocketData.damage * (1 - rocket.position.distanceTo(e.mesh.position) / rocketData.radius));
                        }
                    });
                    this.scene.remove(rocket);
                    clearInterval(rocketInterval);
                    return;
                }
            }

            // Check wall/obstacle hit
            for (const obs of [...this.walls, ...this.obstacles]) {
                if (rocket.position.distanceTo(obs.position) < 1.5) {
                    this.createExplosion(rocket.position.clone(), rocketData.radius);
                    this.scene.remove(rocket);
                    clearInterval(rocketInterval);
                    return;
                }
            }

            if (rocketData.life <= 0) { this.scene.remove(rocket); clearInterval(rocketInterval); }
        }, 16);
    }

    // Explosion effect
    createExplosion(position, radius) {
        // Flash sphere
        const flashGeo = new THREE.SphereGeometry(radius * 0.5, 16, 16);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xff6600, transparent: true, opacity: 0.8 });
        const flash = new THREE.Mesh(flashGeo, flashMat);
        flash.position.copy(position);
        this.scene.add(flash);

        // Particles
        this.spawnParticles(position, 0xff4400, 25);
        this.spawnParticles(position, 0xffaa00, 15);

        // Damage player if in radius
        if (position.distanceTo(this.yawObject.position) < radius) {
            this.takeDamage(30 * (1 - position.distanceTo(this.yawObject.position) / radius));
        }

        this.playSound('explosion');

        // Animate explosion
        const startScale = 0.1;
        flash.scale.setScalar(startScale);
        const explosionAnim = setInterval(() => {
            flash.scale.multiplyScalar(1.1);
            flashMat.opacity *= 0.92;
            if (flashMat.opacity < 0.01) { clearInterval(explosionAnim); this.scene.remove(flash); }
        }, 16);
    }

    reload() {
        const weapon = this.weapons[this.currentWeapon];
        if (this.isReloading || weapon.ammo === weapon.maxAmmo) return;
        this.isReloading = true;
        this.reloadStartTime = Date.now();
        this.playSound('reload');
        if (this.weaponMesh) this.weaponMesh.rotation.x = -0.5;
        setTimeout(() => {
            weapon.ammo = weapon.maxAmmo;
            this.isReloading = false;
            if (this.weaponMesh) this.weaponMesh.rotation.x = 0;
            this.updateHUD();
        }, weapon.reloadTime);
    }

    hitEnemy(enemy, damage) {
        enemy.health -= damage;
        // Flash all child meshes white for hit feedback
        const childMeshes = [];
        enemy.mesh.traverse(child => { if (child.isMesh) childMeshes.push(child); });
        const origColors = childMeshes.map(m => m.material.color.getHex());
        childMeshes.forEach(m => { if (m.material.color) m.material.color.setHex(0xffffff); });
        setTimeout(() => {
            childMeshes.forEach((m, i) => {
                if (m.material && m.material.color && origColors[i] !== undefined) m.material.color.setHex(origColors[i]);
            });
        }, 80);
        if (enemy.health <= 0) this.killEnemy(enemy);
        else if (enemy.isBoss) this.updateBossBar();
    }

    killEnemy(enemy) {
        this.score += enemy.type.score;
        this.kills++;
        this.enemiesRemaining--;

        this.spawnParticles(enemy.mesh.position, enemy.type.color, 20);
        this.scene.remove(enemy.mesh);
        const idx = this.enemies.indexOf(enemy);
        if (idx > -1) this.enemies.splice(idx, 1);

        if (enemy.isBoss) {
            this.currentBoss = null;
            document.getElementById('boss-bar').classList.add('hidden');
            // Boss death explosion
            this.createExplosion(enemy.mesh.position.clone(), 5);
            this.score += 1000;
        }

        this.addKillFeed(enemy.typeName + (enemy.isBoss ? ' 💀' : ''));
        this.playSound('kill');
        this.updateHUD();

        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) this.nextWave();
    }

    // ==================== ENEMIES ====================
    createHumanoidEnemy(color, type, size) {
        const group = new THREE.Group();

        // Colors
        const bodyColor = color;
        const clothColor = new THREE.Color(color).multiplyScalar(0.5).getHex();
        const skinColor = 0xddbb99;

        // Materials
        const bodyMat = new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.6, metalness: 0.4, emissive: bodyColor, emissiveIntensity: 0.2 });
        const clothMat = new THREE.MeshStandardMaterial({ color: clothColor, roughness: 0.8, metalness: 0.1 });
        const skinMat = new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.7, metalness: 0.1 });

        // === HEAD ===
        const headGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const head = new THREE.Mesh(headGeo, skinMat);
        head.position.y = 1.85;
        head.castShadow = true;
        group.add(head);

        // Eyes on head
        const eyeGeo = new THREE.SphereGeometry(0.07, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.position.set(-0.12, 1.9, -0.26);
        group.add(eye1);
        const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
        eye2.position.set(0.12, 1.9, -0.26);
        group.add(eye2);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(0.04, 6, 6);
        const pupilMat = new THREE.MeshBasicMaterial({ color: type === 'boss' ? 0xff0000 : 0xff0000 });
        const p1 = new THREE.Mesh(pupilGeo, pupilMat);
        p1.position.set(-0.12, 1.9, -0.3);
        group.add(p1);
        const p2 = new THREE.Mesh(pupilGeo, pupilMat);
        p2.position.set(0.12, 1.9, -0.3);
        group.add(p2);

        // === TORSO (ကိုယ်ထည်) ===
        const torsoGeo = new THREE.BoxGeometry(0.8, 1.2, 0.6);
        const torso = new THREE.Mesh(torsoGeo, clothMat);
        torso.position.y = 1.15;
        torso.castShadow = true;
        group.add(torso);

        // Belt/waist detail
        const beltGeo = new THREE.BoxGeometry(0.82, 0.1, 0.62);
        const beltMat = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.5, metalness: 0.3 });
        const belt = new THREE.Mesh(beltGeo, beltMat);
        belt.position.y = 0.6;
        group.add(belt);

        // === LEFT ARM ===
        const armGeo = new THREE.BoxGeometry(0.25, 1.0, 0.25);
        const leftArm = new THREE.Mesh(armGeo, bodyMat);
        leftArm.position.set(-0.55, 1.15, 0);
        leftArm.castShadow = true;
        leftArm.userData.isArm = true;
        group.add(leftArm);

        // Left hand
        const handGeo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.set(-0.55, 0.58, 0);
        group.add(leftHand);

        // === RIGHT ARM ===
        const rightArm = new THREE.Mesh(armGeo.clone(), bodyMat);
        rightArm.position.set(0.55, 1.15, 0);
        rightArm.castShadow = true;
        rightArm.userData.isArm = true;
        group.add(rightArm);

        // Right hand
        const rightHand = new THREE.Mesh(handGeo.clone(), skinMat);
        rightHand.position.set(0.55, 0.58, 0);
        group.add(rightHand);

        // === LEFT LEG ===
        const legGeo = new THREE.BoxGeometry(0.3, 1.0, 0.3);
        const leftLeg = new THREE.Mesh(legGeo, clothMat);
        leftLeg.position.set(-0.22, 0.1, 0);
        leftLeg.castShadow = true;
        leftLeg.userData.isLeg = true;
        group.add(leftLeg);

        // Left foot
        const footGeo = new THREE.BoxGeometry(0.3, 0.12, 0.4);
        const leftFoot = new THREE.Mesh(footGeo, new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1 }));
        leftFoot.position.set(-0.22, -0.44, -0.05);
        group.add(leftFoot);

        // === RIGHT LEG ===
        const rightLeg = new THREE.Mesh(legGeo.clone(), clothMat);
        rightLeg.position.set(0.22, 0.1, 0);
        rightLeg.castShadow = true;
        rightLeg.userData.isLeg = true;
        group.add(rightLeg);

        // Right foot
        const rightFoot = new THREE.Mesh(footGeo.clone(), new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.9, metalness: 0.1 }));
        rightFoot.position.set(0.22, -0.44, -0.05);
        group.add(rightFoot);

        // === BOSS EXTRAS ===
        if (type === 'boss') {
            // Crown / Horns
            const hornMat = new THREE.MeshStandardMaterial({ color: 0xffaa00, emissive: 0xffaa00, emissiveIntensity: 0.3, roughness: 0.3, metalness: 0.8 });
            const h1 = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 6), hornMat);
            h1.position.set(-0.2, 2.25, 0);
            group.add(h1);
            const h2 = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.6, 6), hornMat);
            h2.position.set(0.2, 2.25, 0);
            group.add(h2);
            // Crown ring
            const crown = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.05, 8, 16), hornMat);
            crown.position.set(0, 2.15, 0);
            crown.rotation.x = Math.PI / 2;
            group.add(crown);

            // Shoulder pads
            const padGeo = new THREE.BoxGeometry(0.35, 0.2, 0.35);
            const padMat = new THREE.MeshStandardMaterial({ color: 0xff4400, emissive: 0xff4400, emissiveIntensity: 0.2, roughness: 0.4, metalness: 0.6 });
            const lPad = new THREE.Mesh(padGeo, padMat);
            lPad.position.set(-0.6, 1.65, 0);
            group.add(lPad);
            const rPad = new THREE.Mesh(padGeo.clone(), padMat);
            rPad.position.set(0.6, 1.65, 0);
            group.add(rPad);
        }

        // Scale the entire group by size
        group.scale.setScalar(size);

        return group;
    }
    spawnEnemy(type = 'basic') {
        const enemyType = this.enemyTypes[type];
        if (!enemyType) return;

        const size = enemyType.size;
        const mesh = this.createHumanoidEnemy(enemyType.color, type, size);

        let spawnPos;
        const maxSpawnDist = Math.min(40, this.arenaSize * 0.5);
        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = 15 + Math.random() * maxSpawnDist;
            spawnPos = new THREE.Vector3(Math.cos(angle)*dist, 0, Math.sin(angle)*dist);
        } while (spawnPos.distanceTo(this.yawObject.position) < 12);

        const half = this.arenaSize - 2;
        spawnPos.x = Math.max(-half, Math.min(half, spawnPos.x));
        spawnPos.z = Math.max(-half, Math.min(half, spawnPos.z));
        mesh.position.copy(spawnPos);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const enemy = {
            mesh, health: enemyType.health, maxHealth: enemyType.health,
            speed: enemyType.speed, damage: enemyType.damage,
            type: enemyType, typeName: type.toUpperCase(),
            lastAttack: 0, attackCooldown: type==='boss' ? 800 : 1000,
            isBoss: type === 'boss', hitFlash: 0
        };

        if (type === 'boss') {
            this.currentBoss = enemy;
            this.bossPhase = 1;
            this.bossAttackTimer = 0;
            this.showBossAnnounce();
            this.updateBossBar();
        }

        this.enemies.push(enemy);
    }

    updateEnemies(delta) {
        this.enemies.forEach(enemy => {
            const playerPos = this.yawObject.position.clone(); playerPos.y = 0;
            const enemyPos = enemy.mesh.position.clone(); enemyPos.y = 0;
            const direction = playerPos.sub(enemyPos).normalize();

            enemy.mesh.lookAt(new THREE.Vector3(this.yawObject.position.x, enemy.mesh.position.y, this.yawObject.position.z));

            // Boss special movement patterns
            let moveSpeed = enemy.speed;
            if (enemy.isBoss) {
                this.updateBossAI(enemy, delta);
                moveSpeed = enemy.speed * (this.bossPhase === 2 ? 1.5 : 1);
            }

            const moveDir = direction.multiplyScalar(moveSpeed * delta);
            const newPos = enemy.mesh.position.clone().add(moveDir);
            const half = this.arenaSize - 1;
            newPos.x = Math.max(-half, Math.min(half, newPos.x));
            newPos.z = Math.max(-half, Math.min(half, newPos.z));

            // Simple obstacle avoidance
            for (const obs of this.obstacles) {
                const colRadius = obs.userData.collisionRadius || 1.5;
                const dist = newPos.distanceTo(obs.position);
                if (dist < colRadius) {
                    const perp = new THREE.Vector3(-direction.z, 0, direction.x);
                    newPos.add(perp.multiplyScalar(2 * delta * moveSpeed));
                    break;
                }
            }

            enemy.mesh.position.copy(newPos);
            enemy.mesh.position.y = Math.sin(Date.now()*0.005 + enemy.mesh.id) * 0.08;

            // Humanoid walking animation (animate arms & legs)
            const walkCycle = Date.now() * 0.008 * moveSpeed;
            enemy.mesh.children.forEach(child => {
                if (child.userData.isLeg) {
                    const offset = child.position.x > 0 ? 0 : Math.PI;
                    child.rotation.x = Math.sin(walkCycle + offset) * 0.4;
                }
                if (child.userData.isArm) {
                    const offset = child.position.x > 0 ? Math.PI : 0;
                    child.rotation.x = Math.sin(walkCycle + offset) * 0.3;
                }
            });

            // Melee attack
            const distToPlayer = enemy.mesh.position.distanceTo(this.yawObject.position);
            if (distToPlayer < 2) {
                const now = Date.now();
                if (now - enemy.lastAttack > enemy.attackCooldown) {
                    enemy.lastAttack = now;
                    this.takeDamage(enemy.damage);
                }
            }
        });
    }

    // ==================== BOSS AI ====================
    updateBossAI(boss, delta) {
        this.bossAttackTimer += delta;

        // Phase transitions based on health
        const healthPct = boss.health / boss.maxHealth;
        if (healthPct < 0.3 && this.bossPhase < 3) {
            this.bossPhase = 3;
            boss.speed = 4; boss.damage = 40; boss.attackCooldown = 600;
            boss.mesh.material.emissiveIntensity = 1.0;
            this.updateBossBar();
            this.playSound('bossRoar');
        } else if (healthPct < 0.6 && this.bossPhase < 2) {
            this.bossPhase = 2;
            boss.speed = 3; boss.damage = 35; boss.attackCooldown = 700;
            boss.mesh.material.emissiveIntensity = 0.5;
            this.updateBossBar();
            this.playSound('bossRoar');
        }

        // Ranged attack - shoot projectile
        if (this.bossAttackTimer > 2.0) {
            this.bossAttackTimer = 0;
            this.bossShootProjectile(boss);
        }
    }

    bossShootProjectile(boss) {
        const dir = new THREE.Vector3();
        dir.subVectors(this.yawObject.position, boss.mesh.position).normalize();
        dir.y = 0;

        const projGeo = new THREE.SphereGeometry(0.3, 8, 8);
        const projColor = this.bossPhase >= 3 ? 0xff0000 : (this.bossPhase >= 2 ? 0xff4400 : 0xff8800);
        const projMat = new THREE.MeshBasicMaterial({ color: projColor });
        const proj = new THREE.Mesh(projGeo, projMat);
        proj.position.copy(boss.mesh.position);
        proj.position.y += 1;
        this.scene.add(proj);

        // Glow
        const glow = new THREE.PointLight(projColor, 1, 5);
        proj.add(glow);

        this.bossProjectiles.push({ mesh: proj, direction: dir, speed: 15, life: 4, damage: 15 + this.bossPhase * 5 });
        this.playSound('bossShoot');
    }

    updateBossProjectiles(delta) {
        this.bossProjectiles = this.bossProjectiles.filter(p => {
            p.mesh.position.add(p.direction.clone().multiplyScalar(p.speed * delta));
            p.life -= delta;

            // Hit player
            if (p.mesh.position.distanceTo(this.yawObject.position) < 1.5) {
                this.takeDamage(p.damage);
                this.spawnParticles(p.mesh.position, 0xff4400, 8);
                this.scene.remove(p.mesh);
                return false;
            }

            // Hit wall/obstacle
            for (const obs of [...this.walls, ...this.obstacles]) {
                if (p.mesh.position.distanceTo(obs.position) < 1) {
                    this.spawnParticles(p.mesh.position, 0xffaa00, 5);
                    this.scene.remove(p.mesh);
                    return false;
                }
            }

            if (p.life <= 0) { this.scene.remove(p.mesh); return false; }
            return true;
        });
    }

    showBossAnnounce() {
        const el = document.getElementById('boss-announce');
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 3000);
    }

    updateBossBar() {
        if (!this.currentBoss) return;
        const boss = this.currentBoss;
        const pct = Math.max(0, boss.health / boss.maxHealth * 100);
        document.getElementById('boss-health-bar').style.width = pct + '%';
        document.getElementById('boss-name').textContent = `💀 BOSS - ${boss.typeName}`;
        document.getElementById('boss-phase').textContent = `Phase ${this.bossPhase}`;

        // Color based on phase
        const bar = document.getElementById('boss-health-bar');
        if (this.bossPhase >= 3) bar.style.background = 'linear-gradient(90deg, #ff0000, #ff4444)';
        else if (this.bossPhase >= 2) bar.style.background = 'linear-gradient(90deg, #ff4400, #ff8800)';
        else bar.style.background = 'linear-gradient(90deg, #ff4444, #ffaa00)';

        document.getElementById('boss-bar').classList.remove('hidden');
    }

    // ==================== WAVE SYSTEM ====================
    startWave(waveNum) {
        this.wave = waveNum;
        this.enemiesPerWave = 3 + waveNum * 2;
        this.enemiesRemaining = this.enemiesPerWave;
        this.enemiesSpawned = 0;
        this.waveDelay = false;

        this.showWaveAnnounce(waveNum);
        this.updateHUD();

        this.spawnInterval = setInterval(() => {
            if (this.enemiesSpawned >= this.enemiesPerWave || this.isDead) {
                clearInterval(this.spawnInterval); return;
            }

            let type = 'basic';
            const rand = Math.random();
            if (waveNum >= 5 && this.enemiesSpawned === this.enemiesPerWave - 1) type = 'boss';
            else if (waveNum >= 3 && rand < 0.15) type = 'tank';
            else if (waveNum >= 2 && rand < 0.35) type = 'fast';

            this.spawnEnemy(type);
            this.enemiesSpawned++;
        }, 1500);
    }

    nextWave() {
        this.waveDelay = true;
        this.health = Math.min(this.maxHealth, this.health + 25);
        this.updateHUD();
        setTimeout(() => { if (!this.isDead) this.startWave(this.wave + 1); }, 3000);
    }

    // ==================== PICKUPS ====================
    spawnPickup() {
        if (this.pickups.length > 4) return;
        const type = Math.random() > 0.5 ? 'health' : 'ammo';
        const geo = type === 'health' ? new THREE.OctahedronGeometry(0.4, 0) : new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mat = new THREE.MeshStandardMaterial({
            color: type==='health'?0x44ff44:0x4488ff,
            emissive: type==='health'?0x44ff44:0x4488ff,
            emissiveIntensity: 0.5, roughness: 0.3, metalness: 0.8
        });
        const mesh = new THREE.Mesh(geo, mat);
        const half = this.arenaSize - 5;
        mesh.position.set((Math.random()-0.5)*half*2, 0.5, (Math.random()-0.5)*half*2);
        this.scene.add(mesh);
        this.pickups.push({ mesh, type, bobOffset: Math.random()*Math.PI*2 });
    }

    updatePickups() {
        this.pickups = this.pickups.filter(pickup => {
            pickup.mesh.position.y = 0.5 + Math.sin(Date.now()*0.003 + pickup.bobOffset) * 0.2;
            pickup.mesh.rotation.y += 0.02;
            const dist = pickup.mesh.position.distanceTo(this.yawObject.position);
            if (dist < 1.5) {
                if (pickup.type === 'health') { this.health = Math.min(this.maxHealth, this.health + 25); }
                else { this.weapons[this.currentWeapon].ammo = this.weapons[this.currentWeapon].maxAmmo; }
                this.playSound('pickup');
                this.scene.remove(pickup.mesh);
                this.updateHUD();
                return false;
            }
            return true;
        });
    }

    // ==================== PLAYER DAMAGE ====================
    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount; this.health = Math.max(0, this.health);
        const overlay = document.getElementById('damage-overlay');
        overlay.classList.add('hit'); setTimeout(() => overlay.classList.remove('hit'), 200);
        this.pitchObject.rotation.x += (Math.random()-0.5)*0.05;
        this.yawObject.rotation.y += (Math.random()-0.5)*0.05;
        this.playSound('hit'); this.updateHUD();
        if (this.health <= 0) this.die();
    }

    die() {
        this.isDead = true; this.isPlaying = false;
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.pickupInterval) clearInterval(this.pickupInterval);
        if (document.pointerLockElement) document.exitPointerLock();
        if (this.score > this.bestScore) { this.bestScore = this.score; localStorage.setItem('heheFPSBest', this.bestScore); }

        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
        document.getElementById('boss-bar').classList.add('hidden');
        document.getElementById('go-score').textContent = this.score;
        document.getElementById('go-wave').textContent = this.wave;
        document.getElementById('go-kills').textContent = this.kills;
        document.getElementById('go-best').textContent = this.bestScore;
        document.getElementById('gameover-screen').classList.remove('hidden');
        this.stopBGM();
        this.playSound('death');
    }

    // ==================== EFFECTS ====================
    spawnParticles(position, color, count) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.05, 4, 4);
            const mat = new THREE.MeshBasicMaterial({color, transparent:true, opacity:1});
            const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(position);
            const velocity = new THREE.Vector3((Math.random()-0.5)*8, Math.random()*5, (Math.random()-0.5)*8);
            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 1, decay: 0.02+Math.random()*0.03 });
        }
    }

    updateParticles(delta) {
        this.particles = this.particles.filter(p => {
            p.velocity.y -= 9.8 * delta;
            p.mesh.position.add(p.velocity.clone().multiplyScalar(delta));
            p.life -= p.decay; p.mesh.material.opacity = p.life; p.mesh.scale.setScalar(p.life);
            if (p.life <= 0) { this.scene.remove(p.mesh); return false; }
            return true;
        });
    }

    createBulletHole(hit) {
        const geo = new THREE.CircleGeometry(0.05, 8);
        const mat = new THREE.MeshBasicMaterial({color:0x111111, side:THREE.DoubleSide});
        const mesh = new THREE.Mesh(geo, mat); mesh.position.copy(hit.point);
        if (hit.face) mesh.lookAt(hit.point.clone().add(hit.face.normal));
        mesh.position.add(hit.face ? hit.face.normal.clone().multiplyScalar(0.01) : new THREE.Vector3());
        this.scene.add(mesh);
        setTimeout(() => this.scene.remove(mesh), 5000);
    }

    createBulletTrail(direction) {
        const start = this.camera.getWorldPosition(new THREE.Vector3());
        const end = start.clone().add(direction.clone().multiplyScalar(50));
        const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const mat = new THREE.LineBasicMaterial({color:0xffaa00, transparent:true, opacity:0.5});
        const line = new THREE.Line(geo, mat); this.scene.add(line);
        setTimeout(() => this.scene.remove(line), 50);
    }

    // ==================== BGM SYSTEM ====================
    initBGM() {
        if (!this.audioCtx) return;
        this.bgmPlaying = true;
        this.playBGM();
    }

    playBGM() {
        if (!this.bgmPlaying || !this.audioCtx || !this.bgmEnabled) return;

        const ctx = this.audioCtx;
        const now = ctx.currentTime;
        const bpm = 130;
        const beatLen = 60 / bpm;

        // Dark ambient bass drone
        const bass = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bass.type = 'sawtooth';
        bass.frequency.setValueAtTime(55, now);
        bassGain.gain.setValueAtTime(0.06, now);
        bass.connect(bassGain); bassGain.connect(ctx.destination);
        bass.start(now); bass.stop(now + beatLen * 8);

        // Rhythmic kick
        for (let i = 0; i < 8; i++) {
            const kick = ctx.createOscillator();
            const kickGain = ctx.createGain();
            kick.type = 'sine';
            kick.frequency.setValueAtTime(150, now + i * beatLen);
            kick.frequency.exponentialRampToValueAtTime(30, now + i * beatLen + 0.1);
            kickGain.gain.setValueAtTime(0.15, now + i * beatLen);
            kickGain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLen + 0.15);
            kick.connect(kickGain); kickGain.connect(ctx.destination);
            kick.start(now + i * beatLen); kick.stop(now + i * beatLen + 0.15);
        }

        // Hi-hat pattern
        for (let i = 0; i < 16; i++) {
            const noise = ctx.createOscillator();
            const noiseGain = ctx.createGain();
            noise.type = 'square';
            noise.frequency.setValueAtTime(3000 + Math.random()*2000, now + i * beatLen * 0.5);
            noiseGain.gain.setValueAtTime(i%2===0 ? 0.04 : 0.02, now + i * beatLen * 0.5);
            noiseGain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLen * 0.5 + 0.05);
            noise.connect(noiseGain); noiseGain.connect(ctx.destination);
            noise.start(now + i * beatLen * 0.5); noise.stop(now + i * beatLen * 0.5 + 0.05);
        }

        // Melody (dark minor key)
        const notes = [220, 196, 185, 165, 220, 262, 247, 220];
        notes.forEach((freq, i) => {
            const mel = ctx.createOscillator();
            const melGain = ctx.createGain();
            mel.type = 'triangle';
            mel.frequency.setValueAtTime(freq, now + i * beatLen);
            melGain.gain.setValueAtTime(0.05, now + i * beatLen);
            melGain.gain.exponentialRampToValueAtTime(0.001, now + i * beatLen + beatLen * 0.8);
            mel.connect(melGain); melGain.connect(ctx.destination);
            mel.start(now + i * beatLen); mel.stop(now + i * beatLen + beatLen);
        });

        // Loop
        const loopDuration = beatLen * 8;
        this.bgmTimeout = setTimeout(() => {
            if (this.bgmPlaying && this.bgmEnabled) this.playBGM();
        }, loopDuration * 1000);
    }

    stopBGM() {
        this.bgmPlaying = false;
        if (this.bgmTimeout) { clearTimeout(this.bgmTimeout); this.bgmTimeout = null; }
    }

    toggleBGM() {
        this.bgmEnabled = !this.bgmEnabled;
        document.getElementById('bgm-icon').textContent = this.bgmEnabled ? '🎵' : '🔇';
        if (this.bgmEnabled && this.isPlaying) { this.bgmPlaying = true; this.playBGM(); }
        else { this.stopBGM(); }
    }

    // ==================== HUD ====================
    updateHUD() {
        const weapon = this.weapons[this.currentWeapon];
        document.getElementById('health-bar').style.width = (this.health / this.maxHealth * 100) + '%';
        document.getElementById('health-text').textContent = Math.ceil(this.health);
        document.getElementById('score-num').textContent = this.score;
        document.getElementById('wave-num').textContent = this.wave;
        document.getElementById('enemy-count').textContent = this.enemies.length;
        document.getElementById('weapon-name').textContent = weapon.name;
        document.getElementById('ammo-current').textContent = weapon.ammo;
        document.getElementById('ammo-max').textContent = weapon.maxAmmo;
        document.getElementById('map-name-hud').textContent = this.maps[this.selectedMap].name;

        const healthPct = this.health / this.maxHealth;
        const healthBar = document.getElementById('health-bar');
        if (healthPct > 0.5) healthBar.style.background = 'linear-gradient(90deg, #44ff44, #00cc00)';
        else if (healthPct > 0.25) healthBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
        else healthBar.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';

        const ammoCurrent = document.getElementById('ammo-current');
        ammoCurrent.style.color = weapon.ammo <= weapon.maxAmmo * 0.25 ? '#ff4444' : '#ff8800';
    }

    showHitMarker() {
        const hm = document.getElementById('hitmarker');
        hm.classList.remove('hidden');
        hm.style.animation = 'none'; hm.offsetHeight;
        hm.style.animation = '';
        setTimeout(() => hm.classList.add('hidden'), 200);
    }

    showWaveAnnounce(num) {
        document.getElementById('wave-announce-num').textContent = num;
        document.getElementById('wave-sub-text').textContent = num > 1 ? `${3 + num * 2} Enemies Incoming!` : 'Get Ready!';
        const el = document.getElementById('wave-announce');
        el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 2500);
    }

    addKillFeed(type) {
        const feed = document.getElementById('kill-feed');
        const entry = document.createElement('div');
        entry.className = 'kill-entry';
        entry.innerHTML = `🔫 You → <span style="color:#ff8800">${type}</span>`;
        feed.appendChild(entry); setTimeout(() => entry.remove(), 3000);
    }

    // ==================== AUDIO ====================
    initAudio() { if (!this.audioCtx) this.audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }

    playSound(type) {
        if (!this.audioCtx) return;
        try {
            const ctx = this.audioCtx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            const t = ctx.currentTime;

            switch (type) {
                case 'shoot':
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(200,t);
                    osc.frequency.exponentialRampToValueAtTime(50,t+0.1);
                    gain.gain.setValueAtTime(0.12,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.1);
                    osc.start(t); osc.stop(t+0.1); break;
                case 'explosion':
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(100,t);
                    osc.frequency.exponentialRampToValueAtTime(20,t+0.5);
                    gain.gain.setValueAtTime(0.2,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.5);
                    osc.start(t); osc.stop(t+0.5); break;
                case 'hit':
                    osc.type='sine'; osc.frequency.setValueAtTime(300,t);
                    osc.frequency.exponentialRampToValueAtTime(100,t+0.15);
                    gain.gain.setValueAtTime(0.08,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.15);
                    osc.start(t); osc.stop(t+0.15); break;
                case 'kill':
                    osc.type='square'; osc.frequency.setValueAtTime(600,t);
                    osc.frequency.exponentialRampToValueAtTime(800,t+0.05);
                    osc.frequency.exponentialRampToValueAtTime(400,t+0.15);
                    gain.gain.setValueAtTime(0.06,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.2);
                    osc.start(t); osc.stop(t+0.2); break;
                case 'reload':
                    osc.type='triangle'; osc.frequency.setValueAtTime(400,t);
                    osc.frequency.setValueAtTime(600,t+0.1); osc.frequency.setValueAtTime(800,t+0.2);
                    gain.gain.setValueAtTime(0.06,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.3);
                    osc.start(t); osc.stop(t+0.3); break;
                case 'pickup':
                    osc.type='sine'; osc.frequency.setValueAtTime(500,t);
                    osc.frequency.exponentialRampToValueAtTime(1000,t+0.15);
                    gain.gain.setValueAtTime(0.08,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.2);
                    osc.start(t); osc.stop(t+0.2); break;
                case 'death':
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(300,t);
                    osc.frequency.exponentialRampToValueAtTime(30,t+0.8);
                    gain.gain.setValueAtTime(0.12,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.8);
                    osc.start(t); osc.stop(t+0.8); break;
                case 'bossShoot':
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(400,t);
                    osc.frequency.exponentialRampToValueAtTime(80,t+0.3);
                    gain.gain.setValueAtTime(0.1,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.3);
                    osc.start(t); osc.stop(t+0.3); break;
                case 'bossRoar':
                    osc.type='sawtooth'; osc.frequency.setValueAtTime(80,t);
                    osc.frequency.setValueAtTime(120,t+0.2); osc.frequency.setValueAtTime(60,t+0.5);
                    gain.gain.setValueAtTime(0.15,t); gain.gain.exponentialRampToValueAtTime(0.001,t+0.8);
                    osc.start(t); osc.stop(t+0.8); break;
            }
        } catch (e) {}
    }

    // ==================== EVENTS ====================
    initEvents() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.goHome());
        document.getElementById('bgm-toggle').addEventListener('click', () => this.toggleBGM());

        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = !!document.pointerLockElement;
            // Don't auto-pause on mobile or Capacitor
            if (!this.isPointerLocked && this.isPlaying && !this.isDead && !this.isMobile) {
                // Only pause if pointer lock was actually available and lost
                if (document.pointerLockElement !== undefined) {
                    this.pauseGame();
                }
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || !this.isPlaying) return;
            this.yawObject.rotation.y -= (e.movementX || 0) * this.mouseSensitivity;
            this.pitchObject.rotation.x -= (e.movementY || 0) * this.mouseSensitivity;
            this.pitchObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitchObject.rotation.x));
        });

        document.addEventListener('mousedown', (e) => {
            if (!this.isPlaying || this.isDead) return;
            if (e.button === 0) {
                if (!this.isPointerLocked && !this.isMobile) { 
                    try { this.renderer.domElement.requestPointerLock(); } catch(e) {}
                    return; 
                }
                this.shoot(); this.mouseDown = true;
            }
        });
        document.addEventListener('mouseup', (e) => { if (e.button === 0) this.mouseDown = false; });

        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isDead) return;
            switch (e.code) {
                case 'KeyW': this.moveForward=true; break;
                case 'KeyS': this.moveBackward=true; break;
                case 'KeyA': this.moveLeft=true; break;
                case 'KeyD': this.moveRight=true; break;
                case 'ShiftLeft': case 'ShiftRight': this.isSprinting=true; break;
                case 'KeyR': this.reload(); break;
                case 'Digit1': this.switchWeapon(0); break;
                case 'Digit2': this.switchWeapon(1); break;
                case 'Digit3': this.switchWeapon(2); break;
                case 'Digit4': this.switchWeapon(3); break;
                case 'Digit5': this.switchWeapon(4); break;
                case 'Digit6': this.switchWeapon(5); break;
                case 'KeyM': this.toggleBGM(); break;
                case 'Escape': if (this.isPlaying && !this.isPaused) this.pauseGame(); break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': this.moveForward=false; break;
                case 'KeyS': this.moveBackward=false; break;
                case 'KeyA': this.moveLeft=false; break;
                case 'KeyD': this.moveRight=false; break;
                case 'ShiftLeft': case 'ShiftRight': this.isSprinting=false; break;
            }
        });

        document.addEventListener('contextmenu', e => e.preventDefault());

        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.addEventListener('click', () => this.switchWeapon(parseInt(slot.dataset.weapon)));
        });
    }

    // ==================== MOBILE ====================
    initMobileControls() {
        if (!this.isMobile) return;

        const joystickBase = document.getElementById('joystick-base');
        const joystickThumb = document.getElementById('joystick-thumb');
        const joystickZone = document.getElementById('joystick-zone');
        let joystickTouchId = null, joystickCenterX = 0, joystickCenterY = 0;

        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0]; joystickTouchId = touch.identifier;
            const rect = joystickBase.getBoundingClientRect();
            joystickCenterX = rect.left + rect.width/2; joystickCenterY = rect.top + rect.height/2;
            this.joystickActive = true;
        }, { passive: false });

        joystickZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === joystickTouchId) {
                    const dx = touch.clientX - joystickCenterX, dy = touch.clientY - joystickCenterY;
                    const maxDist = 40; const dist = Math.sqrt(dx*dx+dy*dy);
                    const clampDist = Math.min(dist, maxDist);
                    const angle = Math.atan2(dy, dx);
                    const thumbX = Math.cos(angle)*clampDist, thumbY = Math.sin(angle)*clampDist;
                    joystickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;
                    this.joystickDir.x = thumbX/maxDist; this.joystickDir.y = thumbY/maxDist;
                }
            }
        }, { passive: false });

        const resetJoystick = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === joystickTouchId) {
                    joystickTouchId = null; this.joystickActive = false;
                    this.joystickDir = {x:0,y:0};
                    joystickThumb.style.transform = 'translate(-50%, -50%)';
                }
            }
        };
        joystickZone.addEventListener('touchend', resetJoystick);
        joystickZone.addEventListener('touchcancel', resetJoystick);

        // Shoot button
        let shootInterval = null;
        document.getElementById('btn-shoot').addEventListener('touchstart', (e) => {
            e.preventDefault(); this.mobileShoot = true; this.shoot();
            const weapon = this.weapons[this.currentWeapon];
            if (weapon.auto) shootInterval = setInterval(() => this.shoot(), weapon.fireRate + 10);
        }, { passive: false });
        document.getElementById('btn-shoot').addEventListener('touchend', () => {
            this.mobileShoot = false;
            if (shootInterval) { clearInterval(shootInterval); shootInterval = null; }
        });

        document.getElementById('btn-reload').addEventListener('touchstart', (e) => { e.preventDefault(); this.reload(); }, { passive: false });
        document.getElementById('btn-weapon').addEventListener('touchstart', (e) => { e.preventDefault(); this.switchWeapon((this.currentWeapon+1)%6); }, { passive: false });

        // Touch look
        const canvas = this.renderer.domElement;
        let lookTouchId = null;
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault(); const touch = e.changedTouches[0];
            lookTouchId = touch.identifier; this.lastTouchX = touch.clientX; this.lastTouchY = touch.clientY;
            this.touchLookActive = true;
        }, { passive: false });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === lookTouchId && this.touchLookActive) {
                    this.yawObject.rotation.y -= (touch.clientX - this.lastTouchX) * 0.004;
                    this.pitchObject.rotation.x -= (touch.clientY - this.lastTouchY) * 0.004;
                    this.pitchObject.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitchObject.rotation.x));
                    this.lastTouchX = touch.clientX; this.lastTouchY = touch.clientY;
                }
            }
        }, { passive: false });
        const resetLook = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === lookTouchId) { lookTouchId = null; this.touchLookActive = false; }
            }
        };
        canvas.addEventListener('touchend', resetLook);
        canvas.addEventListener('touchcancel', resetLook);
    }

    // ==================== GAME FLOW ====================
    startGame() {
        this.initAudio();

        // Clear previous world
        this.clearWorld();

        // Reset state
        this.isPlaying = true; this.isDead = false; this.isPaused = false;
        this.health = this.maxHealth; this.score = 0; this.kills = 0; this.wave = 1;
        this.currentBoss = null; this.bossPhase = 0; this.bossAttackTimer = 0;

        this.weapons.forEach(w => w.ammo = w.maxAmmo);
        this.currentWeapon = 0; this.createWeaponMesh();

        this.enemies.forEach(e => this.scene.remove(e.mesh)); this.enemies = [];
        this.pickups.forEach(p => this.scene.remove(p.mesh)); this.pickups = [];
        this.particles.forEach(p => this.scene.remove(p.mesh)); this.particles = [];
        this.bossProjectiles.forEach(p => this.scene.remove(p.mesh)); this.bossProjectiles = [];

        // Load selected map
        this.loadMap(this.selectedMap);

        // Reset player
        this.yawObject.position.set(0, 1.7, this.arenaSize * 0.6);
        this.pitchObject.rotation.x = 0; this.yawObject.rotation.y = 0;

        // UI
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('boss-bar').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        if (this.isMobile) document.getElementById('mobile-controls').classList.remove('hidden');

        document.querySelectorAll('.weapon-slot').forEach((el, i) => el.classList.toggle('active', i === 0));
        this.updateHUD();

        if (!this.isMobile) {
            try { this.renderer.domElement.requestPointerLock(); } catch(e) {}
        }

        this.startWave(1);

        this.pickupInterval = setInterval(() => {
            if (this.isPlaying && !this.isDead) this.spawnPickup();
        }, 10000);

        // Start BGM
        if (this.bgmEnabled) { this.bgmPlaying = true; this.initBGM(); }
    }

    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-screen').classList.remove('hidden');
        if (document.pointerLockElement) document.exitPointerLock();
        this.stopBGM();
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-screen').classList.add('hidden');
        if (!this.isMobile) {
            try { this.renderer.domElement.requestPointerLock(); } catch(e) {}
        }
        if (this.bgmEnabled) { this.bgmPlaying = true; this.playBGM(); }
    }

    goHome() {
        this.isPlaying = false; this.isDead = false; this.isPaused = false;
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.pickupInterval) clearInterval(this.pickupInterval);
        this.stopBGM();
        this.enemies.forEach(e => this.scene.remove(e.mesh)); this.enemies = [];
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
        document.getElementById('boss-bar').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        if (document.pointerLockElement) document.exitPointerLock();
    }

    // ==================== GAME LOOP ====================
    animate() {
        requestAnimationFrame(() => this.animate());
        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.isPlaying && !this.isPaused && !this.isDead) {
            this.updateMovement(delta);
            this.updateEnemies(delta);
            this.updateBossProjectiles(delta);
            this.updatePickups();
            this.updateParticles(delta);
            this.updateWeaponAnimation(delta);

            // Auto-fire
            if (this.mouseDown && this.weapons[this.currentWeapon].auto && (this.isPointerLocked || this.isMobile)) {
                this.shoot();
            }

            // Minigun barrel rotation
            if (this.currentWeapon === 5 && this.mouseDown && this.weaponMesh) {
                this.weaponMesh.children.forEach((child, i) => {
                    if (i >= 1 && i <= 6) child.rotation.z += 0.3;
                });
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateMovement(delta) {
        const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
        const direction = new THREE.Vector3();

        if (this.moveForward) direction.z -= 1;
        if (this.moveBackward) direction.z += 1;
        if (this.moveLeft) direction.x -= 1;
        if (this.moveRight) direction.x += 1;
        if (this.joystickActive) { direction.x += this.joystickDir.x; direction.z += this.joystickDir.y; }

        direction.normalize();
        if (direction.length() > 0) {
            direction.applyAxisAngle(new THREE.Vector3(0,1,0), this.yawObject.rotation.y);
            const newPos = this.yawObject.position.clone();
            newPos.x += direction.x * speed * delta;
            newPos.z += direction.z * speed * delta;
            const half = this.arenaSize - 1;
            newPos.x = Math.max(-half, Math.min(half, newPos.x));
            newPos.z = Math.max(-half, Math.min(half, newPos.z));

            let canMove = true;
            for (const obs of this.obstacles) {
                const colRadius = obs.userData.collisionRadius || 1.5;
                const dist = new THREE.Vector2(newPos.x - obs.position.x, newPos.z - obs.position.z).length();
                if (dist < colRadius) { canMove = false; break; }
            }
            if (canMove) { this.yawObject.position.copy(newPos); this.yawObject.position.y = 1.7; }
        }
    }

    updateWeaponAnimation(delta) {
        if (!this.weaponMesh) return;
        if (this.weaponRecoil > 0) {
            this.weaponMesh.position.z += this.weaponRecoil;
            this.weaponRecoil *= 0.85;
            if (this.weaponRecoil < 0.001) this.weaponRecoil = 0;
        }
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight || this.joystickActive) {
            const bobSpeed = this.isSprinting ? 12 : 8;
            this.weaponMesh.position.y += Math.sin(Date.now()*0.001*bobSpeed) * 0.003;
            this.weaponMesh.position.x += Math.cos(Date.now()*0.001*bobSpeed*0.5) * 0.0015;
        }
    }
}

// LAUNCH
window.addEventListener('DOMContentLoaded', () => { window.game = new HeheFPS(); });
