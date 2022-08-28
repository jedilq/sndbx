import * as THREE from 'three';

import {
	checkButtonIntersect,
	createLongButton,
	createRoundButton,
} from '../../utils/buttonUtils';

import { InteractionSystem } from '../../utils/ecsyUtils';

const BUTTON_RADIUS = 0.015;
const BUTTON_TIMEOUT = 0.5;

export class WristMenuSystem extends InteractionSystem {
	init() {
		this.watchObject = null;
		this.exitButton = null;
		this.confirmExitButton = null;
		this.infoButton = null;
		this._helperVec3 = new THREE.Vector3();
		this.buttonTimer = 0;
		this.motorFunctionsPanel = null;
	}

	onExecute(delta, _time) {
		if (!this.handComponents.LEFT.wristMenuCreated) {
			this.exitButton = createRoundButton(
				BUTTON_RADIUS,
				'assets/images/exit_button.png',
				'assets/images/exit_button_pressed.png',
			);
			this.infoButton = createRoundButton(
				BUTTON_RADIUS,
				'assets/images/info_button.png',
				'assets/images/info_button_pressed.png',
			);
			this.confirmExitButton = createLongButton(
				0.08,
				0.03,
				'assets/images/confirm_exit_button.png',
			);

			this.createMotorFunctionsPanel();

			this.watchObject = new THREE.Group();
			this.watchObject.position.set(0.015, 0.1, 0.08);
			this.watchObject.rotateZ((-Math.PI / 2 / 90) * 80);
			this.watchObject.rotateY((-Math.PI / 2 / 90) * -135);
			this.watchObject.rotateZ((-Math.PI / 2 / 90) * -90);
			this.watchObject.rotateY((-Math.PI / 2 / 90) * 90);

			this.handComponents.LEFT.model.add(this.watchObject);

			this.infoButton.position.z = -0.005;
			this.infoButton.position.x = 0.018;
			this.watchObject.add(this.infoButton);
			this.exitButton.position.z = -0.005;
			this.exitButton.position.x = -0.018;
			this.watchObject.add(this.exitButton);
			this.confirmExitButton.position.z = -0.005;
			this.confirmExitButton.position.y = -0.036;
			this.confirmExitButton.visible = false;
			this.watchObject.add(this.confirmExitButton);

			this.handComponents.LEFT.wristMenuCreated = true;

			return false;
		} else {
			if (this.buttonTimer > 0) {
				this.buttonTimer -= delta;
				this.buttonTimer = Math.max(this.buttonTimer, 0);
			} else {
				if (checkButtonIntersect(this.handComponents.RIGHT, this.infoButton)) {
					this.buttonTimer = BUTTON_TIMEOUT;
					this.infoButton.toggle();
					this.motorFunctionsPanel.visible = this.infoButton.pressed;
				} else if (
					checkButtonIntersect(this.handComponents.RIGHT, this.exitButton)
				) {
					this.buttonTimer = BUTTON_TIMEOUT;
					this.exitButton.toggle();
					this.confirmExitButton.visible = this.exitButton.pressed;
				}

				if (this.infoButton.pressed) {
					this.watchObject.getWorldPosition(this._helperVec3);
					this._helperVec3.y += 0.2;
					this.motorFunctionsPanel.position.copy(this._helperVec3);
					this.motorFunctionsPanel.lookAt(
						this.gameStateComponent.renderer.xr
							.getCamera()
							.getWorldPosition(this._helperVec3),
					);
					this._helperVec3
						.sub(this.motorFunctionsPanel.position)
						.normalize()
						.multiplyScalar(0.1);
					this.motorFunctionsPanel.position.sub(this._helperVec3);
				}

				if (this.confirmExitButton.visible) {
					if (
						checkButtonIntersect(
							this.handComponents.RIGHT,
							this.confirmExitButton,
						)
					) {
						this.buttonTimer = BUTTON_TIMEOUT;
						this.gameStateComponent.renderer.xr.getSession()?.end();
					}
				}
			}
		}
	}

	createMotorFunctionsPanel() {
		const map = new THREE.TextureLoader().load(
			'assets/images/motor_functions_panel.png',
		);
		const material = new THREE.MeshBasicMaterial({
			map: map,
			transparent: true,
		});

		this.motorFunctionsPanel = new THREE.Mesh(
			new THREE.PlaneGeometry(0.2, 0.2),
			material,
		);

		this.gameStateComponent.scene.add(this.motorFunctionsPanel);
	}
}
