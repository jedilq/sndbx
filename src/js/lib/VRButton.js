class VRButton {
	static createButton(button, renderer) {
		function showEnterVR() {
			button.vrSupported = true;
			let currentSession = null;

			async function onSessionStarted(session) {
				session.addEventListener('end', onSessionEnded);
				await renderer.xr.setSession(session);
				currentSession = session;
			}

			function onSessionEnded(/*event*/) {
				currentSession.removeEventListener('end', onSessionEnded);
				currentSession = null;
			}

			button.onclick = function () {
				if (currentSession === null) {
					const sessionInit = {
						optionalFeatures: [
							'local-floor',
							'bounded-floor',
							'hand-tracking',
							'layers',
						],
					};
					navigator.xr
						.requestSession('immersive-vr', sessionInit)
						.then(onSessionStarted);
				} else {
					currentSession.end();
				}
			};
		}

		function showVRNotSupported() {
			button.vrSupported = true;
			button.disabled = true;
			button.onclick = null;
		}

		if ('xr' in navigator) {
			navigator.xr
				.isSessionSupported('immersive-vr')
				.then(function (supported) {
					supported ? showEnterVR() : showVRNotSupported();

					if (supported && VRButton.xrSessionIsGranted) {
						button.click();
					}
				})
				.catch(showVRNotSupported);
		} else {
			button.disabled = true;
		}
	}

	static registerSessionGrantedListener() {
		if ('xr' in navigator) {
			// WebXRViewer (based on Firefox) has a bug where addEventListener
			// throws a silent exception and aborts execution entirely.
			if (/WebXRViewer\//i.test(navigator.userAgent)) return;

			navigator.xr.addEventListener('sessiongranted', () => {
				VRButton.xrSessionIsGranted = true;
			});
		}
	}
}

VRButton.xrSessionIsGranted = false;
VRButton.registerSessionGrantedListener();

export { VRButton };
