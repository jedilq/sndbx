import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { InteractiveObjectComponent } from './InterativeObjectComponent';
import { XRGameSystem } from 'elixr';

export class ObjectManipulationSystem extends XRGameSystem {
	update(_delta, _time) {
		this.queryGameObjects('interactiveObjects').forEach((gameObject) => {
			const interactiveObjectComponent = gameObject.getMutableComponent(
				InteractiveObjectComponent,
			);
			if (interactiveObjectComponent.attachedController) {
				const gamepad = interactiveObjectComponent.attachedController.gamepad;
				if (!gamepad.getButton(BUTTONS.XR_STANDARD.TRIGGER)) {
					this.core.scene.attach(gameObject);
					interactiveObjectComponent.attachedController = null;

					console.log('detach');
				}
			} else {
				let highlightController = null;
				Object.values(this.core.controllers).forEach((controller) => {
					const targetRaySpace = controller.targetRaySpace;
					const gamepad = controller.gamepad;
					const distance = gameObject
						.getWorldPosition(new THREE.Vector3())
						.distanceTo(targetRaySpace.getWorldPosition(new THREE.Vector3()));
					if (distance < 0.1) {
						highlightController = controller;
						if (gamepad.getButtonDown(BUTTONS.XR_STANDARD.TRIGGER)) {
							interactiveObjectComponent.attachedController = controller;
							targetRaySpace.attach(gameObject);
							highlightController = null;
						}
					}
				});

				if (highlightController) {
					gameObject.children[0].material.color.setHex(0xfff000);
				} else {
					gameObject.children[0].material.color.setHex(0xffffff);
				}
			}
		});
	}
}

ObjectManipulationSystem.queries = {
	interactiveObjects: { components: [InteractiveObjectComponent] },
};
