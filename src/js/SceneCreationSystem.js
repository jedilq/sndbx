import * as THREE from 'three';

import { BoxLineGeometry } from 'three/examples/jsm/geometries/BoxLineGeometry';
import { RigidBodyComponent } from './physics/RigidBodyComponent';
import { SingleUseGameSystem } from 'elixr';

const ORIENTATION = {
	TOP_BOTTOM: 0,
	FRONT_BACK: 1,
	LEFT_RIGHT: 2,
};

export class SceneCreationSystem extends SingleUseGameSystem {
	update() {
		const room = new THREE.LineSegments(
			new BoxLineGeometry(5.89, 5.89, 5.89, 10, 10, 10),
			new THREE.LineBasicMaterial({ color: 0x808080 }),
		);
		room.geometry.translate(0, 3, 0);
		this.core.scene.add(room);
		this.core.scene.background = new THREE.Color(0x505050);

		// this._createWall(
		// 	new THREE.Vector3(0, 0, 0),
		// 	0xff5f1f,
		// 	ORIENTATION.TOP_BOTTOM,
		// );

		// this._createWall(
		// 	new THREE.Vector3(0, 6, 0),
		// 	0x3a3b3c,
		// 	ORIENTATION.TOP_BOTTOM,
		// );

		// this._createWall(
		// 	new THREE.Vector3(3, 3, 0),
		// 	0x3a3b3c,
		// 	ORIENTATION.LEFT_RIGHT,
		// );

		// this._createWall(
		// 	new THREE.Vector3(-3, 3, 0),
		// 	0x3a3b3c,
		// 	ORIENTATION.LEFT_RIGHT,
		// );

		// this._createWall(
		// 	new THREE.Vector3(0, 3, -3),
		// 	0x3a3b3c,
		// 	ORIENTATION.FRONT_BACK,
		// );

		// this._createWall(
		// 	new THREE.Vector3(0, 3, 3),
		// 	0x3a3b3c,
		// 	ORIENTATION.FRONT_BACK,
		// );

		const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
		this.core.scene.add(ambientLight);

		const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
		this.core.scene.add(directionalLight);

		// for (let i = 0; i < 100; i++) {
		// 	this._createRandomRigidBody();
		// }
	}

	_createWall(position, color, orientation) {
		const wallMesh = new THREE.Mesh(
			new THREE.BoxGeometry(6, 6, 0.01),
			new THREE.MeshStandardMaterial({
				color,
				side: THREE.DoubleSide,
			}),
		);
		const wallObject = this.core.createGameObject(wallMesh);
		if (orientation == ORIENTATION.TOP_BOTTOM) {
			wallObject.rotateX(Math.PI / 2);
		} else if (orientation == ORIENTATION.LEFT_RIGHT) {
			wallObject.rotateY(Math.PI / 2);
		}
		wallObject.position.copy(position);
		wallObject.addComponent(RigidBodyComponent, {
			active: false,
		});
		wallObject.userData.isWall = true;
	}

	_createRandomRigidBody() {
		const cubeMesh = new THREE.Mesh(
			new THREE.BoxGeometry(0.1, 0.1, 0.1),
			new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
		);
		const cubeObject = this.core.createGameObject(cubeMesh);
		cubeObject.position.set(
			Math.random() * 6 - 3,
			Math.random() * 6,
			Math.random() * 6 - 3,
		);
		cubeObject.lookAt(generateRandomVec3(1000));
		cubeObject.addComponent(RigidBodyComponent, {
			active: true,
			direction: generateRandomVec3().normalize(),
			speed: Math.random() * 0.5,
			dragDecel: 0,
			rotationAxis: generateRandomVec3().normalize(),
			rotationSpeed: Math.random(),
			spinDown: 0,
			collisionSpeedReductionFactor: 0,
		});
	}
}

const generateRandomVec3 = (axisMax = 1) => {
	return new THREE.Vector3(
		Math.random() * axisMax,
		Math.random() * axisMax,
		Math.random() * axisMax,
	);
};
