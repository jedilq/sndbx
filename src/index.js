import * as THREE from 'three';

import {
	GameStateComponent,
	createPlayerTransform,
} from './js/components/GameStateComponent';
import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
} from 'three-mesh-bvh';

import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { setupECSY } from './js/ECSYConfig';

const world = setupECSY();
const clock = new THREE.Clock();
let controls = null;

// three-mesh-bvh initialization
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

init();

function init() {
	let container = document.getElementById('scene-container');

	let scene = new THREE.Scene();
	scene.background = new THREE.Color(0x000000);

	let camera = new THREE.PerspectiveCamera(
		50,
		window.innerWidth / window.innerHeight,
		0.1,
		100,
	);

	let renderer = new THREE.WebGLRenderer({
		antialias: true,
		multiviewStereo: true,
	});
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.outputEncoding = THREE.sRGBEncoding;
	renderer.xr.enabled = true;
	container.appendChild(renderer.domElement);

	// controls

	controls = new MapControls(camera, renderer.domElement);

	controls.enableDamping = true;
	controls.dampingFactor = 0.05;

	controls.screenSpacePanning = true;

	controls.minDistance = 0.1;
	controls.maxDistance = 5;

	controls.maxPolarAngle = Math.PI / 2;
	camera.position.set(0, 1.5, 2);
	camera.lookAt(new THREE.Vector3(7, 2, -10));
	document.body.appendChild(VRButton.createButton(renderer));
	// VRButton.createButton(document.getElementById('enter-vr'), renderer);

	const gameManager = world.createEntity();
	gameManager.addComponent(GameStateComponent, {
		renderer: renderer,
		scene: scene,
		camera: camera,
		viewerTransform: createPlayerTransform(scene, camera),
	});

	renderer.xr.addEventListener('sessionstart', function () {
		console.log('session start');
	});

	function onWindowResize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize(window.innerWidth, window.innerHeight);
	}

	window.addEventListener('resize', onWindowResize, false);

	renderer.setAnimationLoop(render);
}

function render() {
	const delta = clock.getDelta();
	const elapsedTime = clock.elapsedTime;
	world.execute(delta, elapsedTime);
	controls.update();
}
