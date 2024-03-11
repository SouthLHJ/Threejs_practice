import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// GLTF를 사용하기 위해서는 전용로더인ㅌ GLTFLoader를 import해야한다.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshObject } from './MeshObject';

// 물리엔진
import * as CANNON from 'cannon-es';

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2: 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Camera
const camera = new THREE.PerspectiveCamera(
	60, // fov
	window.innerWidth / window.innerHeight, // aspect
	0.1, // near
	1000 // far
);
camera.position.set(0, 3, 7);
scene.add(camera);

// const controls = new OrbitControls(camera, renderer.domElement);
const gltfLoader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();


// Light
const ambientLight = new THREE.AmbientLight('white', 1);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048;
pointLight.shadow.mapSize.height = 2048 ;
pointLight.position.y = 10;

scene.add(ambientLight,pointLight);

// Cannon(Physic 물리엔진)
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0); // Y 방향으로 지구의 중력 가속도인 -9.8에 가깝게 설정


// Mesh

/** 땅 */
const groundMesh = new MeshObject({
	scene,
	name : 'ground',
	width : 100,
	height : 0.1,
	depth : 100,
	color : '#7f5217',
	y : -0.05
})

/** 방 */
const floorMesh = new MeshObject({
	scene,
	name : 'floor',
	width : 5,
	height : 0.4,
	depth : 5,
	color: 'white',
	y : 0.2
})

/** 벽 */
const wall_1 = new MeshObject({
	scene,
	name : 'wall 1',
	width : 5,
	height : 3,
	depth : 0.2,
	z : -2.4,
})

const wall_2 = new MeshObject({
	scene,
	name : 'wall 2',
	width : 0.2,
	height : 3,
	depth : 5,
	x : -2.4
})

/** 사물 */
const desk = new MeshObject({
	scene,
	loader : gltfLoader,
	name : 'desk',
	width : 1.8,
	height : 0.8,
	depth : 0.75,
	x : -1.9,
	z: 1.5,
	y : 0.8,
	rotationY :  THREE.MathUtils.degToRad(-90),
	modelSrc : '/models/desk.glb'
});

const lamp =  new MeshObject({
	scene,
	loader : gltfLoader,
	name : 'lamp',
	width : 0.5,
	height : 1.8,
	depth : 0.5,
	x : -1.9,
	z: -1.9,
	y : 1.3,
	modelSrc : '/models/lamp.glb'
});

const roboticVaccum = new MeshObject({
	scene,
	loader : gltfLoader,
	name : 'roboticVaccum',
	width : 0.5,
	height : 0.1,
	depth : 0.5,
	x : 0,
	z: 0,
	y : 0.4,
	modelSrc : '/models/vaccum.glb'
});

const ashTree1 = new MeshObject({
	scene,
	loader : gltfLoader,
	name : 'ashTree1',
	width : 1,
	height : 1,
	depth : 2,
	x : -180,
	z: 1,
	y : 0.4,
	modelSrc : '/models/AshTrees1.glb'
});
const ashTree9 = new MeshObject({
	scene,
	loader : gltfLoader,
	name : 'ashTree9',
	width : 1,
	height : 1,
	depth : 2,
	x : 130,
	z: -40,
	y : 0.4,
	modelSrc : '/models/AshTrees9.glb'
});

const magazine = new MeshObject({
	scene,
	loader : textureLoader,
	name : 'magazine',
	width: 0.2,
	height : 0.02,
	depth : 0.29,
	x : -2.1,
	z: 1.5,
	y : 1.2,
	rotationY : THREE.MathUtils.degToRad(90),
	mapSrc : '/models/magazine.jpg'
})




function setLayout() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

let movementX = 0;
let movementY = 0;
function updateMovementValue(event){
	movementX = event.movementX;
	movementY = event.movementY;
}

const euler = new THREE.Euler(0,0,0,'YXZ');
const minPloarAngle = 0;
const maxPolarAngle = Math.PI;
function rotateCamera(){
	euler.setFromQuaternion(camera.quaternion);
	euler.y -= movementX * delta;
	euler.x -= movementY * delta;
	euler.x = Math.max(Math.PI/2 - maxPolarAngle, Math.min(Math.PI/2 - minPloarAngle, euler.x));

	movementX -= movementX * 0.2;
	movementY -= movementY * 0.2;
	if(Math.abs(movementX) < 0.1) movementX = 0;
	if(Math.abs(movementY) < 0.1) movementY = 0;

	camera.quaternion.setFromEuler(euler);

}

function setMode(mode){
	document.body.dataset.mode = mode;
	if(mode == 'game'){
		document.addEventListener('mousemove',  updateMovementValue)
	}else if (mode === 'website'){
		document.removeEventListener('mousemove',  updateMovementValue)
	}
}

// Draw
const clock = new THREE.Clock();
let delta;
function draw() {
	delta = clock.getDelta();
	rotateCamera()
	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}

draw();

// Events
window.addEventListener('resize', setLayout);

document.addEventListener('click', ()=>{
	canvas.requestPointerLock();
})

document.addEventListener('pointerlockchange',()=>{
	if(document.pointerLockElement == canvas){
		setMode('game')
	}else{
		setMode('website')
	}
})


