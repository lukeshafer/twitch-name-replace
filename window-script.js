window.addEventListener("load", () => {
	/** @type {HTMLButtonElement | null} */
	const saveButton = document.querySelector("#save-button");
	if (!saveButton) return;

	/** @type {HTMLInputElement | null} */
	const nameInput = document.querySelector("#name-input");
	if (!nameInput) return;

	/** @type {HTMLInputElement | null} */
	const hideBadgesInput = document.querySelector("#hide-badges");
	if (!hideBadgesInput) return;

	/** @type {HTMLInputElement | null} */
	const hideColorsInput = document.querySelector("#hide-colors");
	if (!hideColorsInput) return;

	hideBadgesInput.checked =
		window.localStorage.getItem("twitch-hide-badges") === "true" ?? false;
	nameInput.value =
		window.localStorage.getItem("twitch-name-to-replace") ?? "Luke";
	hideColorsInput.checked =
		window.localStorage.getItem("twitch-hide-colors") === "true" ?? false;

	saveButton.addEventListener("click", () => {
		updateSettings();
	});

	function updateSettings() {
		chrome.tabs.query({ active: true }, (tabs) => {
			tabs.forEach((tab) => {
				chrome.tabs.sendMessage(tab.id, {
					name: nameInput.value,
					hideBadges: hideBadgesInput.checked,
					hideColors: hideColorsInput.checked,
				});
				window.localStorage.setItem("twitch-name-to-replace", nameInput.value);
				window.localStorage.setItem(
					"twitch-hide-badges",
					hideBadgesInput.checked.toString()
				);
				window.localStorage.setItem(
					"twitch-hide-colors",
					hideColorsInput.checked.toString()
				);
			});
		});
	}
});
