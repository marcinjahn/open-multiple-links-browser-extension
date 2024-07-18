/**
 * Checks whether the user selection contains any links
 */
export function selectionContainsLinks(): boolean {
    const rawHtml = getRawHtml(document.getSelection());
    let links = extractLinks(rawHtml);

    return links.length > 0;
}

/**
 * Retrieves all links from the user's selection
 */
export function getLinksFromSelection(): string[] {
    const rawHtml = getRawHtml(document.getSelection());

    let links = extractLinks(rawHtml);
    links = addHostIfMissing(links);
    links = addSchemaIfMissing(links);

    // remove duplicates
    return [...new Set(links.filter((a) => a))];
}

/**
 * Retrieves selected HTML
 * @param selection
 */
function getRawHtml(selection: Selection) {
    try {
        const range = selection.getRangeAt(0);
        const fragment = range.cloneContents();

        const tempDiv = document.createElement("div");
        tempDiv.appendChild(fragment);
        const html = tempDiv.innerHTML;
        tempDiv.remove();
        return html;
    } catch (e) {}
    return "";
}

/**
 * Extracts all anchor hrefs from the provided HTML fragment
 * @param rawHtml Selected HTML
 */
function extractLinks(rawHtml: string): string[] {
    const regexp = /<a\s+(?:[^>]*?[\s"']+)?href=(["'])(?<url>(?!mailto:).*?)\1/gim;
    return Array.from(rawHtml.matchAll(regexp)).map((n) => n.groups.url);
}

/**
 * Adds the current page origin to the links if they are
 * relative
 * @param links Input links
 */
function addHostIfMissing(links: string[]): string[] {
    const origin = window.location.origin;

    return links.map((link) => {
        if (link.startsWith("/")) {
            return `${origin}${link}`;
        } else if (link.startsWith(".")) {
            return `${origin}/${link}`;
        }

        return link;
    });
}

/**
 * Adds the https:// schema to links that do not have a schema.
 * There's a risk that https is not actually the right schema for
 * a given URL, but it will be the right choice in most cases.
 * The chrome.tabs.create API requires schema to be present
 * in provided URLs.
 * @param links Input links
 */
function addSchemaIfMissing(links: string[]): string[] {
    return links.map((link) => {
        if (link.indexOf("://") !== -1) {
            return link;
        }

        return "https://" + link;
    });
}
