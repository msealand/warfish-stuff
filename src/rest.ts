import * as request from 'request-promise-native';
import { resolve } from 'path';
import { existsSync, readFileSync, mkdirSync } from 'fs';
import { readCache, writeCache } from './cache';

const cookiePath = resolve(process.env["COOKIE_PATH"] || 'cookie');
if (!cookiePath || !existsSync(cookiePath)) { console.log(`No cookie at ${cookiePath}`) }
const cookie = request.cookie(readFileSync(cookiePath, { encoding: 'utf8' }));

const baseUrl = process.env["BASE_URL"] || 'http://warfish.net/war/';

const jar = request.jar();
jar.setCookie(cookie, baseUrl);

function parseAPIData(data: any) {
    const json = JSON.parse(data);
    if (json.stat == 'ok') {
        return json._content;
    } else {
        const error = new Error(`Error Response`);
        (error as any).details = json;
        throw error;
    }
}

export async function call(gameId: string, path: string, params: any, cacheFile?: string): Promise<any> {
    let cacheFilePath: string = undefined;
    if (cacheFile) {
        const data = await readCache(gameId, cacheFile);
        if (data) return parseAPIData(data);
    }

    const url = `${baseUrl}${path}`;
    const body = await request({ url, qs: params });
    const data = parseAPIData(body); // <-- parse data to catch error before saving to cache

    if (cacheFilePath) {
        console.log(`saving to cache ${cacheFilePath}`);
        await writeCache(gameId, data, cacheFile);
    }

    return data;
}
