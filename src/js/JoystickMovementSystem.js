import * as THREE from 'three';

import { AXES, BUTTONS } from 'gamepad-wrapper';

import { XRGameSystem } from 'elixr';

const MAX_MOVEMENT_SPEED = 1;

export class JoystickMovementSystem extends XRGameSystem {
	update(delta, _time) {
		if (!this.core.controllers['left']) return;
		/**
		 * @type {import('gamepad-wrapper').GamepadWrapper}
		 */
		const gamepad = this.core.controllers['left'].gamepad;
		const xValue = gamepad.getAxis(AXES.XR_STANDARD.THUMBSTICK_X);
		const yValue = gamepad.getAxis(AXES.XR_STANDARD.THUMBSTICK_Y);
		const inputValue = gamepad.get2DInputValue(BUTTONS.XR_STANDARD.THUMBSTICK);
		const camera = this.core.renderer.xr.getCamera();
		const direction = new THREE.Vector3(xValue, 0, yValue).applyQuaternion(
			camera.getWorldQuaternion(new THREE.Quaternion()),
		);
		direction.y = 0;
		this.core.playerSpace.position.add(
			direction
				.normalize()
				.multiplyScalar(MAX_MOVEMENT_SPEED * delta * inputValue),
		);
	}
}
