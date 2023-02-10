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
import { HitTestObjectPlacingSystem } from './js/HitTestObjectPlacingSystem';
import { ObjectManipulationSystem } from './js/ObjectManipulationSystem';
import { VRSceneCreationSystem } from './js/VRSceneCreationSystem';
import { landingPageLogic } from './landing';

const core = new Core(document.getElementById('scene-container'));

const switchToVR = () => {
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
	core.playerSpace.position.set(0, 0, 0);
	core.playerSpace.quaternion.set(0, 0, 0, 1);
};

const switchToAR = () => {
	core.registerGameSystem(ARSceneCreationSystem);
	core.registerGameSystem(HitTestObjectPlacingSystem);
	core.playerSpace.position.set(0, 0, 0);
	core.playerSpace.quaternion.set(0, 0, 0, 1);
};

const vrButton = document.getElementById('vr-button');
VRButton.convertToVRButton(vrButton, core.renderer, {
	VR_NOT_ALLOWED_TEXT: 'VR BLOCKED',
	VR_NOT_SUPPORTED_TEXT: 'VR UNSUPPORTED',
	onSessionStarted: switchToVR,
	onSessionEnded: () => {},
	onUnsupported: () => {
		vrButton.style.display = 'none';
	},
});

const arButton = document.getElementById('ar-button');
ARButton.convertToARButton(arButton, core.renderer, {
	sessionInit: {
		requiredFeatures: ['local', 'hit-test', 'anchors'],
		optionalFeatures: [],
	},
	AR_NOT_ALLOWED_TEXT: 'AR BLOCKED',
	AR_NOT_SUPPORTED_TEXT: 'AR UNSUPPORTED',
	onSessionStarted: switchToAR,
	onSessionEnded: () => {},
	onUnsupported: () => {
		arButton.style.display = 'none';
	},
});

landingPageLogic();
