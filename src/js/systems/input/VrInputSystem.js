import { System } from 'ecsy';
import { VrControllerComponent } from '../../components/VrControllerComponent';

export class VrInputSystem extends System {
	execute(_delta, _time) {
		this.queries.controller.results.forEach((entity) => {
			let vrControllerComponent = entity.getComponent(VrControllerComponent);
			vrControllerComponent.controllerInterface.update();
		});
	}
}

VrInputSystem.queries = {
	controller: { components: [VrControllerComponent] },
};
