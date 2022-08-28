import * as THREE from 'three';

export class CurvedRaycaster {
	constructor(
		origin,
		direction,
		numSegments = 10,
		shootingSpeed = 4,
		minY = -1,
	) {
		this.numSegments = numSegments;
		this.points = Array.from(
			{ length: this.numSegments + 1 },
			() => new THREE.Vector3(),
		);
		this.shootingSpeed = shootingSpeed;
		this.minY = minY;
		this.raycaster = new THREE.Raycaster(origin, direction);

		this.isCurved = true;
	}

	set(origin, direction) {
		const g = -9.8;
		const a = new THREE.Vector3(0, g, 0);
		let v0 = new THREE.Vector3();
		v0.copy(direction).multiplyScalar(this.shootingSpeed);
		let max_t = calculateMaxTime(origin, v0, a, this.minY);
		let dt = max_t / this.numSegments;
		let newPos = new THREE.Vector3();
		for (var i = 0; i < this.numSegments + 1; i++) {
			parabolicCurve(origin, v0, a, dt * i, newPos);
			this.points[i].copy(newPos);
		}
	}

	setShootingSpeed(shootingSpeed) {
		this.shootingSpeed = shootingSpeed;
	}

	intersectObject(object, recursive = false, intersects = []) {
		this.intersectObjects([object], recursive, intersects);
	}

	intersectObjects(objects, recursive = false, intersects = []) {
		let p1, p2;
		for (let i = 0; i < this.numSegments; i++) {
			p1 = this.points[i];
			p2 = this.points[i + 1];
			let segment = p2.clone().sub(p1);
			this.raycaster.far =
				segment.length() * (i == this.numSegments - 1 ? 1.1 : 1);
			this.raycaster.set(p1, segment.normalize());
			const segmentIntersetcs = this.raycaster.intersectObjects(
				objects,
				recursive,
			);

			intersects = intersects.concat(segmentIntersetcs);
		}
		return intersects;
	}
}

const calculateMaxTime = (p0, v0, a, minY) => {
	let p1 = a.y / 2;
	let p2 = v0.y;
	let p3 = p0.y - minY;
	// solve p1*x^2 + p2*x + p3 = 0
	var t = (-1 * p2 - Math.sqrt(Math.pow(p2, 2) - 4 * p1 * p3)) / (2 * p1);
	return t;
};

// Utils
// Parabolic motion equation, y = p0 + v0*t + 1/2at^2
const parabolicCurveScalar = (p0, v0, a, t) => {
	return p0 + v0 * t + 0.5 * a * t * t;
};

// Parabolic motion equation applied to 3 dimensions
const parabolicCurve = (p0, v0, a, t, out) => {
	out.x = parabolicCurveScalar(p0.x, v0.x, a.x, t);
	out.y = parabolicCurveScalar(p0.y, v0.y, a.y, t);
	out.z = parabolicCurveScalar(p0.z, v0.z, a.z, t);
	return out;
};
