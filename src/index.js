import './styles/index.css';

import {
	ARButton,
	Core,
	MovementObstacle,
	MovementSurface,
	VRButton,
	XRSlideSystem,
	XRSnapTurnSystem,
	XRTeleportSystem,
} from 'elixr';

import { ARSceneCreationSystem } from './js/ARSceneCreationSystem';
import { CubeLauncherSystem } from './js/CubeLauncherSystem';
import { GravityControlSystem } from './js/GravityControlSystem';
import { InlineSceneCreationSystem } from './js/InlineSceneCreationSystem';
import { ObjectManipulationSystem } from './js/ObjectManipulationSystem';
import { VRSceneCreationSystem } from './js/VRSceneCreationSystem';
import { landingPageLogic } from './landing';

const core = new Core(document.getElementById('scene-container'));

// create vr mode
core.createWorld('vrworld');
core.switchToWorld('vrworld');
core.registerGameComponent(MovementObstacle);
core.registerGameComponent(MovementSurface);

core.registerGameSystem(XRTeleportSystem);
core.registerGameSystem(XRSlideSystem);
core.registerGameSystem(XRSnapTurnSystem);
core.registerGameSystem(VRSceneCreationSystem);
core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);
const slideConfig = core.getGameSystemConfig(XRSlideSystem);
slideConfig.MAX_MOVEMENT_SPEED = 2.5;
const switchToVR = () => {
	core.switchToWorld('vrworld');
	core.playerSpace.position.set(0, 0, 0);
	core.playerSpace.quaternion.set(0, 0, 0, 1);
};

// create ar mode
core.createWorld('arworld');
core.switchToWorld('arworld');
core.registerGameSystem(ARSceneCreationSystem);
core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);
const switchToAR = () => {
	core.switchToWorld('arworld');
	core.playerSpace.position.set(0, 0, 0);
	core.playerSpace.quaternion.set(0, 0, 0, 1);
};

// default to inline world
core.switchToWorld('default');
core.registerGameSystem(InlineSceneCreationSystem);
core.registerGameSystem(CubeLauncherSystem);
core.registerGameSystem(ObjectManipulationSystem);
core.registerGameSystem(GravityControlSystem);
const switchToInline = () => {
	core.switchToWorld('default');
	core.inlineCamera.position.set(-2.5, 0.5, -2.5);
	core.inlineCamera.lookAt(3, 2, 2);
};

switchToInline();

const vrButton = document.getElementById('vr-button');
VRButton.convertToVRButton(vrButton, core.renderer, {
	VR_NOT_ALLOWED_TEXT: 'VR BLOCKED',
	VR_NOT_SUPPORTED_TEXT: 'VR UNSUPPORTED',
	onSessionStarted: switchToVR,
	onSessionEnded: switchToInline,
	onUnsupported: () => {
		vrButton.style.display = 'none';
	},
});

const arButton = document.getElementById('ar-button');
ARButton.convertToARButton(arButton, core.renderer, {
	sessionInit: {
		requiredFeatures: ['anchors', 'plane-detection'],
		optionalFeatures: [],
	},
	AR_NOT_ALLOWED_TEXT: 'AR BLOCKED',
	AR_NOT_SUPPORTED_TEXT: 'AR UNSUPPORTED',
	onSessionStarted: switchToAR,
	onSessionEnded: switchToInline,
	onUnsupported: () => {
		arButton.style.display = 'none';
	},
});

landingPageLogic();
