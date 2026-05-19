class Windmill {
    constructor(scene, groundY) {
        this.scene = scene;
        this.groundY = groundY;
        this.blades = null;
        this.rotationSpeed = 0.8;
        this.baseSpeed = 0.8;
        this.boostSpeed = 3;
        this.isBoosting = false;
        this.boostTimer = 0;
        this.allMeshes = [];
        this.init();
    }

    init() {
        this.createTower();
        this.createBlades();
        this.createBase();
    }

    createBase() {
        const baseGroup = new THREE.Group();
        
        const baseGeometry = new THREE.CylinderGeometry(1.5, 1.8, 0.5, 8);
        const baseMaterial = new THREE.MeshLambertMaterial({ color: 0x8B7355 });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 0.25;
        base.castShadow = true;
        base.receiveShadow = true;
        baseGroup.add(base);
        this.allMeshes.push(base);

        baseGroup.position.set(12, this.groundY, 0);
        this.scene.add(baseGroup);
        this.baseGroup = baseGroup;
    }

    createTower() {
        const towerGroup = new THREE.Group();
        
        const towerGeometry = new THREE.CylinderGeometry(0.6, 1.2, 8, 16);
        const towerMaterial = new THREE.MeshLambertMaterial({ color: 0xDEB887 });
        const tower = new THREE.Mesh(towerGeometry, towerMaterial);
        tower.position.y = 4;
        tower.castShadow = true;
        tower.receiveShadow = true;
        towerGroup.add(tower);
        this.allMeshes.push(tower);

        const doorGeometry = new THREE.PlaneGeometry(0.6, 1);
        const doorMaterial = new THREE.MeshLambertMaterial({ color: 0x5D4037, side: THREE.DoubleSide });
        const door = new THREE.Mesh(doorGeometry, doorMaterial);
        door.position.set(0, 0.8, 1.21);
        towerGroup.add(door);
        this.allMeshes.push(door);

        for (let i = 0; i < 3; i++) {
            const windowGeometry = new THREE.PlaneGeometry(0.4, 0.5);
            const windowMaterial = new THREE.MeshLambertMaterial({ color: 0x81D4FA, side: THREE.DoubleSide });
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.set(0, 2 + i * 2, 1.21);
            towerGroup.add(window);
            this.allMeshes.push(window);
        }

        const roofGeometry = new THREE.ConeGeometry(1, 1.5, 8);
        const roofMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const roof = new THREE.Mesh(roofGeometry, roofMaterial);
        roof.position.y = 8.75;
        roof.castShadow = true;
        towerGroup.add(roof);
        this.allMeshes.push(roof);

        towerGroup.position.set(12, this.groundY, 0);
        this.scene.add(towerGroup);
        this.towerGroup = towerGroup;
    }

    createBlades() {
        const bladesGroup = new THREE.Group();
        
        const centerGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.3, 16);
        const centerMaterial = new THREE.MeshLambertMaterial({ color: 0x5D4037 });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.rotation.z = Math.PI / 2;
        bladesGroup.add(center);
        this.allMeshes.push(center);

        const bladeCount = 4;
        for (let i = 0; i < bladeCount; i++) {
            const blade = this.createSingleBlade();
            blade.rotation.z = (i / bladeCount) * Math.PI * 2;
            bladesGroup.add(blade);
        }

        bladesGroup.position.set(12, this.groundY + 7, 1.5);
        this.scene.add(bladesGroup);
        this.blades = bladesGroup;
    }

    createSingleBlade() {
        const bladeGroup = new THREE.Group();
        
        const bladeShape = new THREE.Shape();
        bladeShape.moveTo(0, -0.15);
        bladeShape.lineTo(0.3, -0.1);
        bladeShape.lineTo(3.5, 0);
        bladeShape.lineTo(0.3, 0.1);
        bladeShape.lineTo(0, 0.15);
        bladeShape.lineTo(0, -0.15);

        const bladeGeometry = new THREE.ExtrudeGeometry(bladeShape, {
            depth: 0.1,
            bevelEnabled: false
        });
        
        const bladeMaterial = new THREE.MeshLambertMaterial({ 
            color: 0xFAF0E6,
            side: THREE.DoubleSide
        });
        
        const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
        blade.position.x = 0.1;
        blade.castShadow = true;
        bladeGroup.add(blade);
        this.allMeshes.push(blade);

        const crossGeometry = new THREE.BoxGeometry(3, 0.08, 0.08);
        const crossMaterial = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        const cross1 = new THREE.Mesh(crossGeometry, crossMaterial);
        cross1.position.set(1.5, 0, 0.05);
        bladeGroup.add(cross1);
        this.allMeshes.push(cross1);

        const cross2 = new THREE.Mesh(crossGeometry, crossMaterial);
        cross2.rotation.z = Math.PI / 2;
        cross2.position.set(1.5, 0, 0.05);
        bladeGroup.add(cross2);
        this.allMeshes.push(cross2);

        return bladeGroup;
    }

    boost() {
        const singleBoostTime = 1;
        const maxBoostTime = singleBoostTime * 3;
        if (!this.isBoosting) {
            this.isBoosting = true;
            this.rotationSpeed = this.boostSpeed;
            this.boostTimer = singleBoostTime;
        } else {
            this.boostTimer = Math.min(this.boostTimer + singleBoostTime, maxBoostTime);
        }
    }

    animate(deltaTime) {
        if (this.blades) {
            this.blades.rotation.z += this.rotationSpeed * deltaTime;
        }

        if (this.isBoosting) {
            this.boostTimer -= deltaTime;
            if (this.boostTimer <= 0) {
                this.isBoosting = false;
            }
        } else {
            const speedDiff = this.rotationSpeed - this.baseSpeed;
            if (speedDiff > 0.01) {
                this.rotationSpeed -= speedDiff * deltaTime * 2;
            } else {
                this.rotationSpeed = this.baseSpeed;
            }
        }
    }

    checkClick(intersects) {
        for (const intersect of intersects) {
            if (this.allMeshes.includes(intersect.object)) {
                return true;
            }
        }
        return false;
    }
}
