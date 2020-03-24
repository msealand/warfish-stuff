import { Territory } from './Territory';

export class TerritoryGroup {
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
        territory.groups.push(this);
        territory.groups = territory.groups.sort((a, b) => a.territoryCount - b.territoryCount);
    }
}
