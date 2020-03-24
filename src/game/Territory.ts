import { Player } from "./Player";
import { TerritoryGroup } from "./TerritoryGroup";

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

    groups = new Array<TerritoryGroup>();

    addBorderingTerritory(territory: Territory) {
        this.borderingTerritories.add(territory);
    }
}
