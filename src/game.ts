import { getDetails } from './api';

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

    addBorderingTerritory(territory: Territory) {
        this.borderingTerritories.add(territory);
    }
}

export class Continent {
    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.units = Number(data.units);
    }

    readonly id: string;
    readonly name: string;

    readonly units: number;

    readonly territories = new Set<Territory>();

    addTerritory(territory: Territory) {
        this.territories.add(territory);
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

        Object.assign(this, cleanData);

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

    readonly territories = new Map<string, Territory>();
    readonly continents = new Map<string, Continent>();
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

export class Game {

    static async ForId(gameId: string): Promise<Game> {
        const game = new Game(gameId);
        await game.load();
        return game;
    }

    private constructor(private gameId: string) { }

    readonly rules: Rules;
    readonly map: GameMap;

    private async load() {
        const details = await getDetails(this.gameId);

        // Cast to any to get around readonly
        (this as any).rules = new Rules(details.rules);
        delete details.rules;

        const continentData = details.continents._content.continent;
        (this as any).map = new GameMap(details.map, continentData);

        delete details.map;
        delete details.continents;

        loadMapWithBoardData(this.map, details.board);
        delete details.board;
    
        // console.dir(details, { depth: null });
    }

}
