import { GameColor } from './GameColor';
import { Game } from './Game';

export class Player {
    constructor(data: any, game: Game) {
        this.id = data.id;
        this.name = data.name;
        this.color = game.map.colors.get(data.colorid);
    }
    readonly id: string;
    readonly name: string;
    readonly color: GameColor;
}
