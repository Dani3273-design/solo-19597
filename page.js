let scene, camera, renderer, flowerField, windmill;
let raycaster, mouse;
const clock = new THREE.Clock();

function init() {
    const container = document.getElementById('scene-container');
    
    scene = new THREE.Scene();
    
    const skyGeometry = new THREE.SphereGeometry(200, 32, 32);
    const skyMaterial = new THREE.ShaderMaterial({
        uniforms: {
            topColor: { value: new THREE.Color(0x87CEEB) },
            bottomColor: { value: new THREE.Color(0xE0F6FF) },
            offset: { value: 33 },
            exponent: { value: 0.6 }
        },
        vertexShader: `
            varying vec3 vWorldPosition;
            void main() {
                vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                vWorldPosition = worldPosition.xyz;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform vec3 topColor;
            uniform vec3 bottomColor;
            uniform float offset;
            uniform float exponent;
            varying vec3 vWorldPosition;
            void main() {
                float h = normalize(vWorldPosition + offset).y;
                gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(max(h, 0.0), exponent), 0.0)), 1.0);
            }
        `,
        side: THREE.BackSide
    });
    const sky = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(sky);

    const cloudGeometry = new THREE.SphereGeometry(3, 16, 16);
    const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
    for (let i = 0; i < 15; i++) {
        const cloudGroup = new THREE.Group();
        const cloudCount = 3 + Math.floor(Math.random() * 3);
        for (let j = 0; j < cloudCount; j++) {
            const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
            cloud.scale.set(
                0.8 + Math.random() * 0.5,
                0.6 + Math.random() * 0.3,
                0.8 + Math.random() * 0.5
            );
            cloud.position.set(
                (Math.random() - 0.5) * 6,
                (Math.random() - 0.5) * 1,
                (Math.random() - 0.5) * 3
            );
            cloudGroup.add(cloud);
        }
        cloudGroup.position.set(
            (Math.random() - 0.5) * 150,
            30 + Math.random() * 20,
            -50 - Math.random() * 50
        );
        scene.add(cloudGroup);
    }

    camera = new THREE.PerspectiveCamera(
        55,
        window.innerWidth / window.innerHeight,
        0.1,
        500
    );
    camera.position.set(0, 10, 30);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1);
    sunLight.position.set(50, 80, 30);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 200;
    sunLight.shadow.camera.left = -60;
    sunLight.shadow.camera.right = 60;
    sunLight.shadow.camera.top = 60;
    sunLight.shadow.camera.bottom = -60;
    scene.add(sunLight);

    const groundY = 0;
    flowerField = new FlowerField(scene, groundY);
    windmill = new Windmill(scene, groundY);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.addEventListener('resize', onWindowResize);
    window.addEventListener('click', onMouseClick);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onMouseClick(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);

    if (windmill.checkClick(intersects)) {
        windmill.boost();
    }
}

function animate() {
    requestAnimationFrame(animate);

    const deltaTime = clock.getDelta();

    flowerField.animate(deltaTime);
    windmill.animate(deltaTime);

    renderer.render(scene, camera);
}

window.addEventListener('load', init);
