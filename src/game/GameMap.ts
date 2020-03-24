import { Territory } from './Territory';
import { TerritoryGroup } from './TerritoryGroup';
import { GameColor } from './GameColor';

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
        });

        Object.assign(this, cleanData);

        this.width = Number(cleanData.width);
        this.height = Number(cleanData.height);

        territories.forEach((data) => {
            const territory = new Territory(data);
            this.territories.set(territory.id, territory);
        });

        continentData.forEach((data) => {
            const group = new TerritoryGroup(data);
            const cids = data.cids.split(',');
            cids.forEach((cid) => {
                group.addTerritory(this.territories.get(cid));
            });
            this.groups.set(group.id, group);
        });
    }

    boardId: string;

    readonly width: number;
    readonly height: number;
    readonly territories = new Map<string, Territory>();
    readonly groups = new Map<string, TerritoryGroup>();
    readonly colors = new Map<string, GameColor>();
}
