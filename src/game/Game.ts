import { getDetails, getHistory, getState } from '../warfish/api';
import { GameMove } from './GameMoves';
import { Rules } from './Rules';
import { GameMap } from './GameMap';
import { Player } from './Player';

function loadMapWithBoardData(map: GameMap, data: any) {
    const cleanData: any = {};

    Object.assign(cleanData, data);
    delete cleanData._content;
    Object.assign(cleanData, data._content);

    const borders = cleanData.border;
    borders.forEach((border) => {
        const territoryA = map.territories.get(border.a);
        const territoryB = map.territories.get(border.b);
        territoryA.addBorderingTerritory(territoryB);
    })
}

export class Game {

    static async ForId(gameId: string): Promise<Game> {
        const game = new Game(gameId);
        await game.load();
        return game;
    }

    private constructor(gameId: string) {
        this.id = gameId;
    }

    readonly id: string;
    readonly rules: Rules;
    readonly map: GameMap;

    readonly moves = new Array<GameMove>();
    readonly players = new Map<string, Player>();

    private async load() {
        const details = await getDetails(this.id);

        // Cast to any to get around readonly
        (this as any).rules = new Rules(details.rules);
        delete details.rules;

        const continentData = details.continents._content.continent;
        (this as any).map = new GameMap(details.map, continentData);

        delete details.map;
        delete details.continents;

        loadMapWithBoardData(this.map, details.board);
        delete details.board;

        const gameStateData = await getState(this.id);
        const players = (gameStateData.players._content.player || []).map((p) => new Player(p, this));
        players.forEach((p) => this.players.set(p.id, p));

        const history = await getHistory(this.id);
        // console.dir(history, { depth: null });

        const moves = history.moves.map((m) => {
            // console.dir(m);
            const move = GameMove.FromData(m, this);
            // console.dir(move);
            console.log(move?.description());
            return move;
        });
        this.moves.push(...moves);
    }

}
