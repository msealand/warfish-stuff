import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';

const cachePath = resolve(process.env["CACHE_PATH"] || 'cache');
if (!existsSync(cachePath)) {
    mkdirSync(cachePath);
}

export async function readCache(gameId: string, cacheFile: string): Promise<any> {
    const gameDir = resolve(cachePath, gameId);
    if (!existsSync(gameDir)) {
        mkdirSync(gameDir);
    }

    const cacheFilePath = resolve(gameDir, cacheFile);
    if (existsSync(cacheFilePath)) {
        console.log(`reading from cache ${cacheFilePath}`);
        const data = readFileSync(cacheFilePath);
        return data;
    }

    return;
}

export async function writeCache(gameId: string, data: any, cacheFile: string): Promise<any> {
    const gameDir = resolve(cachePath, gameId);
    if (!existsSync(gameDir)) {
        mkdirSync(gameDir);
    }

    const cacheFilePath = resolve(gameDir, cacheFile);

    console.log(`writing to cache ${cacheFilePath}`);
    writeFileSync(cacheFilePath, data);
}
