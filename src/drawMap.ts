const { createCanvas, loadImage } = require('canvas');

import { resolve } from 'path';
import { existsSync, readFileSync, writeFileSync, mkdirSync, fstat } from 'fs';

import { Game } from "./game";

const WRAP_DELTA_PERCENT = 0.5;

export async function drawMap(game: Game) {

    const cachePath = resolve(process.env["CACHE_PATH"] || 'cache');
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }    

    const gameDir = resolve(cachePath, game.id);
    if (!existsSync(gameDir)) {
        mkdirSync(gameDir);
    }

    const imagePath = resolve(gameDir, "map.png");

    // console.dir(game.map, { depth: 1 });
    // console.log();

    const canvas = createCanvas(game.map.width, game.map.height);
    const ctx = canvas.getContext('2d')

    // TODO: Don't hardcode this
    const backgroundPath = resolve(cachePath, '1584805889.png');
    const image = await loadImage(backgroundPath);
    ctx.drawImage(image, 0, 0, game.map.width, game.map.height);
    // </hardcord>

    const wrapDeltaWidth = (game.map.width * WRAP_DELTA_PERCENT);
    const wrapDeltaHeight = (game.map.height * WRAP_DELTA_PERCENT);

    let hue = 0.0;
    let saturation1 = '100%';
    let saturation2 = '50%';
    const hDelta = 360.0 / game.map.continents.size;
    game.map.continents.forEach((continent) => {
        hue = Math.round(hue + hDelta);
        (continent as any).color = `hsl(${hue}, ${saturation1}, 50%)`;
        (continent as any).backgroundColor = `hsla(${hue}, ${saturation2}, 50%, 0.3)`;
    });


    ctx.save();
    ctx.globalAlpha = 0.6;
    game.map.territories.forEach((territory) => {
        const pos = territory.position;

        territory.borderingTerritories.forEach((otherTerritory) => {
            const otherPos = Object.assign({}, otherTerritory.position);

            // If the points are > WRAP_DELTA appart, assume it needs to wrap
            const xDelta = Math.abs(pos.x - otherPos.x);
            if (xDelta > wrapDeltaWidth) {
                if (pos.x > otherPos.x) { otherPos.x += (xDelta * 2.0) }
                else { otherPos.x -= (xDelta * 2.0) }
            } 

            const yDelta = Math.abs(pos.y - otherPos.y);
            if (yDelta > wrapDeltaHeight) {
                if (pos.y > otherPos.y) { otherPos.y += (yDelta * 2.0) }
                else { otherPos.y -= (yDelta * 2.0) }
            }

            const gradient = ctx.createLinearGradient(pos.x, pos.y, otherPos.x, otherPos.y);
            gradient.addColorStop(0, (territory.continent as any).color);
            gradient.addColorStop(1, (otherTerritory.continent as any).color);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;

            ctx.beginPath();
            ctx.moveTo(pos.x, pos.y);
            ctx.lineTo(otherPos.x, otherPos.y);
            ctx.stroke();
        })
    })
    ctx.restore();

    game.map.territories.forEach((territory) => {
        const pos = territory.position;

        ctx.fillStyle = (territory.continent as any).backgroundColor;
        ctx.strokeStyle = (territory.continent as any).color;
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 9, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();
    })

    const imageData = canvas.toBuffer();
    writeFileSync(imagePath, imageData);

    console.log(`saved map to: ${imagePath}`);
}
