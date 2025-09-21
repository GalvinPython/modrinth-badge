import type { MinecraftVersionsResponse } from "./types";

let cachedMinecraftVersions: MinecraftVersionsResponse | null = null;
let lastCachedTime = 0

export async function getMinecraftVersions(): Promise<MinecraftVersionsResponse | Error> {
    const currentTime = Date.now();

    // Cache for an hour
    if (cachedMinecraftVersions && currentTime - lastCachedTime < 60 * 60 * 1000) {
        return cachedMinecraftVersions;
    }

    // Fetch new data
    const response = await fetch('https://launchermeta.mojang.com/mc/game/version_manifest_v2.json');
    if (!response.ok) {
        return new Error('Failed to fetch Minecraft versions');
    }

    // Update cache
    cachedMinecraftVersions = await response.json() as MinecraftVersionsResponse;
    lastCachedTime = currentTime;
    return cachedMinecraftVersions;
}
