import {
	Collider,
	ObjectCollider,
	VerticalCollider,
} from './components/TagComponents';
import {
	LeftController,
	Occupied,
	RightController,
	VrControllerComponent,
} from './components/VrControllerComponent';

import { GameStateComponent } from './components/GameStateComponent';
import { GrabbableComponent } from './components/GrabbableComponent';
import { HandAnimationSystem } from './systems/input/HandAnimationSystem';
import { HandComponent } from './components/HandComponent';
import { Object3DComponent } from './components/Object3DComponent';
import { ObjectGNTSystem } from './systems/physics/ObjectGNTSystem';
import { RenderingSystem } from './systems/core/RenderingSystem';
import { RigidBodyComponent } from './components/RigidBodyComponent';
import { RigidBodyPhysicsSystem } from './systems/physics/RigidBodyPhysicsSystem';
import { SceneCreationSystem } from './systems/core/SceneCreationSystem';
import { SnapTurnSystem } from './systems/locomotion/SnapTurnSystem';
import { TeleportSystem } from './systems/locomotion/TeleportSystem';
import { VrInputSystem } from './systems/input/VrInputSystem';
import { World } from 'ecsy';
import { WristMenuSystem } from './systems/input/WristMenuSystem';

export const setupECSY = () => {
	let world = new World();

	registerTagComponents(world);

	registerComponents(world);

	registerSystems(world);

	return world;
};

/**
 * Register TagComponents
 * @param {World} world
 */
const registerTagComponents = (world) => {
	world.registerComponent(Collider);
	world.registerComponent(VerticalCollider);
	world.registerComponent(ObjectCollider);
	world.registerComponent(RightController);
	world.registerComponent(LeftController);
	world.registerComponent(Occupied);
};

/**
 * Regitser normal components
 * @param {World} world
 */
const registerComponents = (world) => {
	world.registerComponent(GameStateComponent);
	world.registerComponent(Object3DComponent);
	world.registerComponent(VrControllerComponent);
	world.registerComponent(RigidBodyComponent);
	world.registerComponent(HandComponent);
	world.registerComponent(GrabbableComponent);
};

/**
 * Register systems in execution order
 * @param {World} world
 */
const registerSystems = (world) => {
	world.registerSystem(SceneCreationSystem);
	// input
	world.registerSystem(VrInputSystem);
	world.registerSystem(HandAnimationSystem);
	// locomotion
	world.registerSystem(TeleportSystem);
	world.registerSystem(SnapTurnSystem);
	// object manipulation
	world.registerSystem(ObjectGNTSystem);
	world.registerSystem(RigidBodyPhysicsSystem);

	world.registerSystem(WristMenuSystem);
	world.registerSystem(RenderingSystem);
};
