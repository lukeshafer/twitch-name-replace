let count = 0;
let nameToReplace =
	window.localStorage.getItem("twitch-name-to-replace") ?? "Luke";
let hideBadgesSetting =
	window.localStorage.getItem("twitch-hide-badges") === "true";
let hideColorsSetting =
	window.localStorage.getItem("twitch-hide-colors") === "true";

window.addEventListener("load", () => {
	checkForElement();
	const myStylesheet = new CSSStyleSheet();
	myStylesheet.replaceSync(`
		.LS___color-hidden {
			color: #888 !important;
		}
	`);
	document.adoptedStyleSheets = [...document.adoptedStyleSheets, myStylesheet];
});

function checkForElement() {
	const chatWrapper = document.querySelector(
		".chat-scrollable-area__message-container"
	);
	if (!chatWrapper) {
		count++;
		if (++count < 10) setTimeout(checkForElement, 1000);
		return;
	}

	updateAllElements();
	setObserver(chatWrapper);
}

/**
 * @param {Element} el
 * */
function setObserver(el) {
	/** @type {MutationObserverInit} */
	const config = { attributes: false, childList: true, subtree: false };

	// @ts-ignore
	chrome.runtime.onMessage.addListener(({ name, hideBadges, hideColors }) => {
		window.localStorage.setItem("twitch-name-to-replace", name);
		window.localStorage.setItem("twitch-hide-badges", hideBadges.toString());
		window.localStorage.setItem("twitch-hide-colors", hideColors.toString());
		nameToReplace = name;
		hideBadgesSetting = hideBadges;
		hideColorsSetting = hideColors;

		updateAllElements();
	});

	/** @type {MutationCallback} */
	const callback = (mutationList) => {
		for (const { type, addedNodes } of mutationList) {
			if (type !== "childList") continue;
			// TODO do the thing
			addedNodes.forEach((node) => {
				if (
					!(node instanceof HTMLDivElement) ||
					!node.classList.contains("chat-line__message")
				)
					return;
				updateElement(node);
			});
		}
	};

	const observer = new MutationObserver(callback);
	observer.observe(el, config);

	window.addEventListener("beforeunload", () => {
		observer.disconnect();
	});
}

/** @param {Element} el */
function updateElement(el) {
	const displayName = el.querySelector(".chat-author__display-name");
	if (!(displayName instanceof HTMLElement)) return;
	displayName.textContent = nameToReplace;

	if (hideBadgesSetting) {
		const badges = el.querySelectorAll(".chat-badge");
		badges.forEach((badge) => {
			if (badge instanceof HTMLElement) badge.style.display = "none";
		});
	} else {
		const badges = el.querySelector(".chat-badge");
		if (badges instanceof HTMLElement) badges.style.display = "inline-block";
	}

	if (hideColorsSetting) {
		displayName.classList.add("LS___color-hidden");
	} else {
		displayName.classList.remove("LS___color-hidden");
	}
}

function updateAllElements() {
	const chatWrapper = document.querySelector(
		".chat-scrollable-area__message-container"
	);
	chatWrapper
		?.querySelectorAll(".chat-line__message")
		.forEach((el) => updateElement(el));
}
