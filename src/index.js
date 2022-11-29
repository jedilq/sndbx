import './styles/index.css';

import {
	Core,
	MovementObstacle,
	MovementSurface,
	THREE,
	VRButton,
} from 'elixr';

// import { ARButton } from 'three/examples/jsm/webxr/ARButton';
// import { ARSceneCreationSystem } from './js/ARSceneCreationSystem';
import { CubeLauncherSystem } from './js/CubeLauncherSystem';
import { InlineSceneCreationSystem } from './js/InlineSceneCreationSystem';
import { ObjectManipulationSystem } from './js/ObjectManipulationSystem';

const core = new Core(document.getElementById('scene-container'));

core.enablePhysics();
core.physics.gravity.set(0, 0, 0);
core.physics.solverIterations = 2;
core.physics.stepTime = 1 / 90;

core.registerGameComponent(MovementObstacle);
core.registerGameComponent(MovementSurface);

// core.registerGameSystem(XRTeleportSystem);
// core.registerGameSystem(XRSlideSystem);
// core.registerGameSystem(XRSnapTurnSystem);
// core.registerGameSystem(SceneCreationSystem);
// core.registerGameSystem(ARSceneCreationSystem);
core.registerGameSystem(InlineSceneCreationSystem);
core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);

// const slideConfig = core.getGameSystemConfig(XRSlideSystem);
// slideConfig.MAX_MOVEMENT_SPEED = 2.5;

// document.body.append(core.vrButton);

// document.body.append(
// 	ARButton.createButton(core.renderer, {
// 		requiredFeatures: ['anchors', 'plane-detection'],
// 		optionalFeatures: [],
// 	}),
// );

VRButton.convertToVRButton(document.getElementById('vr-button'), core.renderer);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
core.scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.2);
core.scene.add(directionalLight);
