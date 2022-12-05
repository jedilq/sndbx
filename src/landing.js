export const landingPageLogic = () => {
	const uiPanel = document.getElementById('ui-panel');
	const gravityControls = document.getElementById('gravity-controls');

	const inlineButton = document.getElementById('inline-button');
	inlineButton.onclick = () => {
		uiPanel.style.transform = `translateY(${uiPanel.offsetHeight}px)`;
		gravityControls.style.opacity = 0.9;
	};

	const foldGravityControlsButton = document.getElementById(
		'fold-gravity-controls',
	);
	foldGravityControlsButton.onclick = () => {
		uiPanel.style.transform = `translateY(0px)`;
		gravityControls.style.opacity = 0;
	};

	const foldLinksButton = document.getElementById('fold-links');
	const foldLinksVerticalLine = foldLinksButton.getElementsByClassName(
		'fold-vertical-line',
	)[0];
	const linksPanel = document.getElementsByClassName('links-panel')[0];
	foldLinksButton.onclick = () => {
		if (foldLinksVerticalLine.style.display === 'none') {
			linksPanel.style.display = 'none';
			foldLinksVerticalLine.style.display = 'block';
		} else {
			linksPanel.style.display = 'block';
			foldLinksVerticalLine.style.display = 'none';
		}
	};
};
