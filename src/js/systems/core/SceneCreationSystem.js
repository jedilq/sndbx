import * as THREE from 'three';

import {
	LeftController,
	RightController,
	VrControllerComponent,
} from '../../components/VrControllerComponent';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { Collider } from '../../components/TagComponents';
import { ControllerInterface } from '../../lib/ControllerInterface';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { GameStateComponent } from '../../components/GameStateComponent';
import { HandComponent } from '../../components/HandComponent';
import { Object3DComponent } from '../../components/Object3DComponent';
import { System } from 'ecsy';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory';

export class SceneCreationSystem extends System {
	init() {
		this.controllerEntities = {
			LEFT: null,
			RIGHT: null,
		};
		this.scene = null;
		this.environmentCreated = false;
	}

	execute(_delta, _time) {
		this.queries.gameManager.added.forEach((entity) => {
			let gameStateComponent = entity.getComponent(GameStateComponent);
			this.scene = gameStateComponent.scene;
			let renderer = gameStateComponent.renderer;
			let viewerTransform = gameStateComponent.viewerTransform;

			createLighting(this.scene);
			setupControllers(
				renderer,
				viewerTransform,
				this.world,
				this.controllerEntities,
			);
		});

		if (this.scene && !this.environmentCreated) {
			this.createEnvironment();
			this.environmentCreated = true;
		}
	}

	createEnvironment() {
		const room = new THREE.LineSegments(
			new BoxLineGeometry(6, 6, 6, 10, 10, 10),
			new THREE.LineBasicMaterial({ color: 0x808080 }),
		);
		room.geometry.translate(0, 3, 0);
		this.scene.add(room);
		this.scene.background = new THREE.Color(0x505050);

		const colliderObject = new THREE.Mesh(
			new THREE.BoxGeometry(5, 6, 5),
			new THREE.MeshStandardMaterial({
				color: 0x00ff00,
				side: THREE.BackSide,
			}),
		);
		colliderObject.geometry.translate(0, 3, 0);
		colliderObject.visible = false;
		this.scene.add(colliderObject);

		const colliderEntity = this.world.createEntity();
		colliderEntity.addComponent(Object3DComponent, { value: colliderObject });
		colliderEntity.addComponent(Collider);
	}
}

SceneCreationSystem.queries = {
	gameManager: { components: [GameStateComponent], listen: { added: true } },
};

/**
 * create lighting for scene
 * @param {THREE.Scene} scene
 */
const createLighting = (scene) => {
	let ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
	scene.add(ambientLight);

	let directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
	scene.add(directionalLight);
};

/**
 * Setup controllers and create wrappers for them.
 * @param {THREE.WebGLRenderer} renderer - webgl renderer for the scene
 * @param {THREE.Object3D} viewerTransform - position of the player
 * @param {ecsy.World} world - the ECSY world
 */
const setupControllers = (
	renderer,
	viewerTransform,
	world,
	controllerEntities,
) => {
	const controllerModelFactory = new XRControllerModelFactory();

	for (let i = 0; i < 2; i++) {
		let controller = renderer.xr.getController(i);
		viewerTransform.add(controller);
		controller.addEventListener('connected', function (event) {
			let handedness = event.data.handedness.toUpperCase();
			if (!event.data.gamepad) return;
			if (controllerEntities[handedness]) {
				let controllerEntity = controllerEntities[handedness];
				controllerEntity
					.getComponent(VrControllerComponent)
					.controllerInterface.controllerModel.parent.remove(
						controllerEntity.getComponent(VrControllerComponent)
							.controllerInterface.controllerModel,
					);
				controllerEntity
					.getComponent(HandComponent)
					.model.parent.remove(
						controllerEntity.getComponent(HandComponent).model,
					);
				controllerEntity.remove();
			}
			let controllerGrip = renderer.xr.getControllerGrip(i);
			let controllerModel = controllerModelFactory.createControllerModel(
				controllerGrip,
			);
			controllerGrip.add(controllerModel);
			viewerTransform.add(controllerGrip);

			let controllerEntity = world.createEntity();
			let controllerInterface = new ControllerInterface(
				this,
				event.data.gamepad,
				controllerModel,
			);
			controllerEntity.addComponent(VrControllerComponent, {
				model: controllerModel,
				controllerInterface,
			});
			controllerEntity.addComponent(
				handedness === 'LEFT' ? LeftController : RightController,
			);
			controllerEntity.handedness = handedness;

			setupHands(handedness, controllerModel, controllerGrip, controllerEntity);
			controllerEntities[handedness] = controllerEntity;
		});
	}
};

const setupHands = (
	handedness,
	controllerModel,
	controllerGrip,
	controllerEntity,
) => {
	let loader = new GLTFLoader();

	loader.load('assets/hand-' + handedness + '.glb', function (gltf) {
		let models = gltf.scene;

		let poses = {};
		let joints = {};
		let defaultModel = null;
		let indexTip = null;

		models.children.forEach((model) => {
			let jointQuaternions = {};
			let isDefaultModel = model.name == 'default';
			if (isDefaultModel) {
				defaultModel = model;
			}

			model.traverse((node) => {
				if (node.type == 'Bone') {
					let jointKey = node.name.split('_')[0];
					jointQuaternions[jointKey] = node.quaternion.clone();

					if (isDefaultModel) {
						joints[jointKey] = node;
						if (jointKey == 'index3') {
							indexTip = new THREE.Object3D();
							indexTip.position.set(0, 0.03, 0);
							node.add(indexTip);
						}
					}
				}
			});
			poses[model.name] = jointQuaternions;
		});

		controllerModel.visible = false;
		controllerGrip.add(defaultModel);
		let grabSpace = new THREE.Object3D();
		controllerGrip.add(grabSpace);
		document.addEventListener('keydown', onDocumentKeyDown, false);
		function onDocumentKeyDown(event) {
			var keyCode = event.which;
			if (keyCode == 87) {
				grabSpace.position.y += 0.001;
			} else if (keyCode == 83) {
				grabSpace.position.y -= 0.001;
			} else if (keyCode == 65) {
				grabSpace.position.x -= 0.001;
			} else if (keyCode == 68) {
				grabSpace.position.x += 0.001;
			} else if (keyCode == 81) {
				grabSpace.position.z -= 0.001;
			} else if (keyCode == 69) {
				grabSpace.position.z += 0.001;
			} else if (keyCode == 85) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(0.0087265, 0, 0, 0.9999619),
				);
			} else if (keyCode == 74) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(-0.0087265, 0, 0, 0.9999619),
				);
			} else if (keyCode == 73) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(0, 0.0087265, 0, 0.9999619),
				);
			} else if (keyCode == 75) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(0, -0.0087265, 0, 0.9999619),
				);
			} else if (keyCode == 79) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(0, 0, 0.0087265, 0.9999619),
				);
			} else if (keyCode == 76) {
				grabSpace.quaternion.multiply(
					new THREE.Quaternion(0, 0, -0.0087265, 0.9999619),
				);
			} else if (keyCode == 13) {
				console.log(handedness, grabSpace.quaternion, grabSpace.position);
			}
		}

		controllerEntity.addComponent(HandComponent, {
			joints: joints,
			poses: poses,
			model: defaultModel,
			grabSpace: grabSpace,
			indexTip: indexTip,
		});

		controllerEntity.getComponent(HandComponent).resetGrabSpace();
	});
};
