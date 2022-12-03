export const landingPageLogic = () => {
	const foldDescButton = document.getElementById('fold-desc');
	const foldDescVerticalLine = foldDescButton.getElementsByClassName(
		'fold-vertical-line',
	)[0];
	const uiPanel = document.getElementById('ui-panel');
	foldDescButton.onclick = () => {
		if (foldDescVerticalLine.style.display === 'none') {
			uiPanel.style.transform = `translateY(${uiPanel.offsetHeight}px)`;
			foldDescVerticalLine.style.display = 'block';
		} else {
			uiPanel.style.transform = `translateY(0px)`;
			foldDescVerticalLine.style.display = 'none';
		}
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
