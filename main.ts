import { Plugin } from "obsidian";

export default class OpenInNewTabPlugin extends Plugin {
	async onload() {
		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, "click", this.handleClick, {
			capture: true,
		});
	}

	onunload() {}

	handleClick(event: MouseEvent) {
		const target = event.target as Element;
		const isNavFile =
			target?.classList?.contains("nav-file-title") ||
			target?.classList?.contains("nav-file-title-content");
		const titleEl = target?.closest(".nav-file-title");
		// Make sure it's just a left click so we don't interfere with anything.
		const pureClick =
			!event.shiftKey &&
			!event.ctrlKey &&
			!event.metaKey &&
			!event.shiftKey &&
			!event.altKey;

		if (isNavFile && titleEl && pureClick) {
			// Probably not the best...
			event.stopPropagation();
			const path = titleEl.getAttribute("data-path");
			if (path) {
				// This logic is borrowed from the obsidian-no-dupe-leaves plugin
				// https://github.com/patleeman/obsidian-no-dupe-leaves/blob/master/src/main.ts#L32-L46
				let result = false;
				app.workspace.iterateAllLeaves((leaf) => {
					const viewState = leaf.getViewState();
					if (viewState.state?.file === path) {
						app.workspace.setActiveLeaf(leaf);
						result = true;
					}
				});
				if (!result) {
					window.app.workspace.openLinkText(path, path, true);
				}
			}
		}
	}
}
