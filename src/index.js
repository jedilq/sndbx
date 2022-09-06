import * as THREE from 'three';

import {
	acceleratedRaycast,
	computeBoundsTree,
	disposeBoundsTree,
} from 'three-mesh-bvh';

import { Core } from 'elixr';
import { InteractiveObjectComponent } from './js/object-manipulation/InterativeObjectComponent';
import { JoystickMovementSystem } from './js/JoystickMovementSystem';
import { ObjectManipulationSystem } from './js/object-manipulation/ObjectManipulationSystem';
import { ObjectPrototypeWallSystem } from './js/object-manipulation/ObjectPrototypeWallSystem';
import { SceneCreationSystem } from './js/SceneCreationSystem';
import { SnapTurnSystem } from './js/SnapTurnSystem';

// three-mesh-bvh initialization
THREE.BufferGeometry.prototype.computeBoundsTree = computeBoundsTree;
THREE.BufferGeometry.prototype.disposeBoundsTree = disposeBoundsTree;
THREE.Mesh.prototype.raycast = acceleratedRaycast;

const core = new Core(document.getElementById('scene-container'));

core.registerGameSystem(SceneCreationSystem);
core.registerGameSystem(JoystickMovementSystem);
core.registerGameSystem(SnapTurnSystem);

core.registerGameComponent(InteractiveObjectComponent);
core.registerGameSystem(ObjectPrototypeWallSystem);
core.registerGameSystem(ObjectManipulationSystem);
