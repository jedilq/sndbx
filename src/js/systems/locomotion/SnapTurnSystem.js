import { InteractionSystem } from '../../utils/ecsyUtils';
import { LOCOMOTION_CONSTANTS } from '../../Constants';

export class SnapTurnSystem extends InteractionSystem {
	init() {
		this.prevState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED;
	}

	onExecute(_delta, _time) {
		this._update(
			this.controllerInterfaces.RIGHT,
			this.gameStateComponent.viewerTransform,
		);
	}

	/**
	 * Check current axis state, execute snap turn when state changes
	 * @param {ControllerInterface} controllerInterface
	 * @param {THREE.Group} viewerTransform
	 */
	_update(controllerInterface, viewerTransform) {
		let axisRad = controllerInterface.getJoystickAngle();
		let axisVal = controllerInterface.getJoystickValue();
		let curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED;

		if (
			Math.abs(axisRad) > LOCOMOTION_CONSTANTS.SNAP_TURN_ANGLE_MIN &&
			Math.abs(axisRad) <= LOCOMOTION_CONSTANTS.SNAP_TURN_ANGLE_MAX &&
			axisVal >= LOCOMOTION_CONSTANTS.SNAP_TURN_VALUE_MIN
		) {
			if (axisRad > 0) {
				curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.RIGHT;
			} else {
				curState = LOCOMOTION_CONSTANTS.JOYSTICK_STATE.LEFT;
			}
		}
		if (this.prevState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.DISENGAGED) {
			if (curState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.RIGHT) {
				viewerTransform.quaternion.multiply(
					LOCOMOTION_CONSTANTS.SNAP_TURN_RIGHT_QUAT,
				);
			} else if (curState == LOCOMOTION_CONSTANTS.JOYSTICK_STATE.LEFT) {
				viewerTransform.quaternion.multiply(
					LOCOMOTION_CONSTANTS.SNAP_TURN_LEFT_QUAT,
				);
			}
		}
		this.prevState = curState;
	}
}
