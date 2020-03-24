const { createCanvas, loadImage } = require('canvas');

import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { Game } from "./game/Game";

const WRAP_DELTA_PERCENT = 0.5;

export async function drawMap(game: Game, moveIdx?: number) {

    const isDrawingMove = (moveIdx !== undefined);

    const cachePath = resolve(process.env["CACHE_PATH"] || 'cache');
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }

    const canvas = createCanvas(game.map.width, game.map.height);
    const ctx = canvas.getContext('2d')

    const backgroundPath = resolve(cachePath, `${game.map.boardId}.png`);
    const backgroundImageExists = existsSync(backgroundPath);
    if (backgroundImageExists) { 
        const image = await loadImage(backgroundPath);
        ctx.drawImage(image, 0, 0, game.map.width, game.map.height);
    } else {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, game.map.width, game.map.height);

        // // This will need a cookie to work...
        // const imageUrl = `http://warfish.net/war/play/gamemapimg?gid=${game.id}&imgtype=png`;
        // console.log(imageUrl);
        // const image = await loadImage(imageUrl);
        // ctx.drawImage(image, 0, 0, game.map.width, game.map.height);
    }

    const wrapDeltaWidth = (game.map.width * WRAP_DELTA_PERCENT);
    const wrapDeltaHeight = (game.map.height * WRAP_DELTA_PERCENT);

    let idx = 0;
    let saturation1 = '100%';
    let saturation2 = '50%';
    game.map.groups.forEach((group) => {
        const hue = idx * 137.508;
        (group as any).color = `hsl(${hue}, ${saturation1}, 70%)`;
        (group as any).backgroundColor = `hsla(${hue}, ${saturation2}, 25%, 1.0)`;
        idx++;
    });

    if (!isDrawingMove || !backgroundImageExists) {
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
                gradient.addColorStop(0, (territory.groups[0] as any).color);
                gradient.addColorStop(1, (otherTerritory.groups[0] as any).color);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.0;

                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
                ctx.lineTo(otherPos.x, otherPos.y);
                ctx.stroke();
            })
        })
        ctx.restore();
    }

    const gameState = game.stateAfterMove(moveIdx);

    game.map.territories.forEach((territory) => {
        const state = gameState?.getTerritoryState(territory);
        const pos = territory.position;
        let radius = isDrawingMove ? Math.min(Math.max(Math.log10(state.unitCount + 1) * 12, 0), 24) : 9;

        ctx.lineWidth = 1.0

        if (isDrawingMove) {
            ctx.fillStyle = state.controlledBy?.color?.cssColor() ?? 'rgb(64,64,64)';

            // if (gameState.move instanceof GameMoveAttack) {
            //     if (territory == gameState.move.fromTerritory) {
            //         ctx.strokeStyle = 'red';
            //         ctx.lineWidth = 3.0;
            //     } else if (territory == gameState.move.toTerritory) {
            //         ctx.strokeStyle = 'blue';
            //         ctx.lineWidth = 3.0;
            //     } else {
            //         ctx.strokeStyle = 'black';
            //     }
            // } else {
                ctx.strokeStyle = 'black';
            // }
        } else {
            ctx.fillStyle = (territory.groups[0] as any).backgroundColor;
            ctx.strokeStyle = (territory.groups[0] as any).color;
        }
    
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
        ctx.fill();
        ctx.stroke();

        // radius += 3.0;
        // territory.groups.slice(1).forEach((group) => {
        //     ctx.strokeStyle = (group as any).color;
        //     ctx.lineWidth = 2.0;
        //     ctx.beginPath();
        //     ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI, false);
        //     ctx.stroke();

        //     radius += 3.0;
        // })
    })

    const imageData = canvas.toBuffer();
    return imageData;
}
