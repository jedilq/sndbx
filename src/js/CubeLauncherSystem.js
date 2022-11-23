import {
	BUTTONS,
	Physics,
	RigidBodyComponent,
	THREE,
	XRGameSystem,
} from 'elixr';

import { ConnectionComponent } from './ConnectionSystem';

export class CubeLauncherSystem extends XRGameSystem {
	update() {
		const connection = this.core.game.getMutableComponent(ConnectionComponent);

		Object.values(this.core.controllers).forEach((controller) => {
			if (controller.gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
				const cubeMesh = new THREE.Mesh(
					new THREE.BoxGeometry(0.2, 0.2, 0.2),
					new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
				);
				const cubeObject = this.core.createGameObject(cubeMesh);
				controller.targetRaySpace.getWorldPosition(cubeObject.position);
				controller.targetRaySpace.getWorldQuaternion(cubeObject.quaternion);
				cubeObject.addComponent(RigidBodyComponent, {
					mass: 1,
					shape: new Physics.Box(new THREE.Vector3(0.1, 0.1, 0.1)),
					type: Physics.BODY_TYPES.DYNAMIC,
					initVelocity: new THREE.Vector3(0, 0, -5).applyQuaternion(
						cubeObject.quaternion,
					),
				});
				connection?.outgoingCubes.push({
					position: cubeObject.position.toArray(),
					quaternion: cubeObject.quaternion.toArray(),
					initVelocity: new THREE.Vector3(0, 0, -5)
						.applyQuaternion(cubeObject.quaternion)
						.toArray(),
				});
			}
		});

		connection?.incomingCubes.forEach((cube) => {
			const cubeMesh = new THREE.Mesh(
				new THREE.BoxGeometry(0.2, 0.2, 0.2),
				new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
			);
			const cubeObject = this.core.createGameObject(cubeMesh);
			cubeObject.position.fromArray(cube.position);
			cubeObject.quaternion.fromArray(cube.quaternion);
			cubeObject.addComponent(RigidBodyComponent, {
				mass: 1,
				shape: new Physics.Box(new THREE.Vector3(0.1, 0.1, 0.1)),
				type: Physics.BODY_TYPES.DYNAMIC,
				initVelocity: new THREE.Vector3().fromArray(cube.initVelocity),
			});
		});

		if (connection) connection.incomingCubes.length = 0;
	}
}
