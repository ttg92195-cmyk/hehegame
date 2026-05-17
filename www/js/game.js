// ============================================================
// 🔫 HEHE FPS - 3D First Person Shooter Game Engine
// Built with Three.js | Mobile + Desktop Support
// ============================================================

class HeheFPS {
    constructor() {
        // === Core ===
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.clock = new THREE.Clock();

        // === Game State ===
        this.isPlaying = false;
        this.isPaused = false;
        this.isDead = false;
        this.score = 0;
        this.kills = 0;
        this.wave = 1;
        this.enemiesRemaining = 0;
        this.enemiesSpawned = 0;
        this.enemiesPerWave = 5;
        this.waveDelay = false;
        this.bestScore = parseInt(localStorage.getItem('heheFPSBest')) || 0;

        // === Player ===
        this.health = 100;
        this.maxHealth = 100;
        this.moveSpeed = 8;
        this.sprintSpeed = 14;
        this.isSprinting = false;
        this.velocity = new THREE.Vector3();
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;

        // === Camera ===
        this.euler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.pitchObject = new THREE.Object3D();
        this.yawObject = new THREE.Object3D();
        this.mouseSensitivity = 0.002;
        this.isPointerLocked = false;

        // === Weapons ===
        this.weapons = [
            { name: 'PISTOL', damage: 25, fireRate: 300, ammo: 12, maxAmmo: 12, reloadTime: 1500, spread: 0.02, pellets: 1, auto: false },
            { name: 'RIFLE', damage: 15, fireRate: 100, ammo: 30, maxAmmo: 30, reloadTime: 2000, spread: 0.04, pellets: 1, auto: true },
            { name: 'SHOTGUN', damage: 12, fireRate: 800, ammo: 6, maxAmmo: 6, reloadTime: 2500, spread: 0.12, pellets: 8, auto: false }
        ];
        this.currentWeapon = 0;
        this.lastFireTime = 0;
        this.isReloading = false;
        this.reloadStartTime = 0;
        this.weaponMesh = null;
        this.weaponRecoil = 0;

        // === Enemies ===
        this.enemies = [];
        this.enemyMeshes = [];
        this.enemyTypes = {
            basic:  { health: 50, speed: 3, damage: 10, color: 0xff4444, size: 1, score: 100 },
            fast:   { health: 30, speed: 6, damage: 8,  color: 0x44ff44, size: 0.8, score: 150 },
            tank:   { health: 150, speed: 1.5, damage: 20, color: 0x4444ff, size: 1.5, score: 250 },
            boss:   { health: 500, speed: 2, damage: 30, color: 0xff8800, size: 2.5, score: 1000 }
        };

        // === World ===
        this.arenaSize = 50;
        this.walls = [];
        this.obstacles = [];
        this.pickups = [];

        // === Effects ===
        this.particles = [];
        this.muzzleFlash = null;
        this.bulletTrails = [];

        // === Mobile ===
        this.isMobile = /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent) || window.innerWidth <= 768;
        this.joystickActive = false;
        this.joystickDir = { x: 0, y: 0 };
        this.touchLookActive = false;
        this.lastTouchX = 0;
        this.lastTouchY = 0;
        this.mobileShoot = false;

        // === Raycaster ===
        this.raycaster = new THREE.Raycaster();

        // === Audio ===
        this.audioCtx = null;

