const hidePage = `body > :not(.beastify-image) {
					display: none !important;
				  }`;

function listenForClicks() {
	document.addEventListener("click", async (e) => {
		function beastNameToURL(beastName) {
			switch (beastName) {
				case "Frog":
					return browser.runtime.getURL("beasts/frog.jpg");
				case "Snake":
					return browser.runtime.getURL("beasts/snake.jpg");
				case "Turtle":
					return browser.runtime.getURL("beasts/turtle.jpg");
			}
		}

		async function beastify(tab) {
			await browser.scripting.insertCSS({
				target: { tabId: tab.id },
				css: hidePage,
			});
			const url = beastNameToURL(e.target.textContent);
			await browser.tabs.sendMessage(tab.id, {
				command: "beastify",
				beastURL: url,
			});
		}

		async function reset(tab) {
			await browser.scripting.removeCSS({
				target: { tabId: tab.id },
				css: hidePage,
			});
			await browser.tabs.sendMessage(tab.id, { command: "reset" });
		}

		function reportError(error) {
			console.error(`Could not beastify: ${error}`);
		}

		// Ignore when click is not on a button within <div id="popup-content">.
		if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
			return;
		}

		try {
			const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

			if (e.target.type === "reset") {
				await reset(tab);
			} else {
				await beastify(tab);
			}
		} catch (error) {
			reportError(error);
		}
	});
}

function reportExecuteScriptError(error) {
	document.querySelector("#popup-content").classList.add("hidden");
	document.querySelector("#error-content").classList.remove("hidden");
	console.error(`Failed to execute beastify content script: ${error.message}`);
}

(async function runOnPopupOpened() {
	try {
		const [tab] = await browser.tabs.query({ active: true, currentWindow: true });

		await browser.scripting.executeScript({
			target: { tabId: tab.id },
			files: ["/content_scripts/beastify.js"],
		});
		listenForClicks();
	} catch (e) {
		reportExecuteScriptError(e);
	}
})();
