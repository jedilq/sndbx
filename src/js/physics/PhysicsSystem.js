import * as CANNON from 'cannon-es';
import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { GameSystem } from 'elixr';

export class PhysicsSystem extends GameSystem {
	init() {
		// eslint-disable-next-line no-undef
		// const CN = CANNON;
		// this.physicsWorld = new CN.World({
		// 	gravity: new CN.Vec3(0, 0, -9.82), // m/s²
		// });

		const world = new CANNON.World();
		world.gravity.set(0, 0, 0);
		world.broadphase = new CANNON.NaiveBroadphase();
		world.solver.iterations = 10;

		var radius = 0.2; // m
		var sphereBody = new CANNON.Body({
			mass: 5,
			shape: new CANNON.Sphere(radius),
		});
		world.addBody(sphereBody);

		const geometry = new THREE.SphereGeometry(0.2, 32, 16);
		const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
		const sphere = new THREE.Mesh(geometry, material);
		this.core.scene.add(sphere);
		sphere.position.set(0, 10, -2);
		sphereBody.position.copy(sphere.position);

		// const box = new THREE.Mesh(
		// 	new THREE.BoxGeometry(6, 0.02, 6),
		// 	new THREE.MeshBasicMaterial({ color: 0xffff00, side: THREE.DoubleSide }),
		// );
		// this.core.scene.add(box);
		// box.position.set(0, 0, 0);

		// var groundBody = new CANNON.Body({
		// 	mass: 0,
		// 	shape: new CANNON.Box(new CANNON.Vec3(3, 0.01, 3)),
		// });
		// world.addBody(groundBody);
		// groundBody.position.copy(box.position);
		// groundBody.quaternion.copy(box.quaternion);

		this._createBox(
			world,
			{ x: 6, y: 0.02, z: 6 },
			0,
			new THREE.Vector3(0, 0, 0),
			0xff5f1f,
			false,
		);

		this._createBox(
			world,
			{ x: 6, y: 0.02, z: 6 },
			0,
			new THREE.Vector3(0, 6, 0),
			0xff5f1f,
			false,
		);

		this._createBox(
			world,
			{ x: 6, y: 6, z: 0.02 },
			0,
			new THREE.Vector3(0, 3, -3),
			0x3a3b3c,
			false,
		);

		this._createBox(
			world,
			{ x: 6, y: 6, z: 0.02 },
			0,
			new THREE.Vector3(0, 3, 3),
			0x3a3b3c,
			false,
		);

		this._createBox(
			world,
			{ x: 0.02, y: 6, z: 6 },
			0,
			new THREE.Vector3(3, 3, 0),
			0x3a3b3c,
			false,
		);

		this._createBox(
			world,
			{ x: 0.02, y: 6, z: 6 },
			0,
			new THREE.Vector3(-3, 3, 0),
			0x3a3b3c,
			false,
		);

		this.pw = world;
		this.body = sphereBody;
		this.mesh = sphere;

		this.meshes = [];

		for (let i = 0; i < 10; i++) {
			const box = this._createBox(
				world,
				{ x: 0.5, y: 0.5, z: 0.5 },
				0.1,
				generateRandomVec3(3),
				0xfff000,
			);

			box.userData.rigidBody.velocity.set(Math.random(), Math.random(), -0.5);

			this.meshes.push(box);
		}

		window.resetBody = () => {
			sphereBody.velocity.setZero();
			sphereBody.force.setZero();
			sphereBody.position.set(0, 10, -2);
			console.log(this.pw.gravity);
		};
	}

	update(_delta, _time) {
		this.pw.step(1 / 60);
		if (this.body) {
			this.mesh.position.copy(this.body.position);
			// console.log(this.mesh.position);
		}
		this.meshes.forEach((mesh) => {
			mesh.position.copy(mesh.userData.rigidBody.position);
			mesh.quaternion.copy(mesh.userData.rigidBody.quaternion);
		});

		Object.values(this.core.controllers).forEach((controller) => {
			if (controller.gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
				this.meshes.push(this._shootBox(this.pw, 0.2, controller));
			}
		});
	}

	_createBox(physicsWorld, dimensions, mass, position, color, visible = true) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(dimensions.x, dimensions.y, dimensions.z),
			new THREE.MeshStandardMaterial({ color, side: THREE.DoubleSide }),
		);
		this.core.scene.add(box);
		box.position.copy(position);
		box.visible = visible;

		var groundBody = new CANNON.Body({
			mass,
			shape: new CANNON.Box(
				new CANNON.Vec3(dimensions.x / 2, dimensions.y / 2, dimensions.z / 2),
			),
		});
		physicsWorld.addBody(groundBody);
		groundBody.position.copy(box.position);
		groundBody.quaternion.copy(box.quaternion);
		box.userData.rigidBody = groundBody;
		return box;
	}

	_shootBox(physicsWorld, mass, controller) {
		const box = new THREE.Mesh(
			new THREE.BoxGeometry(0.2, 0.2, 0.2),
			new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
		);
		this.core.scene.add(box);
		controller.targetRaySpace.getWorldPosition(box.position);
		controller.targetRaySpace.getWorldQuaternion(box.quaternion);

		var groundBody = new CANNON.Body({
			mass,
			shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)),
		});
		physicsWorld.addBody(groundBody);
		groundBody.position.copy(box.position);
		groundBody.quaternion.copy(box.quaternion);
		box.userData.rigidBody = groundBody;

		const direction = new THREE.Vector3(0, 0, -5).applyQuaternion(
			box.quaternion,
		);

		box.userData.rigidBody.velocity.set(direction.x, direction.y, direction.z);
		return box;
	}
}

const generateRandomVec3 = (axisMax = 1) => {
	return new THREE.Vector3(
		Math.random() * axisMax,
		Math.random() * axisMax,
		Math.random() * axisMax,
	);
};
