import { GameSystem } from 'elixr';

export class GravityControlSystem extends GameSystem {
	update() {
		const gravitySliderX = document.getElementById('gravity-slider-x');
		const gravitySliderY = document.getElementById('gravity-slider-y');
		const gravitySliderZ = document.getElementById('gravity-slider-z');
		this.core.physics.gravity.set(
			gravitySliderX.value,
			gravitySliderY.value,
			gravitySliderZ.value,
		);
	}
}
