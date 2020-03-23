import { getDetails, getHistory, getState } from './api';
import { GameMove } from './moves';

export class Rules {
    constructor(data: any) {
        Object.assign(this, data);
    }
}

export type Coordinate = { x: number, y: number };

export class Territory {
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.maxUnits = Number(data.maxunits || 65535);
        this.position = { x: Number(data.x), y: Number(data.y) };
        this.textPosition = { x: Number(data.textx), y: Number(data.texty) };
    }

    readonly id: string;

    readonly name: string;
    readonly maxUnits: number;

    readonly position: Coordinate;
    readonly textPosition: Coordinate;

    readonly borderingTerritories = new Set<Territory>();

    continent: Continent;

    addBorderingTerritory(territory: Territory) {
        this.borderingTerritories.add(territory);
    }
}

export class Continent {
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.units = Number(data.units);

        this.territoryCount = data.cids.split(',').length;
    }

    readonly id: string;
    readonly name: string;

    readonly units: number;

    readonly territoryCount: number;
    readonly territories = new Set<Territory>();

    addTerritory(territory: Territory) {
        this.territories.add(territory);

        if (!territory.continent || (territory.continent.territoryCount > this.territoryCount)) {
            territory.continent = this;
        }
    }
}

export class GameColor {

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;

        this.red = Number(data.red);
        this.green = Number(data.green);
        this.blue = Number(data.blue);
    }

    readonly id: string;
    readonly name: string;

    readonly red: number;
    readonly green: number;
    readonly blue: number;

    cssColor(): string {
        return `rgb(${this.red},${this.green},${this.blue})`;
    }
}

export class GameMap {
    constructor(mapData: any, continentData: any) {
        const cleanData: any = {};

        Object.assign(cleanData, mapData);
        delete cleanData._content;
        Object.assign(cleanData, mapData._content);

        const territories = cleanData.territory;
        delete cleanData.territory;

        const colors = cleanData.color.map((c) => new GameColor(c));
        colors.forEach((c) => {
            this.colors.set(c.id, c);
        })

        Object.assign(this, cleanData);
        this.width = Number(cleanData.width);
        this.height = Number(cleanData.height);

        territories.forEach((data) => {
            const territory = new Territory(data);
            this.territories.set(territory.id, territory);
        });

        continentData.forEach((data) => {
            const continent = new Continent(data);
            const cids = data.cids.split(',');
            cids.forEach((cid) => {
                continent.addTerritory(this.territories.get(cid));
            });
            this.continents.set(continent.id, continent);
        });
    }

    readonly width: number;
    readonly height: number;

    readonly territories = new Map<string, Territory>();
    readonly continents = new Map<string, Continent>();

    readonly colors = new Map<string, GameColor>();
}

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

export class Player {
    constructor(data: any, game: Game) {
        this.id = data.id
        this.name = data.name;

        this.color = game.map.colors.get(data.colorid);
    } 

    readonly id: string;
    readonly name: string;

    readonly color: GameColor;
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
            // console.log(move?.description());
            return move;
        });
        this.moves.push(...moves);
    }

}
