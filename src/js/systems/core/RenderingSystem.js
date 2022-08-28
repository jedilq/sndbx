import { GameStateComponent } from '../../components/GameStateComponent';
import { System } from 'ecsy';

export class RenderingSystem extends System {
	execute(/*delta, time*/) {
		this.queries.gameManager.results.forEach((entity) => {
			let gameStateComponent = entity.getComponent(GameStateComponent);
			let renderer = gameStateComponent.renderer;
			let scene = gameStateComponent.scene;
			let camera = gameStateComponent.camera;

			renderer.render(scene, camera);
		});
	}
}

RenderingSystem.queries = {
	gameManager: { components: [GameStateComponent] },
};
