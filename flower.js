class FlowerField {
    constructor(scene, groundY) {
        this.scene = scene;
        this.groundY = groundY;
        this.tallFlowers = [];
        this.time = 0;
        this.flowerColors = [
            0xFF6B9D,
            0xFFD93D,
            0xFF8C42,
            0x6BCB77,
            0x4D96FF,
            0xC56BD9,
            0xFF6B6B,
            0x95E1D3,
            0xF38181,
            0xAA96DA,
            0xFFE66D,
            0xFF8B94,
            0xA8E6CF,
            0xFFD3B6
        ];
        this.init();
    }

    init() {
        this.createGround();
        this.createFlowerPoints();
        this.createNearDetailedFlowers();
        this.createTallFlowers();
    }

    createGround() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        
        ctx.fillStyle = '#689F38';
        ctx.fillRect(0, 0, 512, 512);
        
        const dotCount = 8000;
        for (let i = 0; i < dotCount; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 512;
            const size = 1 + Math.random() * 4;
            const colorIndex = Math.floor(Math.random() * this.flowerColors.length);
            const hexColor = '#' + this.flowerColors[colorIndex].toString(16).padStart(6, '0');
            ctx.fillStyle = hexColor;
            ctx.globalAlpha = 0.6 + Math.random() * 0.4;
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
        
        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(30, 20);
        
        const groundGeometry = new THREE.PlaneGeometry(300, 200);
        const groundMaterial = new THREE.MeshLambertMaterial({ 
            map: texture,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = this.groundY;
        ground.receiveShadow = true;
        this.scene.add(ground);
    }

    createFlowerPoints() {
        const totalFlowers = 200000;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(totalFlowers * 3);
        const colors = new Float32Array(totalFlowers * 3);
        const sizes = new Float32Array(totalFlowers);

        for (let i = 0; i < totalFlowers; i++) {
            let x, z, distance;
            
            if (i < totalFlowers * 0.35) {
                x = (Math.random() - 0.5) * 25;
                z = 5 + Math.random() * 20;
                distance = Math.sqrt(x * x + z * z);
            } else if (i < totalFlowers * 0.6) {
                x = (Math.random() - 0.5) * 35;
                z = -5 + Math.random() * 10;
                distance = Math.sqrt(x * x + z * z);
            } else if (i < totalFlowers * 0.8) {
                x = (Math.random() - 0.5) * 50;
                z = -20 + Math.random() * 15;
                distance = Math.sqrt(x * x + z * z);
            } else {
                distance = 30 + Math.random() * 80;
                const angle = Math.random() * Math.PI * 2;
                x = Math.cos(angle) * distance;
                z = Math.sin(angle) * distance - 15;
            }

            const height = 0.3 + Math.random() * 0.6;
            
            positions[i * 3] = x;
            positions[i * 3 + 1] = this.groundY + height;
            positions[i * 3 + 2] = z;

            const colorIndex = Math.floor(Math.random() * this.flowerColors.length);
            const color = this.flowerColors[colorIndex];
            colors[i * 3] = ((color >> 16) & 255) / 255;
            colors[i * 3 + 1] = ((color >> 8) & 255) / 255;
            colors[i * 3 + 2] = (color & 255) / 255;

            sizes[i] = Math.max(0.1, 0.6 - distance * 0.008);
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
        gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            size: 0.8,
            vertexColors: true,
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            sizeAttenuation: true
        });

        const points = new THREE.Points(geometry, material);
        this.scene.add(points);
    }

    createNearDetailedFlowers() {
        const petalCount = 5;
        const nearFlowerCount = 1200;
        
        const mergedGeometry = new THREE.BufferGeometry();
        const positions = [];
        const colors = [];
        
        for (let i = 0; i < nearFlowerCount; i++) {
            const x = (Math.random() - 0.5) * 28;
            const z = 3 + Math.random() * 22;
            
            const stemHeight = 0.5 + Math.random() * 0.8;
            const color = this.flowerColors[Math.floor(Math.random() * this.flowerColors.length)];
            const petalSize = 0.15 + Math.random() * 0.2;
            
            const stemSegments = 4;
            for (let s = 0; s < stemSegments; s++) {
                const y1 = (s / stemSegments) * stemHeight;
                const y2 = ((s + 1) / stemSegments) * stemHeight;
                const r1 = 0.015 * (1 - s / stemSegments * 0.3);
                const r2 = 0.015 * (1 - (s + 1) / stemSegments * 0.3);
                
                for (let j = 0; j < 8; j++) {
                    const a1 = (j / 8) * Math.PI * 2;
                    const a2 = ((j + 1) / 8) * Math.PI * 2;
                    
                    positions.push(
                        x + Math.cos(a1) * r1, y1 + this.groundY, z + Math.sin(a1) * r1,
                        x + Math.cos(a2) * r1, y1 + this.groundY, z + Math.sin(a2) * r1,
                        x + Math.cos(a1) * r2, y2 + this.groundY, z + Math.sin(a1) * r2
                    );
                    positions.push(
                        x + Math.cos(a2) * r1, y1 + this.groundY, z + Math.sin(a2) * r1,
                        x + Math.cos(a2) * r2, y2 + this.groundY, z + Math.sin(a2) * r2,
                        x + Math.cos(a1) * r2, y2 + this.groundY, z + Math.sin(a1) * r2
                    );
                    
                    for (let k = 0; k < 6; k++) {
                        colors.push(0.18, 0.49, 0.2);
                    }
                }
            }
            
            for (let j = 0; j < petalCount; j++) {
                const petalAngle = (j / petalCount) * Math.PI * 2;
                const px = x + Math.cos(petalAngle) * petalSize * 0.8;
                const pz = z + Math.sin(petalAngle) * petalSize * 0.8;
                const py = stemHeight + this.groundY;
                
                const r = ((color >> 16) & 255) / 255;
                const g = ((color >> 8) & 255) / 255;
                const b = (color & 255) / 255;
                
                const size = petalSize * 0.6;
                positions.push(
                    px, py, pz,
                    px + Math.cos(petalAngle + 0.5) * size, py + size * 0.3, pz + Math.sin(petalAngle + 0.5) * size,
                    px + Math.cos(petalAngle - 0.5) * size, py + size * 0.3, pz + Math.sin(petalAngle - 0.5) * size
                );
                colors.push(r, g, b, r, g, b, r, g, b);
            }
            
            const cr = 255 / 255;
            const cg = 213 / 255;
            const cb = 79 / 255;
            const centerSize = petalSize * 0.4;
            for (let j = 0; j < 8; j++) {
                const a1 = (j / 8) * Math.PI * 2;
                const a2 = ((j + 1) / 8) * Math.PI * 2;
                positions.push(
                    x, stemHeight + this.groundY, z,
                    x + Math.cos(a1) * centerSize, stemHeight + this.groundY, z + Math.sin(a1) * centerSize,
                    x + Math.cos(a2) * centerSize, stemHeight + this.groundY, z + Math.sin(a2) * centerSize
                );
                colors.push(cr, cg, cb, cr, cg, cb, cr, cg, cb);
            }
        }
        
        mergedGeometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        mergedGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        mergedGeometry.computeVertexNormals();
        
        const mergedMaterial = new THREE.MeshLambertMaterial({ 
            vertexColors: true,
            side: THREE.DoubleSide
        });
        const mergedMesh = new THREE.Mesh(mergedGeometry, mergedMaterial);
        this.scene.add(mergedMesh);
    }

    createTallFlowers() {
        const tallFlowerCount = 7;
        
        for (let i = 0; i < tallFlowerCount; i++) {
            const tallFlower = this.createSingleTallFlower();
            const x = -8 + (i / (tallFlowerCount - 1)) * 20;
            const z = -2 + (Math.random() - 0.5) * 8;
            tallFlower.group.position.set(x, this.groundY, z);
            tallFlower.phase = Math.random() * Math.PI * 2;
            tallFlower.speed = 0.8 + Math.random() * 0.4;
            this.tallFlowers.push(tallFlower);
            this.scene.add(tallFlower.group);
        }
    }

    createSingleTallFlower() {
        const group = new THREE.Group();
        const stemHeight = 2 + Math.random() * 1.5;
        const color = this.flowerColors[Math.floor(Math.random() * this.flowerColors.length)];

        const stemGeometry = new THREE.CylinderGeometry(0.03, 0.05, stemHeight, 8);
        const stemMaterial = new THREE.MeshLambertMaterial({ color: 0x2E7D32 });
        const stem = new THREE.Mesh(stemGeometry, stemMaterial);
        stem.position.y = stemHeight / 2;
        group.add(stem);

        const petalLayers = 2;
        const petalsPerLayer = 6;
        const petalSize = 0.25;

        for (let layer = 0; layer < petalLayers; layer++) {
            const layerScale = 1 - layer * 0.3;
            for (let i = 0; i < petalsPerLayer; i++) {
                const angle = (i / petalsPerLayer) * Math.PI * 2 + layer * 0.3;
                const petalShape = new THREE.Shape();
                petalShape.moveTo(0, 0);
                petalShape.quadraticCurveTo(petalSize * 0.5 * layerScale, petalSize * layerScale, 0, petalSize * 1.5 * layerScale);
                petalShape.quadraticCurveTo(-petalSize * 0.5 * layerScale, petalSize * layerScale, 0, 0);
                
                const petalGeometry = new THREE.ShapeGeometry(petalShape);
                const petalMaterial = new THREE.MeshLambertMaterial({ 
                    color: color, 
                    side: THREE.DoubleSide 
                });
                const petal = new THREE.Mesh(petalGeometry, petalMaterial);
                petal.position.y = stemHeight;
                petal.rotation.x = -Math.PI / 4 - layer * 0.2;
                petal.rotation.z = angle;
                group.add(petal);
            }
        }

        const centerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0xFFB300 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.position.y = stemHeight;
        group.add(center);

        return { group, stem, height: stemHeight };
    }

    animate(deltaTime) {
        this.time += deltaTime;
        
        for (const tallFlower of this.tallFlowers) {
            const swayAmount = 0.08;
            const sway = Math.sin(this.time * tallFlower.speed + tallFlower.phase) * swayAmount;
            tallFlower.group.rotation.z = sway;
        }
    }
}
