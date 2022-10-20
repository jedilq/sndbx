import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { RigidBodyComponent } from './RigidBodyComponent';
import { XRGameSystem } from 'elixr';

export class RigidBodyLauncherSystem extends XRGameSystem {
	update() {
		Object.values(this.core.controllers).forEach((controller) => {
			if (controller.gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
				const cubeMesh = new THREE.Mesh(
					new THREE.BoxGeometry(0.1, 0.1, 0.1),
					new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff }),
				);
				const cubeObject = this.core.createGameObject(cubeMesh);
				controller.targetRaySpace.getWorldPosition(cubeObject.position);
				controller.targetRaySpace.getWorldQuaternion(cubeObject.quaternion);
				cubeObject.addComponent(RigidBodyComponent, {
					active: true,
					direction: new THREE.Vector3(0, 0, -1).applyQuaternion(
						cubeObject.quaternion,
					),
					speed: 1,
					dragDecel: 0,
					rotationAxis: generateRandomVec3().normalize(),
					rotationSpeed: Math.random(),
					spinDown: 0,
					collisionSpeedReductionFactor: 0,
				});
			}
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
