(function() {
	/**
	 * Check and set a global guard variable to ensure that if this content
	 * script is injected into a page again, it returns (and does nothing).
	 */
	if (window.hasRun) return;
	window.hasRun = true;

	function insertBeast(beastURL) {
		removeExistingBeasts();
		let beastImage = document.createElement("img");
		beastImage.setAttribute("src", beastURL);
		beastImage.style.objectFit = "contain";
		beastImage.style.position = "fixed";
		beastImage.style.height = "100%";
		beastImage.style.width = "100%";
		beastImage.className = "beastify-image";
		document.body.appendChild(beastImage);
	}

	function removeExistingBeasts() {
		let existingBeasts = document.querySelectorAll(".beastify-image");
		for (let beast of existingBeasts) {
			beast.remove();
		}
	}

	browser.runtime.onMessage.addListener((message) => {
		if (message.command === "beastify") {
			insertBeast(message.beastURL);
		} else if (message.command === "reset") {
			removeExistingBeasts();
		}
	});
})();
