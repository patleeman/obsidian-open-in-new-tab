import { Plugin } from "obsidian";

export default class OpenInNewTabPlugin extends Plugin {
	async onload() {
		this.registerDomEvent(document, "click", this.handleClick, {
			capture: true,
		});
	}

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
			const path = titleEl.getAttribute("data-path");
			if (path) {
				// This logic is borrowed from the obsidian-no-dupe-leaves plugin
				// https://github.com/patleeman/obsidian-no-dupe-leaves/blob/master/src/main.ts#L32-L46
				let result = false;
				// Check if there is an "empty" view which I think means there is a new tab tab open. If so, we want to use that.
				app.workspace.iterateAllLeaves((leaf) => {
					const viewState = leaf.getViewState();
					if (viewState.state?.file === path) {
						app.workspace.setActiveLeaf(leaf);
						result = true;
					}
				});

				// If we have a "New Tab" tab open, just switch to that and let
				// the default behavior open the file in that.
				const emptyLeaves = app.workspace.getLeavesOfType("empty");
				if (emptyLeaves.length > 0) {
					app.workspace.setActiveLeaf(emptyLeaves[0]);
					return;
				}

				if (!result) {
					event.stopPropagation(); // This might break something...
					window.app.workspace.openLinkText(path, path, true);
				}
			}
		}
	}
}
