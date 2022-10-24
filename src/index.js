import * as THREE from 'three';

import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
} from 'three-mesh-bvh';

import { Core } from 'elixr';
import { CubeLauncherSystem } from './js/CubeLauncherSystem';
import { JoystickMovementSystem } from './js/JoystickMovementSystem';
import { ObjectManipulationSystem } from './js/ObjectManipulationSystem';
import { SceneCreationSystem } from './js/SceneCreationSystem';
import { SnapTurnSystem } from './js/SnapTurnSystem';

// three-mesh-bvh initialization
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const core = new Core(document.getElementById('scene-container'));

core.enablePhysics();
core.physics.gravity.set(0, 0, 0);
core.physics.stepTime = 1 / 90;

core.registerGameSystem(SceneCreationSystem);
core.registerGameSystem(JoystickMovementSystem);
core.registerGameSystem(SnapTurnSystem);

core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);

document.body.append(core.vrButton);
