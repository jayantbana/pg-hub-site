// 3D Room Renderer using Three.js
class Room3DRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;
        this.animationId = null;
        this.roomGroup = null;
    }

    async createRoom(container, roomConfig) {
        this.container = container;
        this.initializeThreeJS();
        this.setupLighting();
        this.createRoomGeometry(roomConfig);
        this.setupControls();
        this.animate();
        this.handleResize();
    }

    initializeThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light (room light)
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(0, 4, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
    }

    createRoomGeometry(config) {
        this.roomGroup = new THREE.Group();

        // Materials
        const materials = this.createMaterials(config.colorScheme || 'modern');

        // Room dimensions
        const width = config.width || 4;
        const height = config.height || 3;
        const depth = config.depth || 4;

        // Create walls
        this.createWalls(width, height, depth, materials);

        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floor = new THREE.Mesh(floorGeometry, materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Create ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, materials.ceiling);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        this.roomGroup.add(ceiling);

        // Add furniture based on room type
        this.addFurnishings(config, materials);

        this.scene.add(this.roomGroup);
    }

    createMaterials(colorScheme) {
        const materials = {};

        switch (colorScheme) {
            case 'modern':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x654321 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
                break;
            case 'classic':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xfaf0e6 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xfffff0 });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0xdc143c });
                break;
            case 'minimal':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x404040 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x000000 });
                break;
            default:
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x654321 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        }

        return materials;
    }

    createWalls(width, height, depth, materials) {
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(width, height);
        const backWall = new THREE.Mesh(backWallGeometry, materials.wall);
        backWall.position.z = -depth / 2;
        backWall.position.y = height / 2;
        this.roomGroup.add(backWall);

        // Left wall
        const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
        const leftWall = new THREE.Mesh(leftWallGeometry, materials.wall);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -width / 2;
        leftWall.position.y = height / 2;
        this.roomGroup.add(leftWall);

        // Right wall
        const rightWallGeometry = new THREE.PlaneGeometry(depth, height);
        const rightWall = new THREE.Mesh(rightWallGeometry, materials.wall);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = width / 2;
        rightWall.position.y = height / 2;
        this.roomGroup.add(rightWall);

        // Add window to one wall
        this.addWindow(materials);
    }

    addWindow(materials) {
        const windowGeometry = new THREE.PlaneGeometry(1.5, 1);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87ceeb, 
            transparent: true, 
            opacity: 0.7 
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(1, 1.5, -1.99);
        this.roomGroup.add(window);

        // Window frame
        const frameGeometry = new THREE.BoxGeometry(1.6, 1.1, 0.1);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(1, 1.5, -1.98);
        this.roomGroup.add(frame);
    }

    addFurnishings(config, materials) {
        const roomType = config.type || 'single';
        const furnishings = config.furnishings || [];

        // Always add a bed
        this.addBed(roomType, materials);

        // Add other furniture based on configuration
        if (furnishings.includes('desk') || roomType === 'single') {
            this.addDesk(materials);
        }

        if (furnishings.includes('wardrobe')) {
            this.addWardrobe(materials);
        }

        if (furnishings.includes('chair')) {
            this.addChair(materials);
        }

        if (furnishings.includes('bookshelf')) {
            this.addBookshelf(materials);
        }

        // Add decorations
        this.addDecorations(materials);
    }

    addBed(roomType, materials) {
        // Bed base
        const bedWidth = roomType === 'single' ? 1 : 1.5;
        const bedGeometry = new THREE.BoxGeometry(bedWidth, 0.3, 2);
        const bed = new THREE.Mesh(bedGeometry, materials.furniture);
        bed.position.set(-1.5, 0.15, -1);
        bed.castShadow = true;
        this.roomGroup.add(bed);

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(bedWidth, 0.2, 2);
        const mattressMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(-1.5, 0.4, -1);
        this.roomGroup.add(mattress);

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(bedWidth * 0.6, 0.1, 0.4);
        const pillowMaterial = new THREE.MeshLambertMaterial({ color: 0xe6e6fa });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(-1.5, 0.55, -1.7);
        this.roomGroup.add(pillow);
    }

    addDesk(materials) {
        // Desk surface
        const deskGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.6);
        const desk = new THREE.Mesh(deskGeometry, materials.furniture);
        desk.position.set(1.4, 0.8, 1);
        desk.castShadow = true;
        this.roomGroup.add(desk);

        // Desk legs
        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
            const leg = new THREE.Mesh(legGeometry, materials.furniture);
            const xPos = i < 2 ? 0.8 : 2;
            const zPos = i % 2 === 0 ? 0.7 : 1.3;
            leg.position.set(xPos, 0.4, zPos);
            this.roomGroup.add(leg);
        }

        // Computer monitor
        const monitorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.05);
        const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(1.4, 1.1, 1);
        this.roomGroup.add(monitor);
    }

    addWardrobe(materials) {
        const wardrobeGeometry = new THREE.BoxGeometry(0.6, 2, 1);
        const wardrobe = new THREE.Mesh(wardrobeGeometry, materials.furniture);
        wardrobe.position.set(1.7, 1, -1.5);
        wardrobe.castShadow = true;
        this.roomGroup.add(wardrobe);

        // Wardrobe handles
        const handleGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.02);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(1.4, 1, -1.5);
        this.roomGroup.add(handle);
    }

    addChair(materials) {
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const seat = new THREE.Mesh(seatGeometry, materials.furniture);
        seat.position.set(1.4, 0.5, 0.4);
        this.roomGroup.add(seat);

        // Chair back
        const backGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.05);
        const back = new THREE.Mesh(backGeometry, materials.furniture);
        back.position.set(1.4, 0.75, 0.2);
        this.roomGroup.add(back);

        // Chair legs
        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.BoxGeometry(0.03, 0.5, 0.03);
            const leg = new THREE.Mesh(legGeometry, materials.furniture);
            const xPos = i < 2 ? 1.2 : 1.6;
            const zPos = i % 2 === 0 ? 0.2 : 0.6;
            leg.position.set(xPos, 0.25, zPos);
            this.roomGroup.add(leg);
        }
    }

    addBookshelf(materials) {
        const shelfGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.8);
        const shelf = new THREE.Mesh(shelfGeometry, materials.furniture);
        shelf.position.set(-1.7, 0.75, 1);
        shelf.castShadow = true;
        this.roomGroup.add(shelf);

        // Books
        for (let i = 0; i < 6; i++) {
            const bookGeometry = new THREE.BoxGeometry(0.2, 0.03, 0.15);
            const bookColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            const bookMaterial = new THREE.MeshLambertMaterial({ color: bookColors[i] });
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.set(-1.7, 1 + (i * 0.2), 0.7 + (i * 0.05));
            this.roomGroup.add(book);
        }
    }

    addDecorations(materials) {
        // Wall art
        const artGeometry = new THREE.PlaneGeometry(0.6, 0.4);
        const artMaterial = new THREE.MeshLambertMaterial({ color: 0xff6347 });
        const art = new THREE.Mesh(artGeometry, artMaterial);
        art.position.set(0, 1.8, -1.99);
        this.roomGroup.add(art);

        // Floor lamp
        const lampPoleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
        const lampPole = new THREE.Mesh(lampPoleGeometry, materials.accent);
        lampPole.position.set(-1, 0.75, 1.5);
        this.roomGroup.add(lampPole);

        const lampShadeGeometry = new THREE.ConeGeometry(0.2, 0.3, 8);
        const lampShadeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const lampShade = new THREE.Mesh(lampShadeGeometry, lampShadeMaterial);
        lampShade.position.set(-1, 1.4, 1.5);
        this.roomGroup.add(lampShade);

        // Rug
        const rugGeometry = new THREE.PlaneGeometry(2, 1.5);
        const rugMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.01, 0);
        this.roomGroup.add(rug);
    }

    setupControls() {
        // Create orbit controls (simple mouse controls)
        this.enableMouseControls();
    }

    enableMouseControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };

                const deltaRotationQuaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        toRadians(deltaMove.y * 1),
                        toRadians(deltaMove.x * 1),
                        0,
                        'XYZ'
                    ));

                this.roomGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.roomGroup.quaternion);

                previousMousePosition.x = e.clientX;
                previousMousePosition.y = e.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });

        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Auto-rotate the room slowly
        if (this.roomGroup) {
            this.roomGroup.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (this.container && this.camera && this.renderer) {
                this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            }
        });
    }

    setView(viewType) {
        if (!this.camera || !this.roomGroup) return;

        const distance = 8;
        switch (viewType) {
            case 'front':
                this.camera.position.set(0, 2, distance);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'side':
                this.camera.position.set(distance, 2, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'top':
                this.camera.position.set(0, distance, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'reset':
                this.camera.position.set(5, 5, 5);
                this.camera.lookAt(0, 0, 0);
                this.roomGroup.rotation.set(0, 0, 0);
                break;
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        if (this.scene) {
            this.scene.clear();
        }
    }

    static getDefaultRoomConfig(roomType) {
        const configs = {
            single: {
                width: 3,
                height: 3,
                depth: 4,
                type: 'single',
                furnishings: ['desk', 'wardrobe', 'chair'],
                colorScheme: 'modern'
            },
            double: {
                width: 4,
                height: 3,
                depth: 4,
                type: 'double',
                furnishings: ['desk', 'wardrobe'],
                colorScheme: 'classic'
            },
            triple: {
                width: 5,
                height: 3,
                depth: 4,
                type: 'triple',
                furnishings: ['wardrobe'],
                colorScheme: 'minimal'
            },
            dormitory: {
                width: 6,
                height: 3,
                depth: 5,
                type: 'dormitory',
                furnishings: ['bookshelf'],
                colorScheme: 'modern'
            }
        };

        return configs[roomType] || configs.single;
    }
}

// Export for global use
window.Room3DRenderer = Room3DRenderer;
// 3D Room Renderer using Three.js
class Room3DRenderer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.container = null;
        this.animationId = null;
        this.roomGroup = null;
    }

    async createRoom(container, roomConfig) {
        this.container = container;
        this.initializeThreeJS();
        this.setupLighting();
        this.createRoomGeometry(roomConfig);
        this.setupControls();
        this.animate();
        this.handleResize();
    }

    initializeThreeJS() {
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f0f0);

        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        this.camera.lookAt(0, 0, 0);

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sunlight)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point light (room light)
        const pointLight = new THREE.PointLight(0xffffff, 0.5, 100);
        pointLight.position.set(0, 4, 0);
        pointLight.castShadow = true;
        this.scene.add(pointLight);
    }

    createRoomGeometry(config) {
        this.roomGroup = new THREE.Group();

        // Materials
        const materials = this.createMaterials(config.colorScheme || 'modern');

        // Room dimensions
        const width = config.width || 4;
        const height = config.height || 3;
        const depth = config.depth || 4;

        // Create walls
        this.createWalls(width, height, depth, materials);

        // Create floor
        const floorGeometry = new THREE.PlaneGeometry(width, depth);
        const floor = new THREE.Mesh(floorGeometry, materials.floor);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Create ceiling
        const ceilingGeometry = new THREE.PlaneGeometry(width, depth);
        const ceiling = new THREE.Mesh(ceilingGeometry, materials.ceiling);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = height;
        this.roomGroup.add(ceiling);

        // Add furniture based on room type
        this.addFurnishings(config, materials);

        this.scene.add(this.roomGroup);
    }

    createMaterials(colorScheme) {
        const materials = {};

        switch (colorScheme) {
            case 'modern':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xf5f5f5 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x654321 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
                break;
            case 'classic':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xfaf0e6 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x4a4a4a });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xfffff0 });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0xdc143c });
                break;
            case 'minimal':
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0xe0e0e0 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x404040 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x000000 });
                break;
            default:
                materials.wall = new THREE.MeshLambertMaterial({ color: 0xf0f0f0 });
                materials.floor = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
                materials.ceiling = new THREE.MeshLambertMaterial({ color: 0xffffff });
                materials.furniture = new THREE.MeshLambertMaterial({ color: 0x654321 });
                materials.accent = new THREE.MeshLambertMaterial({ color: 0x3b82f6 });
        }

        return materials;
    }

    createWalls(width, height, depth, materials) {
        // Back wall
        const backWallGeometry = new THREE.PlaneGeometry(width, height);
        const backWall = new THREE.Mesh(backWallGeometry, materials.wall);
        backWall.position.z = -depth / 2;
        backWall.position.y = height / 2;
        this.roomGroup.add(backWall);

        // Left wall
        const leftWallGeometry = new THREE.PlaneGeometry(depth, height);
        const leftWall = new THREE.Mesh(leftWallGeometry, materials.wall);
        leftWall.rotation.y = Math.PI / 2;
        leftWall.position.x = -width / 2;
        leftWall.position.y = height / 2;
        this.roomGroup.add(leftWall);

        // Right wall
        const rightWallGeometry = new THREE.PlaneGeometry(depth, height);
        const rightWall = new THREE.Mesh(rightWallGeometry, materials.wall);
        rightWall.rotation.y = -Math.PI / 2;
        rightWall.position.x = width / 2;
        rightWall.position.y = height / 2;
        this.roomGroup.add(rightWall);

        // Add window to one wall
        this.addWindow(materials);
    }

    addWindow(materials) {
        const windowGeometry = new THREE.PlaneGeometry(1.5, 1);
        const windowMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x87ceeb, 
            transparent: true, 
            opacity: 0.7 
        });
        const window = new THREE.Mesh(windowGeometry, windowMaterial);
        window.position.set(1, 1.5, -1.99);
        this.roomGroup.add(window);

        // Window frame
        const frameGeometry = new THREE.BoxGeometry(1.6, 1.1, 0.1);
        const frameMaterial = new THREE.MeshLambertMaterial({ color: 0x8b4513 });
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(1, 1.5, -1.98);
        this.roomGroup.add(frame);
    }

    addFurnishings(config, materials) {
        const roomType = config.type || 'single';
        const furnishings = config.furnishings || [];

        // Always add a bed
        this.addBed(roomType, materials);

        // Add other furniture based on configuration
        if (furnishings.includes('desk') || roomType === 'single') {
            this.addDesk(materials);
        }

        if (furnishings.includes('wardrobe')) {
            this.addWardrobe(materials);
        }

        if (furnishings.includes('chair')) {
            this.addChair(materials);
        }

        if (furnishings.includes('bookshelf')) {
            this.addBookshelf(materials);
        }

        // Add decorations
        this.addDecorations(materials);
    }

    addBed(roomType, materials) {
        // Bed base
        const bedWidth = roomType === 'single' ? 1 : 1.5;
        const bedGeometry = new THREE.BoxGeometry(bedWidth, 0.3, 2);
        const bed = new THREE.Mesh(bedGeometry, materials.furniture);
        bed.position.set(-1.5, 0.15, -1);
        bed.castShadow = true;
        this.roomGroup.add(bed);

        // Mattress
        const mattressGeometry = new THREE.BoxGeometry(bedWidth, 0.2, 2);
        const mattressMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
        mattress.position.set(-1.5, 0.4, -1);
        this.roomGroup.add(mattress);

        // Pillow
        const pillowGeometry = new THREE.BoxGeometry(bedWidth * 0.6, 0.1, 0.4);
        const pillowMaterial = new THREE.MeshLambertMaterial({ color: 0xe6e6fa });
        const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
        pillow.position.set(-1.5, 0.55, -1.7);
        this.roomGroup.add(pillow);
    }

    addDesk(materials) {
        // Desk surface
        const deskGeometry = new THREE.BoxGeometry(1.2, 0.05, 0.6);
        const desk = new THREE.Mesh(deskGeometry, materials.furniture);
        desk.position.set(1.4, 0.8, 1);
        desk.castShadow = true;
        this.roomGroup.add(desk);

        // Desk legs
        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.BoxGeometry(0.05, 0.8, 0.05);
            const leg = new THREE.Mesh(legGeometry, materials.furniture);
            const xPos = i < 2 ? 0.8 : 2;
            const zPos = i % 2 === 0 ? 0.7 : 1.3;
            leg.position.set(xPos, 0.4, zPos);
            this.roomGroup.add(leg);
        }

        // Computer monitor
        const monitorGeometry = new THREE.BoxGeometry(0.5, 0.3, 0.05);
        const monitorMaterial = new THREE.MeshLambertMaterial({ color: 0x000000 });
        const monitor = new THREE.Mesh(monitorGeometry, monitorMaterial);
        monitor.position.set(1.4, 1.1, 1);
        this.roomGroup.add(monitor);
    }

    addWardrobe(materials) {
        const wardrobeGeometry = new THREE.BoxGeometry(0.6, 2, 1);
        const wardrobe = new THREE.Mesh(wardrobeGeometry, materials.furniture);
        wardrobe.position.set(1.7, 1, -1.5);
        wardrobe.castShadow = true;
        this.roomGroup.add(wardrobe);

        // Wardrobe handles
        const handleGeometry = new THREE.BoxGeometry(0.02, 0.1, 0.02);
        const handleMaterial = new THREE.MeshLambertMaterial({ color: 0xc0c0c0 });
        const handle = new THREE.Mesh(handleGeometry, handleMaterial);
        handle.position.set(1.4, 1, -1.5);
        this.roomGroup.add(handle);
    }

    addChair(materials) {
        // Chair seat
        const seatGeometry = new THREE.BoxGeometry(0.4, 0.05, 0.4);
        const seat = new THREE.Mesh(seatGeometry, materials.furniture);
        seat.position.set(1.4, 0.5, 0.4);
        this.roomGroup.add(seat);

        // Chair back
        const backGeometry = new THREE.BoxGeometry(0.4, 0.5, 0.05);
        const back = new THREE.Mesh(backGeometry, materials.furniture);
        back.position.set(1.4, 0.75, 0.2);
        this.roomGroup.add(back);

        // Chair legs
        for (let i = 0; i < 4; i++) {
            const legGeometry = new THREE.BoxGeometry(0.03, 0.5, 0.03);
            const leg = new THREE.Mesh(legGeometry, materials.furniture);
            const xPos = i < 2 ? 1.2 : 1.6;
            const zPos = i % 2 === 0 ? 0.2 : 0.6;
            leg.position.set(xPos, 0.25, zPos);
            this.roomGroup.add(leg);
        }
    }

    addBookshelf(materials) {
        const shelfGeometry = new THREE.BoxGeometry(0.3, 1.5, 0.8);
        const shelf = new THREE.Mesh(shelfGeometry, materials.furniture);
        shelf.position.set(-1.7, 0.75, 1);
        shelf.castShadow = true;
        this.roomGroup.add(shelf);

        // Books
        for (let i = 0; i < 6; i++) {
            const bookGeometry = new THREE.BoxGeometry(0.2, 0.03, 0.15);
            const bookColors = [0xff0000, 0x00ff00, 0x0000ff, 0xffff00, 0xff00ff, 0x00ffff];
            const bookMaterial = new THREE.MeshLambertMaterial({ color: bookColors[i] });
            const book = new THREE.Mesh(bookGeometry, bookMaterial);
            book.position.set(-1.7, 1 + (i * 0.2), 0.7 + (i * 0.05));
            this.roomGroup.add(book);
        }
    }

    addDecorations(materials) {
        // Wall art
        const artGeometry = new THREE.PlaneGeometry(0.6, 0.4);
        const artMaterial = new THREE.MeshLambertMaterial({ color: 0xff6347 });
        const art = new THREE.Mesh(artGeometry, artMaterial);
        art.position.set(0, 1.8, -1.99);
        this.roomGroup.add(art);

        // Floor lamp
        const lampPoleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 1.5);
        const lampPole = new THREE.Mesh(lampPoleGeometry, materials.accent);
        lampPole.position.set(-1, 0.75, 1.5);
        this.roomGroup.add(lampPole);

        const lampShadeGeometry = new THREE.ConeGeometry(0.2, 0.3, 8);
        const lampShadeMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const lampShade = new THREE.Mesh(lampShadeGeometry, lampShadeMaterial);
        lampShade.position.set(-1, 1.4, 1.5);
        this.roomGroup.add(lampShade);

        // Rug
        const rugGeometry = new THREE.PlaneGeometry(2, 1.5);
        const rugMaterial = new THREE.MeshLambertMaterial({ color: 0x8b0000 });
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.01, 0);
        this.roomGroup.add(rug);
    }

    setupControls() {
        // Create orbit controls (simple mouse controls)
        this.enableMouseControls();
    }

    enableMouseControls() {
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        this.renderer.domElement.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMousePosition.x = e.clientX;
            previousMousePosition.y = e.clientY;
        });

        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (isDragging) {
                const deltaMove = {
                    x: e.clientX - previousMousePosition.x,
                    y: e.clientY - previousMousePosition.y
                };

                const deltaRotationQuaternion = new THREE.Quaternion()
                    .setFromEuler(new THREE.Euler(
                        toRadians(deltaMove.y * 1),
                        toRadians(deltaMove.x * 1),
                        0,
                        'XYZ'
                    ));

                this.roomGroup.quaternion.multiplyQuaternions(deltaRotationQuaternion, this.roomGroup.quaternion);

                previousMousePosition.x = e.clientX;
                previousMousePosition.y = e.clientY;
            }
        });

        this.renderer.domElement.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Zoom with mouse wheel
        this.renderer.domElement.addEventListener('wheel', (e) => {
            e.preventDefault();
            const scale = e.deltaY > 0 ? 1.1 : 0.9;
            this.camera.position.multiplyScalar(scale);
        });

        function toRadians(angle) {
            return angle * (Math.PI / 180);
        }
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Auto-rotate the room slowly
        if (this.roomGroup) {
            this.roomGroup.rotation.y += 0.005;
        }

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        window.addEventListener('resize', () => {
            if (this.container && this.camera && this.renderer) {
                this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
                this.camera.updateProjectionMatrix();
                this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
            }
        });
    }

    setView(viewType) {
        if (!this.camera || !this.roomGroup) return;

        const distance = 8;
        switch (viewType) {
            case 'front':
                this.camera.position.set(0, 2, distance);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'side':
                this.camera.position.set(distance, 2, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'top':
                this.camera.position.set(0, distance, 0);
                this.camera.lookAt(0, 0, 0);
                break;
            case 'reset':
                this.camera.position.set(5, 5, 5);
                this.camera.lookAt(0, 0, 0);
                this.roomGroup.rotation.set(0, 0, 0);
                break;
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        if (this.renderer && this.container) {
            this.container.removeChild(this.renderer.domElement);
        }
        if (this.scene) {
            this.scene.clear();
        }
    }

    static getDefaultRoomConfig(roomType) {
        const configs = {
            single: {
                width: 3,
                height: 3,
                depth: 4,
                type: 'single',
                furnishings: ['desk', 'wardrobe', 'chair'],
                colorScheme: 'modern'
            },
            double: {
                width: 4,
                height: 3,
                depth: 4,
                type: 'double',
                furnishings: ['desk', 'wardrobe'],
                colorScheme: 'classic'
            },
            triple: {
                width: 5,
                height: 3,
                depth: 4,
                type: 'triple',
                furnishings: ['wardrobe'],
                colorScheme: 'minimal'
            },
            dormitory: {
                width: 6,
                height: 3,
                depth: 5,
                type: 'dormitory',
                furnishings: ['bookshelf'],
                colorScheme: 'modern'
            }
        };

        return configs[roomType] || configs.single;
    }
}

// Export for global use
window.Room3DRenderer = Room3DRenderer;