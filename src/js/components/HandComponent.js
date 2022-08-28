import { Component, Types } from 'ecsy';

export const HAND_MODE = {
	FIST: 'fist',
	GRAB: 'grab',
	HOLD: 'hold',
};

export class HandComponent extends Component {
	resetGrabSpace() {
		const d = this.getAttachedEntity().handedness == 'RIGHT' ? 1 : -1;
		this.grabSpace.quaternion.set(
			-0.4210100716628344,
			d * 0.07898992833716563,
			d * 0.03683360850073487,
			0.9028590122851735,
		);
		this.grabSpace.position.set(0, 0, 0);
	}
}

HandComponent.schema = {
	joints: { type: Types.Ref, default: undefined },
	poses: { type: Types.Ref, default: undefined },
	mode: { type: Types.String, default: HAND_MODE.FIST },
	model: { type: Types.Ref, default: undefined },
	overrideParent: { type: Types.Boolean, default: false },
	overrideMode: { type: Types.String, default: HAND_MODE.FIST },
	grabSpace: { type: Types.Ref, default: undefined },
	indexTip: { type: Types.Ref, default: undefined },
	wristMenuCreated: { type: Types.Boolean, default: false },
};
