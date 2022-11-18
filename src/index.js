import { ConnectionComponent, ConnectionSystem } from './js/ConnectionSystem';
import {
	Core,
	MovementObstacle,
	MovementSurface,
	XRSlideSystem,
	XRSnapTurnSystem,
	XRTeleportSystem,
} from 'elixr';

import { CubeLauncherSystem } from './js/CubeLauncherSystem';
import { ObjectManipulationSystem } from './js/ObjectManipulationSystem';
import { SceneCreationSystem } from './js/SceneCreationSystem';

const core = new Core(document.getElementById('scene-container'));

core.enablePhysics();
core.physics.gravity.set(0, 0, 0);
core.physics.solverIterations = 2;
core.physics.stepTime = 1 / 90;

core.registerGameComponent(MovementSurface);
core.registerGameComponent(MovementObstacle);
core.registerGameComponent(ConnectionComponent);

core.registerGameSystem(XRTeleportSystem);
core.registerGameSystem(XRSlideSystem);
core.registerGameSystem(XRSnapTurnSystem);
core.registerGameSystem(SceneCreationSystem);
core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);
core.registerGameSystem(ConnectionSystem);

const slideConfig = core.getGameSystemConfig(XRSlideSystem);
slideConfig.MAX_MOVEMENT_SPEED = 2.5;

document.body.append(core.vrButton);
