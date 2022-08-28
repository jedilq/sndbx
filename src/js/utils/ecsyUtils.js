import { GameStateComponent } from '../components/GameStateComponent';
import { HandComponent } from '../components/HandComponent';
import { Object3DComponent } from '../components/Object3DComponent';
import { System } from 'ecsy';
import { VrControllerComponent } from '../components/VrControllerComponent';

/**
 *
 * @param {*} query
 * @param {*} strict
 * @returns {import('ecsy').Entity?}
 */
export const getOnlyEntity = (query, strict = true) => {
	if (query.results.length !== 1) {
		if (strict) {
			throw 'number of queried entities = ' + query.results.length + ', != 1';
		} else {
			return null;
		}
	}
	return query.results[0];
};

export const deleteEntity = (entity) => {
	if (!entity) return;
	// make sure that any refs on the entity are cleaned up.
	if (entity.hasComponent(Object3DComponent)) {
		let mesh = entity.getComponent(Object3DComponent).value;
		if (mesh.geometry) {
			mesh.geometry.dispose();
		}

		if (mesh.material) {
			if (mesh.material.length) {
				for (let i = 0; i < mesh.material.length; ++i) {
					mesh.material[i].dispose();
				}
			} else {
				mesh.material.dispose();
			}
		}

		mesh.parent.remove(mesh);
	}

	if (entity.alive) entity.remove(true);
};

export class InteractionSystem extends System {
	constructor(world, attributes) {
		super(world, attributes);

		this._reset();
	}

	_reset() {
		this.gameStateComponent = null;

		this.controllerEntities = {
			LEFT: null,
			RIGHT: null,
		};

		this.controllerInterfaces = {
			LEFT: null,
			RIGHT: null,
		};

		this.handComponents = {
			LEFT: null,
			RIGHT: null,
		};
	}

	/**
	 * Overriding the execute method of ECSY System, executing shared queries
	 * Subclasses of InteractionSystem SHOULD NOT implement this function
	 * @param {Number} delta - float number of seconds elapsed since last call
	 * @param {Number} time - float number of seconds elapsed in total
	 */
	execute(delta, time) {
		this._reset();

		this.gameStateComponent = getOnlyEntity(
			this.queries.gameManager,
			false,
		).getMutableComponent(GameStateComponent);

		this.queries.controllers.results.forEach((entity) => {
			let vrControllerComponent = entity.getComponent(VrControllerComponent);
			let handComponent = entity.getMutableComponent(HandComponent);
			this.controllerEntities[entity.handedness] = entity;
			this.controllerInterfaces[entity.handedness] =
				vrControllerComponent.controllerInterface;
			this.handComponents[entity.handedness] = handComponent;
		});

		if (
			this.gameStateComponent == null ||
			this.controllerInterfaces.LEFT == null ||
			this.controllerInterfaces.RIGHT == null
		) {
			return;
		}

		this.onExecute(delta, time);
	}

	/**
	 * This function is called for each run of world, custom logic goes here
	 * Subclasses of InteractionSystem SHOULD implement this function
	 * @param {Number} delta - float number of seconds elapsed since last call
	 * @param {Number} time - float number of seconds elapsed in total
	 */
	onExecute(_delta, _time) {
		throw 'Subclasses MUST OVERRIDE onExecute(delta, time)';
	}
}

InteractionSystem.queries = {
	controllers: { components: [VrControllerComponent, HandComponent] },
	gameManager: { components: [GameStateComponent] },
};

/**
 * this method defines shared queries for all interactionSystems, and add
 * additional queries to existing ones
 * @param {*} additionalQueries
 */
InteractionSystem.addQueries = function (additionalQueries) {
	this.queries = Object.assign(this.queries, additionalQueries);
};

export class GameSystem extends System {
	constructor(world, attributes) {
		super(world, attributes);

		this._reset();
	}

	_reset() {
		this.gameStateComponent = null;
	}

	/**
	 * Overriding the execute method of ECSY System, executing shared queries
	 * Subclasses of InteractionSystem SHOULD NOT implement this function
	 * @param {Number} delta - float number of seconds elapsed since last call
	 * @param {Number} time - float number of seconds elapsed in total
	 */
	execute(delta, time) {
		this._reset();

		this.gameStateComponent = getOnlyEntity(
			this.queries.gameManager,
			false,
		).getMutableComponent(GameStateComponent);

		this.onExecute(delta, time);
	}

	/**
	 * This function is called for each run of world, custom logic goes here
	 * Subclasses of InteractionSystem SHOULD implement this function
	 * @param {Number} delta - float number of seconds elapsed since last call
	 * @param {Number} time - float number of seconds elapsed in total
	 */
	onExecute(_delta, _time) {
		throw 'Subclasses MUST OVERRIDE onExecute(delta, time)';
	}
}

GameSystem.queries = {
	gameManager: { components: [GameStateComponent] },
};

/**
 * this method defines shared queries for all interactionSystems, and add
 * additional queries to existing ones
 * @param {*} additionalQueries
 */
GameSystem.addQueries = function (additionalQueries) {
	this.queries = Object.assign(this.queries, additionalQueries);
};
