const { createCanvas, loadImage } = require('canvas');

import { resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';

import { Game } from "./game/Game";
import { GameMove, GameMoveAttack } from './game/GameMoves';

const WRAP_DELTA_PERCENT = 0.5;

export async function drawMap(game: Game, move?: GameMove) {

    if (move && !(move instanceof GameMoveAttack)) { return }

    const cachePath = resolve(process.env["CACHE_PATH"] || 'cache');
    if (!existsSync(cachePath)) {
        mkdirSync(cachePath);
    }

    const canvas = createCanvas(game.map.width, game.map.height);
    const ctx = canvas.getContext('2d')

    // TODO: Don't hardcode this
    const backgroundPath = resolve(cachePath, '1584805889.png');
    const image = await loadImage(backgroundPath);
    ctx.drawImage(image, 0, 0, game.map.width, game.map.height);
    // </hardcord>

    const wrapDeltaWidth = (game.map.width * WRAP_DELTA_PERCENT);
    const wrapDeltaHeight = (game.map.height * WRAP_DELTA_PERCENT);

    let idx = 0;
    let saturation1 = '100%';
    let saturation2 = '50%';
    game.map.groups.forEach((group) => {
        // console.log(group.name);

        // if (group.name == "Islam") {
            const hue = idx * 137.508;
            (group as any).color = `hsl(${hue}, ${saturation1}, 70%)`;
            (group as any).backgroundColor = `hsla(${hue}, ${saturation2}, 25%, 1.0)`;
            idx++;
        // } else {
        //     (group as any).color = `hsl(0, 0%, 40%)`;
        //     (group as any).backgroundColor = `hsl(0, 0%, 25%)`;
        // }
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

    game.map.territories.forEach((territory) => {
        const pos = territory.position;
        let radius = 9;//Math.min(Math.max(Math.log10(territory.units + 1) * 12, 0), 24); // 9

        // if (move instanceof GameMoveAttack) {
        //     if (territory.id == move.fromTerritory.id) {
        //         ctx.fillStyle = move.attacker.color?.cssColor() ?? 'red';
        //     } else if (territory.id == move.toTerritory.id) {
        //         ctx.fillStyle = move.defender?.color?.cssColor() ?? 'rgb(255,255,255)';
        //     } else {
        //         ctx.fillStyle = 'rgb(64,64,64)'
        //     }
        // } else {
        //    ctx.fillStyle = (territory.groups[0] as any).backgroundColor;
        // }

        // ctx.fillStyle = territory.controlledBy?.color?.cssColor() ?? 'rgb(64,64,64)';
        // ctx.strokeStyle = 'black';//(territory.groups[0] as any).color;//territory.controlledBy?.color?.cssColor() ?? 'rgb(64,64,64)';

        ctx.fillStyle = (territory.groups[0] as any).backgroundColor;
        ctx.strokeStyle = (territory.groups[0] as any).color;


        ctx.lineWidth = 1.0

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
