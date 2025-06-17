const scene = new THREE.Scene();

scene.background = new THREE.Color(0xffe6f0);

// Camera
const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
camera.position.set(0, 3.2, 0);
camera.rotation.set(-(Math.PI / 2), 0, 0);


// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerHeight * 0.9, window.innerHeight * 0.9);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // Better color representation
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.getElementById('main').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 3.0); // Adjusted intensity for balance
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
dirLight.position.set(10, 7, 0);
dirLight.castShadow = true;
dirLight.shadow.mapSize.width = 8192; // Higher resolution shadows
dirLight.shadow.mapSize.height = 8192;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 50;
dirLight.shadow.camera.left = -10;
dirLight.shadow.camera.right = 10;
dirLight.shadow.camera.top = 10;
dirLight.shadow.camera.bottom = -10;
scene.add(dirLight);

// GLTF Model
let model;
const loader = new THREE.GLTFLoader();
loader.load(
  'assets/model.glb',
  (gltf) => {
    model = gltf.scene;
    scene.add(model);

    model.traverse((child) => {
      if (child.isMesh) {
        child.material = new THREE.MeshPhysicalMaterial({
          color: child.material.color,
          metalness: 0.5,
          roughness: 1.0,
          clearcoat: 1.0,
          clearcoatRoughness: 1.0,
        });           

        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  },
  undefined,
  (error) => {
    console.error('Error loading GLTF model:', error);
  }
);


const maxDistance = 30; 
// Mouse movement for light
const mouse = { x: 0, y: 0 };
window.addEventListener('mousemove', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = (event.clientY / window.innerHeight) * 2 - 1;

  dirLight.position.set(mouse.x * 30, 7, mouse.y * 30); // Enhanced responsiveness

  dirLight.intensity = calculateLightIntensity(dirLight.position, maxDistance);
  console.log(dirLight.intensity);
});

const calculateLightIntensity = (position, maxDistance) => {
  const distance = Math.sqrt(position.x ** 2 + (position.z + 1.0) ** 2);
  return 0.4 + (distance / maxDistance) * 0.8; // Ensure intensity is above 0.1
};

// Animation loop
const animate = () => {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
};
animate();

// Handle resizing
window.addEventListener('resize', () => {
  const size = Math.min(window.innerWidth, window.innerHeight);
  camera.aspect = size / size;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerHeight * 0.9, window.innerHeight * 0.9);
});
