import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { InteractiveObjectComponent } from './InterativeObjectComponent';
import { XRGameSystem } from 'elixr';

export class ObjectPrototypeWallSystem extends XRGameSystem {
	init() {
		const cubePrototype = new THREE.Mesh(
			new THREE.BoxGeometry(0.2, 0.2, 0.2),
			new THREE.MeshStandardMaterial({ color: 0xffffff }),
		);
		cubePrototype.position.set(-0.3, 1.7, -1);
		this.core.scene.add(cubePrototype);

		const spherePrototype = new THREE.Mesh(
			new THREE.SphereGeometry(0.1, 32, 16),
			new THREE.MeshStandardMaterial({ color: 0xffffff }),
		);
		spherePrototype.position.set(0, 1.7, -1);
		this.core.scene.add(spherePrototype);

		const conePrototype = new THREE.Mesh(
			new THREE.ConeGeometry(0.1, 0.2, 32),
			new THREE.MeshStandardMaterial({ color: 0xffffff }),
		);
		conePrototype.position.set(0.3, 1.7, -1);
		this.core.scene.add(conePrototype);

		this._prototypeObjects = [cubePrototype, spherePrototype, conePrototype];
	}

	update() {
		this._prototypeObjects.forEach((prototypeObject) => {
			let highlightController = null;
			Object.values(this.core.controllers).forEach((controller) => {
				const targetRaySpace = controller.targetRaySpace;
				const gamepad = controller.gamepad;
				const distance = prototypeObject
					.getWorldPosition(new THREE.Vector3())
					.distanceTo(targetRaySpace.getWorldPosition(new THREE.Vector3()));
				if (distance < 0.1) {
					highlightController = controller;
					if (gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
						const object = prototypeObject.clone();
						object.material = new THREE.MeshStandardMaterial({
							color: 0xffffff,
						});
						targetRaySpace.attach(object);
						const gameObject = this.core.createGameObject(object);
						gameObject.addComponent(InteractiveObjectComponent, {
							attachedController: controller,
						});
					}
				}
			});

			if (highlightController) {
				prototypeObject.material.color.setHex(0x4c8bf5);
			} else {
				prototypeObject.material.color.setHex(0xffffff);
			}
		});
	}
}
