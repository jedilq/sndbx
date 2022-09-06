import * as THREE from 'three';

import { BUTTONS } from 'gamepad-wrapper';
import { XRGameSystem } from 'elixr';

const LOCOMOTION_CONSTANTS = {
	SNAP_TURN_ANGLE_MIN: (Math.PI / 180) * 45,
	SNAP_TURN_ANGLE_MAX: (Math.PI / 180) * 135,
	SNAP_TURN_VALUE_MIN: 0.95,
	SNAP_TURN_LEFT_QUAT: new THREE.Quaternion(0, 0.3826834, 0, 0.9238795),
	SNAP_TURN_RIGHT_QUAT: new THREE.Quaternion(0, -0.3826834, 0, 0.9238795),
	TELEPORT_ANGLE_MIN: (Math.PI / 180) * 135,
	TELEPORT_ANGLE_MAX: (Math.PI / 180) * 180,
	TELEPORT_VALUE_MIN: 0.95,
	JOYSTICK_STATE: {
		DISENGAGED: 0,
		LEFT: 1,
		RIGHT: 2,
		BACK: 3,
	},
	MOVEMENT_SPEED: 2.0,
};

export class SnapTurnSystem extends XRGameSystem {
	init() {
		this.prevState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED;
	}

	update(_delta, _time) {
		if (!this.core.controllers['right']) return;
		/**
		 * @type {import('gamepad-wrapper').GamepadWrapper}
		 */
		const gamepad = this.core.controllers['right'].gamepad;
		const inputAngle = gamepad.get2DInputAngle(BUTTONS.XR_STANDARD.THUMBSTICK);
		const inputValue = gamepad.get2DInputValue(BUTTONS.XR_STANDARD.THUMBSTICK);
		let curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED;

		if (
			Math.abs(inputAngle) > LOCOMOTION_CONSTANTS.SNAP_TURN_ANGLE_MIN &&
			Math.abs(inputAngle) <= LOCOMOTION_CONSTANTS.SNAP_TURN_ANGLE_MAX &&
			inputValue >= LOCOMOTION_CONSTANTS.SNAP_TURN_VALUE_MIN
		) {
			if (inputAngle > 0) {
				curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.RIGHT;
			} else {
				curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.LEFT;
			}
		}
		if (this.prevState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED) {
			if (curState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.RIGHT) {
				this.core.playerSpace.quaternion.multiply(
					LOCOMOTION_CONSTANTS.SNAP_TURN_RIGHT_QUAT,
				);
			} else if (curState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.LEFT) {
				this.core.playerSpace.quaternion.multiply(
					LOCOMOTION_CONSTANTS.SNAP_TURN_LEFT_QUAT,
				);
			}
		}
		this.prevState = curState;
	}
}
