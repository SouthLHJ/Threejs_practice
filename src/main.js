import * as THREE from 'three';
// import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// GLTF를 사용하기 위해서는 전용로더인ㅌ GLTFLoader를 import해야한다.
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshObject } from './MeshObject';
import { KeyController } from './KeyController'
import { Player } from './Player'

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
const keyController =  new KeyController();

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

const defaultCannonMaterial = new CANNON.Material('default');
const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultCannonMaterial,
	defaultCannonMaterial,
	{
		friction : 1,
		restitution : 0.2
	}
);
cannonWorld.defaultContactMaterial = defaultContactMaterial;

const cannonObjects = []; // 물리엔진 영향 받을 메쉬 관리

// Mesh

/** 땅 */
const groundMesh = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	name : 'wall 1',
	width : 5,
	height : 3,
	depth : 0.2,
	z : -2.4,
})

const wall_2 = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	name : 'wall 2',
	width : 0.2,
	height : 3,
	depth : 5,
	x : -2.4
})

/** 사물 */
const desk = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	mass : 30,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	mass : 20,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	mass : 10,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
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
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	mass : 0.5,
	loader : textureLoader,
	name : 'magazine',
	width: 0.2,
	height : 0.02,
	depth : 0.29,
	x : -2.1,
	z: 1.5,
	y : 2.2,
	rotationY : THREE.MathUtils.degToRad(90),
	mapSrc : '/models/magazine.jpg'
})

const player = new Player({
	scene,
	cannonWorld,
	cannonMaterial : defaultCannonMaterial,
	mass : 70,
	width: 80,
	height : 160,
	depth : 30,
});

cannonObjects.push(groundMesh,
	floorMesh,
	wall_1,
	wall_2,
	desk,
	lamp,
	roboticVaccum,
	ashTree1,
	ashTree9,
	magazine,)


function move(){

	// forward
	if(keyController.keys['KeyW'] || keyController.keys['ArrowUp']){
		player.walk(-3, 'forward')
	}
	// backward
	if(keyController.keys['KeyS'] || keyController.keys['ArrowDown']){
		player.walk(3, 'backward')
	}
	// left
	if(keyController.keys['KeyA'] || keyController.keys['ArrowLeft']){
		player.walk(3, 'left')
	}
	// right
	if(keyController.keys['KeyD'] || keyController.keys['ArrowRight']){
		player.walk(-3, 'right')
	}
}



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
function moveCamera(){
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

	// 물리 시뮬레이션을 업데이트하는 시간 간격을 고정값으로 넣어주면 된다.
	let cannonStepTime = 1/60;
	if(delta<0.01)cannonStepTime=1/120;
	// cannonWorld의 step 메서드는 특정 시간 간격마다 호출되어,
	// 물리 세계의 상태를 지속적으로 업데이트
	cannonWorld.step(cannonStepTime, delta, 3); // 세번째 인자는 움직임에차이가 생길 경우, 보정을 시도하는 횟수
	
	for( const object  of cannonObjects){
		
		if(object.cannonBody){
		/* 
			cannonBody의 position을 mesh들이 따라가도록 설정한다. 
			cannonBody는 mesh와는 별개로써 하나의 투명 물체로 만들어져있다.
			cannon-es 로 만들어진 body는 물리엔진에 맞춰 position이 변경되지만 mesh는 변경되지않으므로
			수동으로 mesh의 위치를 변경시켜줘야한다.
		*/ 
			object.mesh.position.copy(object.cannonBody.position);
			object.mesh.quaternion.copy(object.cannonBody.quaternion)			 ;
		}
	}
 
	/**
	 * Player
	 */
	if(player.cannonBody){
		move();
	}

	moveCamera()
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


