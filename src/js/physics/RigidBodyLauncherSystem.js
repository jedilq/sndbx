import * as CANNON from 'cannon-es';
import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { RigidBodyComponent } from './RigidBodyComponent';
import { XRGameSystem } from 'elixr';

export class RigidBodyLauncherSystem extends XRGameSystem {
	update() {
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
					shape: new CANNON.Box(new CANNON.Vec3(0.1, 0.1, 0.1)),
					bodyType: CANNON.BODY_TYPES.DYNAMIC,
					velocity: new THREE.Vector3(0, 0, -5).applyQuaternion(
						cubeObject.quaternion,
					),
				});
			}
		});
	}
}
