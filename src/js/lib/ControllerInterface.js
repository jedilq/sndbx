import * as THREE from 'three';

export const TRIGGERS = {
	INDEX_TRIGGER: 0,
	HAND_TRIGGER: 1,
};

export const BUTTONS = {
	THUMBSTICK: 0,
	BUTTON_1: 1,
	BUTTON_2: 2,
};

export const AXES = {
	INDEX_TRIGGER: 0,
	HAND_TRIGGER: 1,
	THUMBSTICK_X: 2,
	THUMBSTICK_Y: 3,
};

const INPUT_MAPPING = {
	INDEX_TRIGGER: 0,
	HAND_TRIGGER: 1,
	THUMBSTICK: 3,
	BUTTON_1: 4,
	BUTTON_2: 5,
};

const AXES_MAPPING = {
	INDEX_TRIGGER: 0,
	HAND_TRIGGER: 1,
	THUMBSTICK_X: 2,
	THUMBSTICK_Y: 3,
};

export class ControllerInterface {
	constructor(controller, gamepad, controllerModel) {
		this._clock = new THREE.Clock();
		this._controller = controller;
		this._gamepad = gamepad;
		this._vec3 = new THREE.Vector3();
		this._quat = new THREE.Quaternion();

		this.controllerModel = controllerModel;

		this._buttonInput = {};
		for (let key in BUTTONS) {
			this._buttonInput[BUTTONS[key]] = {
				cf_pressed: false,
				lf_pressed: false,
				cf_touched: false,
				lf_touched: false,
				pressed_since: 0,
			};
		}

		this._triggerInput = {};
		for (let key in TRIGGERS) {
			this._triggerInput[TRIGGERS[key]] = {
				cf_pressed: false,
				lf_pressed: false,
				cf_fullyPressed: false,
				lf_fullyPressed: false,
				cf_touched: false,
				lf_touched: false,
			};
		}

		this._axisInput = {};
		this._axisInput[AXES.INDEX_TRIGGER] = 0;
		this._axisInput[AXES.HAND_TRIGGER] = 0;
		this._axisInput[AXES.THUMBSTICK_X] = 0;
		this._axisInput[AXES.THUMBSTICK_Y] = 0;
	}

	getPosition() {
		this._controller.getWorldPosition(this._vec3);
		return this._vec3.clone();
	}

	getQuaternion() {
		this._controller.getWorldQuaternion(this._quat);
		return this._quat.clone();
	}

	getDirection() {
		this._controller.getWorldDirection(this._vec3);
		return this._vec3.clone().negate();
	}

	getButtonInput(button) {
		return this._buttonInput[button];
	}

	getTriggerInput(trigger) {
		return this._triggerInput[trigger];
	}

	getAxisInput(axis) {
		if (axis === AXES.INDEX_TRIGGER || axis === AXES.HAND_TRIGGER) {
			return this._gamepad.buttons[axis].value;
		} else {
			return this._axisInput[axis];
		}
	}

	buttonPressed(button) {
		return this._buttonInput[button].cf_pressed;
	}

	triggerPressed(trigger) {
		return this._triggerInput[trigger].cf_fullyPressed;
	}

	buttonJustPressed(button) {
		return (
			this._buttonInput[button].cf_pressed &&
			!this._buttonInput[button].lf_pressed
		);
	}

	buttonLongPressed(button, duration) {
		if (!this.buttonPressed(button)) return false;
		let elapsedTime = this._clock.getElapsedTime();
		let pressed_for = elapsedTime - this._buttonInput[button].pressed_since;
		if (pressed_for >= duration) {
			this._buttonInput[button].pressed_since = elapsedTime;
			return true;
		} else {
			return false;
		}
	}

	buttonJustReleased(button) {
		return (
			!this._buttonInput[button].cf_pressed &&
			this._buttonInput[button].lf_pressed
		);
	}

	triggerJustPressed(trigger) {
		return (
			this._triggerInput[trigger].cf_fullyPressed &&
			!this._triggerInput[trigger].lf_fullyPressed
		);
	}

	triggerJustReleased(trigger) {
		return (
			!this._triggerInput[trigger].cf_fullyPressed &&
			this._triggerInput[trigger].lf_fullyPressed
		);
	}

	getJoystickAngle() {
		let axisX = this.getAxisInput(AXES.THUMBSTICK_X);
		let axisY = this.getAxisInput(AXES.THUMBSTICK_Y);
		let rad = Math.atan(axisX / axisY);
		if (axisX == 0 && axisY == 0) {
			return NaN;
		}
		if (axisX >= 0) {
			if (axisY < 0) {
				rad *= -1;
			} else if (axisY > 0) {
				rad = Math.PI - rad;
			} else if (axisY == 0) {
				rad = Math.PI / 2;
			}
		} else {
			if (axisY < 0) {
				rad *= -1;
			} else if (axisY > 0) {
				rad = -Math.PI - rad;
			} else if (axisY == 0) {
				rad = -Math.PI / 2;
			}
		}
		return rad;
	}

	getJoystickValue() {
		let axisX = this.getAxisInput(AXES.THUMBSTICK_X);
		let axisY = this.getAxisInput(AXES.THUMBSTICK_Y);
		return Math.sqrt(axisX * axisX + axisY * axisY);
	}

	pulse(intensity, duration) {
		this._gamepad.hapticActuators[0].pulse(intensity, duration);
	}

	update() {
		// update triggers
		for (let key in TRIGGERS) {
			let triggerId = TRIGGERS[key];
			let triggerGamepadIndex = INPUT_MAPPING[key];
			let triggerData = this._triggerInput[triggerId];
			let triggerGamepadData = this._gamepad.buttons[triggerGamepadIndex];

			triggerData.lf_pressed = triggerData.cf_pressed;
			triggerData.lf_fullyPressed = triggerData.cf_fullyPressed;
			triggerData.lf_touched = triggerData.cf_touched;

			triggerData.cf_pressed = triggerGamepadData.value > 0;
			triggerData.cf_fullyPressed = triggerGamepadData.pressed;
			triggerData.cf_touched = triggerGamepadData.touched;
		}

		// update binary buttons
		for (let key in BUTTONS) {
			let buttonId = BUTTONS[key];
			let buttonGamepadIndex = INPUT_MAPPING[key];
			let buttonData = this._buttonInput[buttonId];
			let buttonGamepadData = this._gamepad.buttons[buttonGamepadIndex];

			buttonData.lf_pressed = buttonData.cf_pressed;
			buttonData.lf_touched = buttonData.cf_touched;

			buttonData.cf_pressed = buttonGamepadData.pressed;
			buttonData.cf_touched = buttonGamepadData.touched;

			if (!buttonData.lf_pressed && buttonData.cf_pressed) {
				buttonData.pressed_since = this._clock.getElapsedTime();
			}
		}

		// update thumbstick
		for (let key in AXES) {
			let axisId = AXES[key];
			let axisGamepadIndex = AXES_MAPPING[key];
			this._axisInput[axisId] = this._gamepad.axes[axisGamepadIndex];
		}
	}
}
