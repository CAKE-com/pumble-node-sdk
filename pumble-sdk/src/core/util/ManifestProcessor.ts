import path from "path";
import {AddonManifest} from "../types/types";

export class ManifestProcessor {

    public static prepareForServing(manifest: AddonManifest, host: string) {
        const {appKey, clientSecret, signingSecret, ...removedSecrets} = manifest;
        return {
            ...removedSecrets,
            redirectUrls: manifest.redirectUrls.map((url) => {
                return this.getAbsoluteUrl(host, url);
            }),
            blockInteraction: manifest.blockInteraction
                ? {url: this.getAbsoluteUrl(host, manifest.blockInteraction.url)}
                : undefined,
            dynamicMenus: manifest.dynamicMenus ? manifest.dynamicMenus.map((dynamicMenu) => {
                return {
                    url: this.getAbsoluteUrl(host, dynamicMenu.url),
                    onAction: dynamicMenu.onAction
                };
            }) : [],
            slashCommands: manifest.slashCommands.map((cmd) => {
                return {...cmd, url: this.getAbsoluteUrl(host, cmd.url)};
            }),
            shortcuts: manifest.shortcuts.map((sh) => {
                return {...sh, url: this.getAbsoluteUrl(host, sh.url)};
            }),
            eventSubscriptions: {
                ...manifest.eventSubscriptions,
                url: this.getAbsoluteUrl(host, manifest.eventSubscriptions.url),
                events: manifest.eventSubscriptions.events ? manifest.eventSubscriptions.events.map((event) => {
                    if (typeof event === 'string') {
                        return event;
                    }
                    return event.name;
                }) : manifest.eventSubscriptions.events,
            },
        };
    }

    private static getAbsoluteUrl(host: string, relativePath: string): string {
        return relativePath.startsWith('http://') || relativePath.startsWith('https://') ?
            relativePath :
            new URL(path.join(host, relativePath)).toString();
    }
}