import * as THREE from 'three';

import { BUTTONS, Physics, RigidBodyComponent, XRGameSystem } from 'elixr';

const GRABBING_DISTANCE = 0.1;

export class ObjectManipulationSystem extends XRGameSystem {
	init() {
		this.objectInHand = { left: null, right: null };
	}

	update() {
		Object.entries(this.core.controllers).forEach(
			([handedness, controller]) => {
				const objectInHand = this.objectInHand[handedness];
				if (objectInHand) {
					if (
						controller.gamepad.getButtonValue(BUTTONS.XR_STANDARD.SQUEEZE) < 0.8
					) {
						this.core.scene.attach(objectInHand);
						objectInHand.getMutableComponent(RigidBodyComponent).type =
							Physics.BODY_TYPES.DYNAMIC;
						this.objectInHand[handedness] = null;
					}
				} else {
					if (
						controller.gamepad.getButtonValue(BUTTONS.XR_STANDARD.SQUEEZE) > 0.8
					) {
						const closestObject = { object: null, distance: Infinity };
						this.queryGameObjects('rigidBodies').forEach((gameObject) => {
							if (
								gameObject == this.objectInHand.left ||
								gameObject == this.objectInHand.right
							)
								return;

							const distance = gameObject
								.getWorldPosition(new THREE.Vector3())
								.distanceTo(
									controller.targetRaySpace.getWorldPosition(
										new THREE.Vector3(),
									),
								);
							if (
								distance < GRABBING_DISTANCE &&
								distance < closestObject.distance
							) {
								closestObject.object = gameObject;
								closestObject.distance = distance;
							}
						});
						if (closestObject.object) {
							controller.targetRaySpace.attach(closestObject.object);
							closestObject.object.getMutableComponent(
								RigidBodyComponent,
							).type = Physics.BODY_TYPES.KINEMATIC;
							this.objectInHand[handedness] = closestObject.object;
						}
					}
				}
			},
		);
	}
}

ObjectManipulationSystem.queries = {
	rigidBodies: { components: [RigidBodyComponent] },
};