        // === Init ===
        this.init();
    }

    init() {
        this.showLoading();
        this.initThree();
        this.initWorld();
        this.initPlayer();
        this.initWeapons();
        this.initEvents();
        this.initMobileControls();

        // Fake loading
        let progress = 0;
        const loadInterval = setInterval(() => {
            progress += Math.random() * 15 + 5;
            if (progress >= 100) {
                progress = 100;
                clearInterval(loadInterval);
                setTimeout(() => {
                    document.getElementById('loading-screen').classList.add('hidden');
                    document.getElementById('start-screen').classList.remove('hidden');
                }, 500);
            }
            document.getElementById('load-bar').style.width = progress + '%';
            document.getElementById('load-text').textContent = `Loading ${Math.floor(progress)}%`;
        }, 200);

        // Start render loop
        this.animate();
    }

    showLoading() {
        document.getElementById('loading-screen').classList.remove('hidden');
    }

    // ========================
    // THREE.JS INITIALIZATION
    // ========================
    initThree() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111122);
        this.scene.fog = new THREE.Fog(0x111122, 30, 80);

        // Camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);

        // Camera rig (pitch + yaw)
        this.pitchObject.add(this.camera);
        this.yawObject.add(this.pitchObject);
        this.yawObject.position.set(0, 1.7, 0);
        this.scene.add(this.yawObject);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.getElementById('game-canvas-container').appendChild(this.renderer.domElement);

        // Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    // ========================
    // WORLD GENERATION
    // ========================
    initWorld() {
        // === Ground ===
        const groundGeo = new THREE.PlaneGeometry(this.arenaSize * 2, this.arenaSize * 2);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x222233,
            roughness: 0.9,
            metalness: 0.1
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // === Grid on ground ===
        const gridHelper = new THREE.GridHelper(this.arenaSize * 2, 40, 0x333344, 0x222233);
        this.scene.add(gridHelper);

        // === Walls ===
        this.createWalls();

        // === Obstacles (crates, barriers) ===
        this.createObstacles();

        // === Lighting ===
        const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
        this.scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffeedd, 0.8);
        dirLight.position.set(20, 30, 10);
        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 1024;
        dirLight.shadow.mapSize.height = 1024;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 100;
        dirLight.shadow.camera.left = -50;
        dirLight.shadow.camera.right = 50;
        dirLight.shadow.camera.top = 50;
        dirLight.shadow.camera.bottom = -50;
        this.scene.add(dirLight);

        // Red point lights for atmosphere
        const positions = [[-20, 5, -20], [20, 5, 20], [-20, 5, 20], [20, 5, -20]];
        positions.forEach(pos => {
            const light = new THREE.PointLight(0xff4444, 0.5, 30);
            light.position.set(...pos);
            this.scene.add(light);
        });

        // Center light
        const centerLight = new THREE.PointLight(0xff8800, 0.8, 40);
        centerLight.position.set(0, 8, 0);
        this.scene.add(centerLight);
    }

    createWalls() {
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x333355, roughness: 0.7, metalness: 0.3 });
        const half = this.arenaSize;
        const wallHeight = 6;

        const wallConfigs = [
            { w: half * 2, h: wallHeight, d: 1, x: 0, y: wallHeight / 2, z: -half },
            { w: half * 2, h: wallHeight, d: 1, x: 0, y: wallHeight / 2, z: half },
            { w: 1, h: wallHeight, d: half * 2, x: -half, y: wallHeight / 2, z: 0 },
            { w: 1, h: wallHeight, d: half * 2, x: half, y: wallHeight / 2, z: 0 },
        ];

        wallConfigs.forEach(cfg => {
            const geo = new THREE.BoxGeometry(cfg.w, cfg.h, cfg.d);
            const mesh = new THREE.Mesh(geo, wallMat);
            mesh.position.set(cfg.x, cfg.y, cfg.z);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            this.scene.add(mesh);
            this.walls.push(mesh);
        });

        // Neon strips on walls
        const neonMat = new THREE.MeshBasicMaterial({ color: 0xff4444 });
        wallConfigs.forEach(cfg => {
            const stripGeo = new THREE.BoxGeometry(cfg.w * 0.98, 0.2, cfg.d * 0.98);
            const strip = new THREE.Mesh(stripGeo, neonMat);
            strip.position.set(cfg.x, wallHeight - 0.5, cfg.z);
            this.scene.add(strip);
        });
    }

    createObstacles() {
        const crateMat = new THREE.MeshStandardMaterial({ color: 0x554433, roughness: 0.8, metalness: 0.2 });
        const metalMat = new THREE.MeshStandardMaterial({ color: 0x445566, roughness: 0.3, metalness: 0.8 });

        // Crates
        const cratePositions = [
            [-10, 1, -10], [8, 1, -15], [-15, 1, 8], [12, 1, 12],
            [-5, 1, 5], [5, 1, -5], [-18, 1, -18], [18, 1, 18],
            [0, 1, -20], [-20, 1, 0], [15, 1, -8], [-8, 1, 15],
            [22, 1, 5], [-5, 1, -25], [25, 1, -20], [-25, 1, 20],
        ];

        cratePositions.forEach(pos => {
            const size = 1 + Math.random() * 1;
            const geo = new THREE.BoxGeometry(size, size, size);
            const mesh = new THREE.Mesh(geo, Math.random() > 0.5 ? crateMat : metalMat);
            mesh.position.set(...pos);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        });

        // Barriers (low walls)
        const barrierMat = new THREE.MeshStandardMaterial({ color: 0x445544, roughness: 0.6, metalness: 0.4 });
        const barrierPositions = [
            { x: -5, z: -12, ry: 0 },
            { x: 10, z: 5, ry: Math.PI / 4 },
            { x: -15, z: -5, ry: Math.PI / 2 },
            { x: 0, z: 15, ry: Math.PI / 3 },
        ];

        barrierPositions.forEach(cfg => {
            const geo = new THREE.BoxGeometry(5, 1.2, 0.5);
            const mesh = new THREE.Mesh(geo, barrierMat);
            mesh.position.set(cfg.x, 0.6, cfg.z);
            mesh.rotation.y = cfg.ry;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        });

        // Columns
        const colMat = new THREE.MeshStandardMaterial({ color: 0x556677, roughness: 0.5, metalness: 0.5 });
        const colPositions = [[-12, 0, -12], [12, 0, -12], [-12, 0, 12], [12, 0, 12]];
        colPositions.forEach(pos => {
            const geo = new THREE.CylinderGeometry(0.8, 0.8, 5, 8);
            const mesh = new THREE.Mesh(geo, colMat);
            mesh.position.set(pos[0], 2.5, pos[2]);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.isObstacle = true;
            this.scene.add(mesh);
            this.obstacles.push(mesh);
        });
    }

    // ========================
    // PLAYER
    // ========================
    initPlayer() {
        this.yawObject.position.set(0, 1.7, 20);
    }

    // ========================
    // WEAPONS
    // ========================
    initWeapons() {
        this.createWeaponMesh();
    }

    createWeaponMesh() {
        if (this.weaponMesh) {
            this.camera.remove(this.weaponMesh);
        }

        const group = new THREE.Group();
        const gunColors = [0x444444, 0x556655, 0x665544];
        const color = gunColors[this.currentWeapon];

        const bodyMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.4, metalness: 0.8 });

        if (this.currentWeapon === 0) {
            // Pistol
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.12, 0.25), bodyMat);
            body.position.set(0, 0, -0.1);
            group.add(body);
            const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.2), bodyMat);
            barrel.position.set(0, 0.04, -0.25);
            group.add(barrel);
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), bodyMat);
            grip.position.set(0, -0.08, -0.02);
            grip.rotation.x = -0.3;
            group.add(grip);
            group.position.set(0.25, -0.2, -0.4);
        } else if (this.currentWeapon === 1) {
            // Rifle
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.1, 0.5), bodyMat);
            body.position.set(0, 0, -0.2);
            group.add(body);
            const barrel = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.035, 0.3), bodyMat);
            barrel.position.set(0, 0.03, -0.5);
            group.add(barrel);
            const stock = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.08, 0.15), bodyMat);
            stock.position.set(0, -0.02, 0.1);
            group.add(stock);
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.1, 0.05), bodyMat);
            grip.position.set(0, -0.08, -0.05);
            grip.rotation.x = -0.3;
            group.add(grip);
            const mag = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.12, 0.04), bodyMat);
            mag.position.set(0, -0.12, -0.15);
            group.add(mag);
            group.position.set(0.28, -0.22, -0.4);
        } else {
            // Shotgun
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, 0.45), bodyMat);
            body.position.set(0, 0, -0.18);
            group.add(body);
            const barrel1 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), bodyMat);
            barrel1.rotation.x = Math.PI / 2;
            barrel1.position.set(-0.02, 0.04, -0.45);
            group.add(barrel1);
            const barrel2 = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.35, 6), bodyMat);
            barrel2.rotation.x = Math.PI / 2;
            barrel2.position.set(0.02, 0.04, -0.45);
            group.add(barrel2);
            const grip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.1, 0.06), bodyMat);
            grip.position.set(0, -0.08, 0);
            grip.rotation.x = -0.3;
            group.add(grip);
            const pump = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.1), bodyMat);
            pump.position.set(0, 0, -0.28);
            group.add(pump);
            group.position.set(0.25, -0.22, -0.4);
        }

        // Muzzle flash
        const flashGeo = new THREE.SphereGeometry(0.08, 8, 8);
        const flashMat = new THREE.MeshBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0 });
        this.muzzleFlash = new THREE.Mesh(flashGeo, flashMat);
        this.muzzleFlash.position.set(0, 0.04, -0.6);
        group.add(this.muzzleFlash);

        this.weaponMesh = group;
        this.camera.add(this.weaponMesh);
    }

    switchWeapon(index) {
        if (index === this.currentWeapon || this.isReloading) return;
        this.currentWeapon = index;
        this.createWeaponMesh();
        this.updateHUD();

        // Update weapon selector UI
        document.querySelectorAll('.weapon-slot').forEach((el, i) => {
            el.classList.toggle('active', i === index);
        });
    }

    shoot() {
        const weapon = this.weapons[this.currentWeapon];
        const now = Date.now();

        if (this.isReloading) return;
        if (now - this.lastFireTime < weapon.fireRate) return;
        if (weapon.ammo <= 0) {
            this.reload();
            return;
        }

        this.lastFireTime = now;
        weapon.ammo--;

        // Sound
        this.playSound('shoot');

        // Muzzle flash
        if (this.muzzleFlash) {
            this.muzzleFlash.material.opacity = 1;
            setTimeout(() => { if (this.muzzleFlash) this.muzzleFlash.material.opacity = 0; }, 50);
        }

        // Recoil
        this.weaponRecoil = 0.05;

        // Camera recoil
        this.pitchObject.rotation.x += 0.01;

        // Shoot pellets
        for (let i = 0; i < weapon.pellets; i++) {
            const direction = new THREE.Vector3(0, 0, -1);
            direction.x += (Math.random() - 0.5) * weapon.spread;
            direction.y += (Math.random() - 0.5) * weapon.spread;
            direction.applyQuaternion(this.camera.getWorldQuaternion(new THREE.Quaternion()));
            direction.normalize();

            this.raycaster.set(this.camera.getWorldPosition(new THREE.Vector3()), direction);
            this.raycaster.far = 100;

            // Check enemy hits
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
                // Hit wall/obstacle
                const wallHits = this.raycaster.intersectObjects([...this.walls, ...this.obstacles]);
                if (wallHits.length > 0) {
                    this.spawnParticles(wallHits[0].point, 0xffaa00, 3);
                    this.createBulletHole(wallHits[0]);
                }
            }

            // Bullet trail
            this.createBulletTrail(direction);
        }

        this.updateHUD();

        // Auto reload
        if (weapon.ammo <= 0) {
            setTimeout(() => this.reload(), 300);
        }
    }

    reload() {
        const weapon = this.weapons[this.currentWeapon];
        if (this.isReloading || weapon.ammo === weapon.maxAmmo) return;

        this.isReloading = true;
        this.reloadStartTime = Date.now();
        this.playSound('reload');

        // Animate weapon down
        if (this.weaponMesh) {
            this.weaponMesh.rotation.x = -0.5;
        }

        setTimeout(() => {
            weapon.ammo = weapon.maxAmmo;
            this.isReloading = false;
            if (this.weaponMesh) {
                this.weaponMesh.rotation.x = 0;
            }
            this.updateHUD();
        }, weapon.reloadTime);
    }

    hitEnemy(enemy, damage) {
        enemy.health -= damage;
        // Flash enemy red
        if (enemy.mesh.material) {
            const origColor = enemy.mesh.material.color.getHex();
            enemy.mesh.material.color.setHex(0xffffff);
            setTimeout(() => {
                if (enemy.mesh.material) enemy.mesh.material.color.setHex(origColor);
            }, 80);
        }

        if (enemy.health <= 0) {
            this.killEnemy(enemy);
        }
    }

    killEnemy(enemy) {
        this.score += enemy.type.score;
        this.kills++;
        this.enemiesRemaining--;

        // Death particles
        this.spawnParticles(enemy.mesh.position, enemy.type.color, 15);

        // Remove mesh
        this.scene.remove(enemy.mesh);

        // Remove from array
        const idx = this.enemies.indexOf(enemy);
        if (idx > -1) this.enemies.splice(idx, 1);

        // Kill feed
        this.addKillFeed(enemy.typeName);

        // Sound
        this.playSound('kill');

        this.updateHUD();

        // Check wave complete
        if (this.enemiesRemaining <= 0 && this.enemies.length === 0) {
            this.nextWave();
        }
    }

    // ========================
    // ENEMIES
    // ========================
    spawnEnemy(type = 'basic') {
        const enemyType = this.enemyTypes[type];
        if (!enemyType) return;

        const size = enemyType.size;
        const geo = new THREE.BoxGeometry(size, size * 1.5, size);
        const mat = new THREE.MeshStandardMaterial({
            color: enemyType.color,
            roughness: 0.6,
            metalness: 0.4,
            emissive: enemyType.color,
            emissiveIntensity: 0.2
        });
        const mesh = new THREE.Mesh(geo, mat);

        // Eyes
        const eyeGeo = new THREE.SphereGeometry(size * 0.15, 6, 6);
        const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const eye1 = new THREE.Mesh(eyeGeo, eyeMat);
        eye1.position.set(-size * 0.2, size * 0.3, -size * 0.5);
        mesh.add(eye1);
        const eye2 = new THREE.Mesh(eyeGeo, eyeMat);
        eye2.position.set(size * 0.2, size * 0.3, -size * 0.5);
        mesh.add(eye2);

        // Pupils
        const pupilGeo = new THREE.SphereGeometry(size * 0.07, 6, 6);
        const pupilMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const pupil1 = new THREE.Mesh(pupilGeo, pupilMat);
        pupil1.position.set(0, 0, -size * 0.08);
        eye1.add(pupil1);
        const pupil2 = new THREE.Mesh(pupilGeo, pupilMat);
        pupil2.position.set(0, 0, -size * 0.08);
        eye2.add(pupil2);

        // Random spawn position (away from player)
        let spawnPos;
        do {
            const angle = Math.random() * Math.PI * 2;
            const dist = 20 + Math.random() * 20;
            spawnPos = new THREE.Vector3(
                Math.cos(angle) * dist,
                size * 0.75,
                Math.sin(angle) * dist
            );
        } while (spawnPos.distanceTo(this.yawObject.position) < 15);

        // Clamp to arena
        const half = this.arenaSize - 2;
        spawnPos.x = Math.max(-half, Math.min(half, spawnPos.x));
        spawnPos.z = Math.max(-half, Math.min(half, spawnPos.z));

        mesh.position.copy(spawnPos);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const enemy = {
            mesh: mesh,
            health: enemyType.health,
            maxHealth: enemyType.health,
            speed: enemyType.speed,
            damage: enemyType.damage,
            type: enemyType,
            typeName: type.toUpperCase(),
            lastAttack: 0,
            attackCooldown: 1000,
            hitFlash: 0
        };

        this.enemies.push(enemy);
    }

    updateEnemies(delta) {
        this.enemies.forEach(enemy => {
            // Move toward player
            const playerPos = this.yawObject.position.clone();
            playerPos.y = 0;
            const enemyPos = enemy.mesh.position.clone();
            enemyPos.y = 0;
            const direction = playerPos.sub(enemyPos).normalize();

            // Face player
            enemy.mesh.lookAt(new THREE.Vector3(
                this.yawObject.position.x,
                enemy.mesh.position.y,
                this.yawObject.position.z
            ));

            // Move
            const moveDir = direction.multiplyScalar(enemy.speed * delta);
            const newPos = enemy.mesh.position.clone().add(moveDir);

            // Clamp to arena
            const half = this.arenaSize - 1;
            newPos.x = Math.max(-half, Math.min(half, newPos.x));
            newPos.z = Math.max(-half, Math.min(half, newPos.z));

            // Simple obstacle avoidance
            let blocked = false;
            for (const obs of this.obstacles) {
                const dist = newPos.distanceTo(obs.position);
                if (dist < 1.5) {
                    blocked = true;
                    // Try to go around
                    const perp = new THREE.Vector3(-direction.z, 0, direction.x);
                    newPos.add(perp.multiplyScalar(2 * delta * enemy.speed));
                    break;
                }
            }

            enemy.mesh.position.copy(newPos);

            // Bobbing animation
            enemy.mesh.position.y = enemy.type.size * 0.75 + Math.sin(Date.now() * 0.005 + enemy.mesh.id) * 0.1;

            // Attack player
            const distToPlayer = enemy.mesh.position.distanceTo(this.yawObject.position);
            if (distToPlayer < 2) {
                const now = Date.now();
                if (now - enemy.lastAttack > enemy.attackCooldown) {
                    enemy.lastAttack = now;
                    this.takeDamage(enemy.damage);
                }
            }

            // Enemy hit flash decay
            if (enemy.hitFlash > 0) {
                enemy.hitFlash -= delta * 5;
            }
        });
    }

    // ========================
    // WAVE SYSTEM
    // ========================
    startWave(waveNum) {
        this.wave = waveNum;
        this.enemiesPerWave = 3 + waveNum * 2;
        this.enemiesRemaining = this.enemiesPerWave;
        this.enemiesSpawned = 0;
        this.waveDelay = false;

        // Wave announcement
        this.showWaveAnnounce(waveNum);
        this.updateHUD();

        // Spawn enemies over time
        this.spawnInterval = setInterval(() => {
            if (this.enemiesSpawned >= this.enemiesPerWave || this.isDead) {
                clearInterval(this.spawnInterval);
                return;
            }

            // Determine enemy type
            let type = 'basic';
            const rand = Math.random();
            if (waveNum >= 3 && rand < 0.15) type = 'tank';
            else if (waveNum >= 2 && rand < 0.35) type = 'fast';
            if (waveNum >= 5 && this.enemiesSpawned === this.enemiesPerWave - 1 && rand < 0.3) type = 'boss';

            this.spawnEnemy(type);
            this.enemiesSpawned++;
        }, 1500);
    }

    nextWave() {
        this.waveDelay = true;

        // Health bonus
        this.health = Math.min(this.maxHealth, this.health + 20);
        this.updateHUD();

        setTimeout(() => {
            if (!this.isDead) {
                this.startWave(this.wave + 1);
            }
        }, 3000);
    }

    // ========================
    // PICKUPS
    // ========================
    spawnPickup() {
        if (this.pickups.length > 3) return;

        const type = Math.random() > 0.5 ? 'health' : 'ammo';
        const geo = type === 'health'
            ? new THREE.OctahedronGeometry(0.4, 0)
            : new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const mat = new THREE.MeshStandardMaterial({
            color: type === 'health' ? 0x44ff44 : 0x4488ff,
            emissive: type === 'health' ? 0x44ff44 : 0x4488ff,
            emissiveIntensity: 0.5,
            roughness: 0.3,
            metalness: 0.8
        });
        const mesh = new THREE.Mesh(geo, mat);

        const half = this.arenaSize - 5;
        mesh.position.set(
            (Math.random() - 0.5) * half * 2,
            0.5,
            (Math.random() - 0.5) * half * 2
        );

        this.scene.add(mesh);
        this.pickups.push({ mesh, type, bobOffset: Math.random() * Math.PI * 2 });
    }

    updatePickups() {
        this.pickups = this.pickups.filter(pickup => {
            // Bob animation
            pickup.mesh.position.y = 0.5 + Math.sin(Date.now() * 0.003 + pickup.bobOffset) * 0.2;
            pickup.mesh.rotation.y += 0.02;

            // Check player proximity
            const dist = pickup.mesh.position.distanceTo(this.yawObject.position);
            if (dist < 1.5) {
                if (pickup.type === 'health') {
                    this.health = Math.min(this.maxHealth, this.health + 25);
                    this.playSound('pickup');
                } else {
                    this.weapons[this.currentWeapon].ammo = this.weapons[this.currentWeapon].maxAmmo;
                    this.playSound('pickup');
                }
                this.scene.remove(pickup.mesh);
                this.updateHUD();
                return false;
            }
            return true;
        });
    }

    // ========================
    // PLAYER DAMAGE
    // ========================
    takeDamage(amount) {
        if (this.isDead) return;
        this.health -= amount;
        this.health = Math.max(0, this.health);

        // Damage overlay
        const overlay = document.getElementById('damage-overlay');
        overlay.classList.add('hit');
        setTimeout(() => overlay.classList.remove('hit'), 200);

        // Camera shake
        this.pitchObject.rotation.x += (Math.random() - 0.5) * 0.05;
        this.yawObject.rotation.y += (Math.random() - 0.5) * 0.05;

        this.playSound('hit');
        this.updateHUD();

        if (this.health <= 0) {
            this.die();
        }
    }

    die() {
        this.isDead = true;
        this.isPlaying = false;

        // Clear spawn interval
        if (this.spawnInterval) clearInterval(this.spawnInterval);

        // Exit pointer lock
        if (document.pointerLockElement) document.exitPointerLock();

        // Update best score
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            localStorage.setItem('heheFPSBest', this.bestScore);
        }

        // Show game over
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
        document.getElementById('go-score').textContent = this.score;
        document.getElementById('go-wave').textContent = this.wave;
        document.getElementById('go-kills').textContent = this.kills;
        document.getElementById('go-best').textContent = this.bestScore;
        document.getElementById('gameover-screen').classList.remove('hidden');

        this.playSound('death');
    }

    // ========================
    // EFFECTS
    // ========================
    spawnParticles(position, color, count) {
        for (let i = 0; i < count; i++) {
            const geo = new THREE.SphereGeometry(0.05, 4, 4);
            const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 1 });
            const mesh = new THREE.Mesh(geo, mat);
            mesh.position.copy(position);

            const velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 8,
                Math.random() * 5,
                (Math.random() - 0.5) * 8
            );

            this.scene.add(mesh);
            this.particles.push({ mesh, velocity, life: 1, decay: 0.02 + Math.random() * 0.03 });
        }
    }

    updateParticles(delta) {
        this.particles = this.particles.filter(p => {
            p.velocity.y -= 9.8 * delta;
            p.mesh.position.add(p.velocity.clone().multiplyScalar(delta));
            p.life -= p.decay;
            p.mesh.material.opacity = p.life;
            p.mesh.scale.setScalar(p.life);
            if (p.life <= 0) {
                this.scene.remove(p.mesh);
                return false;
            }
            return true;
        });
    }

    createBulletHole(hit) {
        const geo = new THREE.CircleGeometry(0.05, 8);
        const mat = new THREE.MeshBasicMaterial({ color: 0x111111, side: THREE.DoubleSide });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.copy(hit.point);
        if (hit.face) mesh.lookAt(hit.point.clone().add(hit.face.normal));
        mesh.position.add(hit.face ? hit.face.normal.clone().multiplyScalar(0.01) : new THREE.Vector3());
        this.scene.add(mesh);

        // Remove after 5 seconds
        setTimeout(() => this.scene.remove(mesh), 5000);
    }

    createBulletTrail(direction) {
        const start = this.camera.getWorldPosition(new THREE.Vector3());
        const end = start.clone().add(direction.clone().multiplyScalar(50));

        const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
        const mat = new THREE.LineBasicMaterial({ color: 0xffaa00, transparent: true, opacity: 0.5 });
        const line = new THREE.Line(geo, mat);
        this.scene.add(line);

        setTimeout(() => this.scene.remove(line), 50);
    }

    // ========================
    // HUD
    // ========================
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

        // Health bar color
        const healthPct = this.health / this.maxHealth;
        const healthBar = document.getElementById('health-bar');
        if (healthPct > 0.5) {
            healthBar.style.background = 'linear-gradient(90deg, #44ff44, #00cc00)';
        } else if (healthPct > 0.25) {
            healthBar.style.background = 'linear-gradient(90deg, #ffaa00, #ff8800)';
        } else {
            healthBar.style.background = 'linear-gradient(90deg, #ff4444, #ff0000)';
        }

        // Low ammo warning
        const ammoCurrent = document.getElementById('ammo-current');
        ammoCurrent.style.color = weapon.ammo <= weapon.maxAmmo * 0.25 ? '#ff4444' : '#ff8800';
    }

    showHitMarker() {
        const hm = document.getElementById('hitmarker');
        hm.classList.remove('hidden');
        // Reset animation
        hm.style.animation = 'none';
        hm.offsetHeight; // trigger reflow
        hm.style.animation = '';
        setTimeout(() => hm.classList.add('hidden'), 200);
    }

    showWaveAnnounce(num) {
        const el = document.getElementById('wave-announce');
        document.getElementById('wave-announce-num').textContent = num;
        document.getElementById('wave-sub-text').textContent = num > 1 ? `${3 + num * 2} Enemies Incoming!` : 'Get Ready!';
        el.classList.remove('hidden');
        setTimeout(() => el.classList.add('hidden'), 2500);
    }

    addKillFeed(type) {
        const feed = document.getElementById('kill-feed');
        const entry = document.createElement('div');
        entry.className = 'kill-entry';
        entry.innerHTML = `🔫 You → <span style="color:#ff8800">${type}</span>`;
        feed.appendChild(entry);
        setTimeout(() => entry.remove(), 3000);
    }

    // ========================
    // AUDIO (Web Audio API - Procedural)
    // ========================
    initAudio() {
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    playSound(type) {
        if (!this.audioCtx) return;
        try {
            const osc = this.audioCtx.createOscillator();
            const gain = this.audioCtx.createGain();
            osc.connect(gain);
            gain.connect(this.audioCtx.destination);

            switch (type) {
                case 'shoot':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(200, this.audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(50, this.audioCtx.currentTime + 0.1);
                    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.1);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.1);
                    break;
                case 'hit':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(100, this.audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.15);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.15);
                    break;
                case 'kill':
                    osc.type = 'square';
                    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(800, this.audioCtx.currentTime + 0.05);
                    osc.frequency.exponentialRampToValueAtTime(400, this.audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.2);
                    break;
                case 'reload':
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(400, this.audioCtx.currentTime);
                    osc.frequency.setValueAtTime(600, this.audioCtx.currentTime + 0.1);
                    osc.frequency.setValueAtTime(800, this.audioCtx.currentTime + 0.2);
                    gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.3);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.3);
                    break;
                case 'pickup':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(500, this.audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(1000, this.audioCtx.currentTime + 0.15);
                    gain.gain.setValueAtTime(0.1, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.2);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.2);
                    break;
                case 'death':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
                    osc.frequency.exponentialRampToValueAtTime(30, this.audioCtx.currentTime + 0.8);
                    gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.8);
                    osc.start(this.audioCtx.currentTime);
                    osc.stop(this.audioCtx.currentTime + 0.8);
                    break;
            }
        } catch (e) { /* ignore audio errors */ }
    }

    // ========================
    // EVENTS
    // ========================
    initEvents() {
        // Start button
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('retry-btn').addEventListener('click', () => this.startGame());
        document.getElementById('home-btn').addEventListener('click', () => this.goHome());
        document.getElementById('resume-btn').addEventListener('click', () => this.resumeGame());
        document.getElementById('quit-btn').addEventListener('click', () => this.goHome());

        // Pointer lock
        document.addEventListener('pointerlockchange', () => {
            this.isPointerLocked = !!document.pointerLockElement;
            if (!this.isPointerLocked && this.isPlaying && !this.isDead) {
                this.pauseGame();
            }
        });

        // Mouse move
        document.addEventListener('mousemove', (e) => {
            if (!this.isPointerLocked || !this.isPlaying) return;
            const movementX = e.movementX || 0;
            const movementY = e.movementY || 0;

            this.yawObject.rotation.y -= movementX * this.mouseSensitivity;
            this.pitchObject.rotation.x -= movementY * this.mouseSensitivity;
            this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));
        });

        // Mouse click (shoot)
        document.addEventListener('mousedown', (e) => {
            if (!this.isPlaying || this.isDead) return;

            if (e.button === 0) {
                if (!this.isPointerLocked) {
                    this.renderer.domElement.requestPointerLock();
                    return;
                }
                this.shoot();
                this.mouseDown = true;
            }
        });

        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) this.mouseDown = false;
        });

        // Keyboard
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying || this.isDead) return;
            switch (e.code) {
                case 'KeyW': this.moveForward = true; break;
                case 'KeyS': this.moveBackward = true; break;
                case 'KeyA': this.moveLeft = true; break;
                case 'KeyD': this.moveRight = true; break;
                case 'ShiftLeft': case 'ShiftRight': this.isSprinting = true; break;
                case 'KeyR': this.reload(); break;
                case 'Digit1': this.switchWeapon(0); break;
                case 'Digit2': this.switchWeapon(1); break;
                case 'Digit3': this.switchWeapon(2); break;
                case 'Escape':
                    if (this.isPlaying && !this.isPaused) this.pauseGame();
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            switch (e.code) {
                case 'KeyW': this.moveForward = false; break;
                case 'KeyS': this.moveBackward = false; break;
                case 'KeyA': this.moveLeft = false; break;
                case 'KeyD': this.moveRight = false; break;
                case 'ShiftLeft': case 'ShiftRight': this.isSprinting = false; break;
            }
        });

        // Prevent context menu
        document.addEventListener('contextmenu', e => e.preventDefault());

        // Weapon selector clicks
        document.querySelectorAll('.weapon-slot').forEach(slot => {
            slot.addEventListener('click', () => {
                const idx = parseInt(slot.dataset.weapon);
                this.switchWeapon(idx);
            });
        });
    }

    // ========================
    // MOBILE CONTROLS
    // ========================
    initMobileControls() {
        if (!this.isMobile) return;

        const joystickBase = document.getElementById('joystick-base');
        const joystickThumb = document.getElementById('joystick-thumb');
        const joystickZone = document.getElementById('joystick-zone');

        // Joystick
        let joystickTouchId = null;
        let joystickCenterX = 0;
        let joystickCenterY = 0;

        joystickZone.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            joystickTouchId = touch.identifier;
            const rect = joystickBase.getBoundingClientRect();
            joystickCenterX = rect.left + rect.width / 2;
            joystickCenterY = rect.top + rect.height / 2;
            this.joystickActive = true;
        }, { passive: false });

        joystickZone.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === joystickTouchId) {
                    const dx = touch.clientX - joystickCenterX;
                    const dy = touch.clientY - joystickCenterY;
                    const maxDist = 40;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    const clampDist = Math.min(dist, maxDist);
                    const angle = Math.atan2(dy, dx);

                    const thumbX = Math.cos(angle) * clampDist;
                    const thumbY = Math.sin(angle) * clampDist;

                    joystickThumb.style.transform = `translate(calc(-50% + ${thumbX}px), calc(-50% + ${thumbY}px))`;

                    this.joystickDir.x = thumbX / maxDist;
                    this.joystickDir.y = thumbY / maxDist;
                }
            }
        }, { passive: false });

        const resetJoystick = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === joystickTouchId) {
                    joystickTouchId = null;
                    this.joystickActive = false;
                    this.joystickDir = { x: 0, y: 0 };
                    joystickThumb.style.transform = 'translate(-50%, -50%)';
                }
            }
        };

        joystickZone.addEventListener('touchend', resetJoystick);
        joystickZone.addEventListener('touchcancel', resetJoystick);

        // Shoot button
        const shootBtn = document.getElementById('btn-shoot');
        let shootInterval = null;
        shootBtn.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.mobileShoot = true;
            this.shoot();
            const weapon = this.weapons[this.currentWeapon];
            if (weapon.auto) {
                shootInterval = setInterval(() => this.shoot(), weapon.fireRate + 10);
            }
        }, { passive: false });
        shootBtn.addEventListener('touchend', () => {
            this.mobileShoot = false;
            if (shootInterval) { clearInterval(shootInterval); shootInterval = null; }
        });

        // Reload button
        document.getElementById('btn-reload').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.reload();
        }, { passive: false });

        // Weapon switch
        document.getElementById('btn-weapon').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.switchWeapon((this.currentWeapon + 1) % 3);
        }, { passive: false });

        // Touch look (on canvas)
        const canvas = this.renderer.domElement;
        let lookTouchId = null;

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.changedTouches[0];
            lookTouchId = touch.identifier;
            this.lastTouchX = touch.clientX;
            this.lastTouchY = touch.clientY;
            this.touchLookActive = true;
        }, { passive: false });

        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            for (const touch of e.changedTouches) {
                if (touch.identifier === lookTouchId && this.touchLookActive) {
                    const dx = touch.clientX - this.lastTouchX;
                    const dy = touch.clientY - this.lastTouchY;

                    this.yawObject.rotation.y -= dx * 0.004;
                    this.pitchObject.rotation.x -= dy * 0.004;
                    this.pitchObject.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.pitchObject.rotation.x));

                    this.lastTouchX = touch.clientX;
                    this.lastTouchY = touch.clientY;
                }
            }
        }, { passive: false });

        const resetLook = (e) => {
            for (const touch of e.changedTouches) {
                if (touch.identifier === lookTouchId) {
                    lookTouchId = null;
                    this.touchLookActive = false;
                }
            }
        };
        canvas.addEventListener('touchend', resetLook);
        canvas.addEventListener('touchcancel', resetLook);
    }

    // ========================
    // GAME FLOW
    // ========================
    startGame() {
        this.initAudio();

        // Reset state
        this.isPlaying = true;
        this.isDead = false;
        this.isPaused = false;
        this.health = this.maxHealth;
        this.score = 0;
        this.kills = 0;
        this.wave = 1;

        // Reset weapons ammo
        this.weapons.forEach(w => w.ammo = w.maxAmmo);
        this.currentWeapon = 0;
        this.createWeaponMesh();

        // Clear enemies
        this.enemies.forEach(e => this.scene.remove(e.mesh));
        this.enemies = [];

        // Clear pickups
        this.pickups.forEach(p => this.scene.remove(p.mesh));
        this.pickups = [];

        // Clear particles
        this.particles.forEach(p => this.scene.remove(p.mesh));
        this.particles = [];

        // Reset player position
        this.yawObject.position.set(0, 1.7, 20);
        this.pitchObject.rotation.x = 0;
        this.yawObject.rotation.y = 0;

        // UI
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        if (this.isMobile) document.getElementById('mobile-controls').classList.remove('hidden');

        // Reset weapon selector
        document.querySelectorAll('.weapon-slot').forEach((el, i) => {
            el.classList.toggle('active', i === 0);
        });

        this.updateHUD();

        // Request pointer lock (desktop)
        if (!this.isMobile) {
            this.renderer.domElement.requestPointerLock();
        }

        // Start first wave
        this.startWave(1);

        // Pickup spawner
        this.pickupInterval = setInterval(() => {
            if (this.isPlaying && !this.isDead) this.spawnPickup();
        }, 10000);
    }

    pauseGame() {
        this.isPaused = true;
        document.getElementById('pause-screen').classList.remove('hidden');
        if (document.pointerLockElement) document.exitPointerLock();
    }

    resumeGame() {
        this.isPaused = false;
        document.getElementById('pause-screen').classList.add('hidden');
        if (!this.isMobile) {
            this.renderer.domElement.requestPointerLock();
        }
    }

    goHome() {
        this.isPlaying = false;
        this.isDead = false;
        this.isPaused = false;
        if (this.spawnInterval) clearInterval(this.spawnInterval);
        if (this.pickupInterval) clearInterval(this.pickupInterval);

        // Clear enemies
        this.enemies.forEach(e => this.scene.remove(e.mesh));
        this.enemies = [];

        document.getElementById('gameover-screen').classList.add('hidden');
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('mobile-controls').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');

        if (document.pointerLockElement) document.exitPointerLock();
    }

    // ========================
    // GAME LOOP
    // ========================
    animate() {
        requestAnimationFrame(() => this.animate());

        const delta = Math.min(this.clock.getDelta(), 0.1);

        if (this.isPlaying && !this.isPaused && !this.isDead) {
            this.updateMovement(delta);
            this.updateEnemies(delta);
            this.updatePickups();
            this.updateParticles(delta);
            this.updateWeaponAnimation(delta);

            // Auto-fire for desktop
            if (this.mouseDown && this.weapons[this.currentWeapon].auto && this.isPointerLocked) {
                this.shoot();
            }
        }

        this.renderer.render(this.scene, this.camera);
    }

    updateMovement(delta) {
        const speed = this.isSprinting ? this.sprintSpeed : this.moveSpeed;
        const direction = new THREE.Vector3();

        // Desktop movement
        if (this.moveForward) direction.z -= 1;
        if (this.moveBackward) direction.z += 1;
        if (this.moveLeft) direction.x -= 1;
        if (this.moveRight) direction.x += 1;

        // Mobile joystick movement
        if (this.joystickActive) {
            direction.x += this.joystickDir.x;
            direction.z += this.joystickDir.y;
        }

        direction.normalize();

        if (direction.length() > 0) {
            // Apply yaw rotation to movement direction
            direction.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.yawObject.rotation.y);

            const newPos = this.yawObject.position.clone();
            newPos.x += direction.x * speed * delta;
            newPos.z += direction.z * speed * delta;

            // Arena bounds
            const half = this.arenaSize - 1;
            newPos.x = Math.max(-half, Math.min(half, newPos.x));
            newPos.z = Math.max(-half, Math.min(half, newPos.z));

            // Simple collision with obstacles
            let canMove = true;
            for (const obs of this.obstacles) {
                const dist = new THREE.Vector2(newPos.x - obs.position.x, newPos.z - obs.position.z).length();
                const obsSize = 1.5;
                if (dist < obsSize) {
                    canMove = false;
                    break;
                }
            }

            if (canMove) {
                this.yawObject.position.copy(newPos);
                this.yawObject.position.y = 1.7;
            }
        }
    }

    updateWeaponAnimation(delta) {
        if (!this.weaponMesh) return;

        // Recoil recovery
        if (this.weaponRecoil > 0) {
            this.weaponMesh.position.z += this.weaponRecoil;
            this.weaponRecoil *= 0.85;
            if (this.weaponRecoil < 0.001) this.weaponRecoil = 0;
        }

        // Walking bob
        if (this.moveForward || this.moveBackward || this.moveLeft || this.moveRight || this.joystickActive) {
            const bobSpeed = this.isSprinting ? 12 : 8;
            const bobAmount = 0.003;
            this.weaponMesh.position.y += Math.sin(Date.now() * 0.001 * bobSpeed) * bobAmount;
            this.weaponMesh.position.x += Math.cos(Date.now() * 0.001 * bobSpeed * 0.5) * bobAmount * 0.5;
        }
    }
}

// ========================
// LAUNCH
// ========================
window.addEventListener('DOMContentLoaded', () => {
    window.game = new HeheFPS();
});
