import * as THREE from 'three';

import { AXES } from '../../lib/ControllerInterface';
import { HandComponent } from '../../components/HandComponent';
import { System } from 'ecsy';
import { VrControllerComponent } from '../../components/VrControllerComponent';

export class HandAnimationSystem extends System {
	init() {
		this._helperQuat = new THREE.Quaternion();
	}

	execute(_delta, _time) {
		this.queries.controllers.results.forEach((entity) => {
			let handComponent = entity.getMutableComponent(HandComponent);

			if (handComponent.overrideParent) {
				this.setPose(handComponent, handComponent.overrideMode, 1, 1);
			} else {
				let controllerInterface = entity.getComponent(VrControllerComponent)
					.controllerInterface;

				let indexStep = controllerInterface.getAxisInput(AXES.INDEX_TRIGGER);
				let handStep = controllerInterface.getAxisInput(AXES.HAND_TRIGGER);

				this.setPose(handComponent, handComponent.mode, indexStep, handStep);
			}
		});
	}

	setPose(handComponent, targetMode, indexStep, handStep) {
		let defaultHandPose = handComponent.poses['default'];
		let targetHandPose = handComponent.poses[targetMode];

		for (const [jointKey, jointNode] of Object.entries(handComponent.joints)) {
			let inputValue = jointKey.startsWith('index') ? indexStep : handStep;
			this._helperQuat.slerpQuaternions(
				defaultHandPose[jointKey],
				targetHandPose[jointKey],
				inputValue,
			);
			jointNode.quaternion.copy(this._helperQuat);
		}
	}
}

HandAnimationSystem.queries = {
	controllers: { components: [VrControllerComponent, HandComponent] },
};
