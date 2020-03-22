import { getHistory, getState, getDetails } from './api'

var Player = function() {
	this.units = 0;
	this.cards = 0;
	this.elim_bonus = 0;
	this.eliminated = 0;
	this.captured = 0;
	this.loss = 0;
	this.max = 0;
	this.max_move = 0;
	this.current = 0;
	this.units_killed = 0;
	this.units_lost = 0;
	this.attack_rolls = new Array();
	this.defend_rolls = new Array();
    this.attacked = 0;
    this.defended = 0;
    this.good_attack = 0;
    this.good_defend = 0;
    this.total_attack = 0;
    this.total_defend = 0;
};

var playerarray = new Array();
var playerinfo = new Array();
var continents = new Array();
var countries = new Array();
var attack_die = 0;
var attack_floor = 0;
var defend_die = 0;
var defend_floor = 0;
var next_set = 0;
var total_territories = 0;

async function processHistory(gameId, start = 0) {
    const historyData = await getHistory(gameId, start);

	let hist = historyData._content.movelog._content.m;
	for (var j = 0; j < hist.length; j++) {
		if ( Number( hist[j].s ) == -1) { continue; }
		if ( playerarray[hist[j].s] == undefined ) {
			playerarray[hist[j].s] = new Player();
		}
		if( hist[j].a == 'z' ) { // bonus units
			playerarray[hist[j].s].units += Number(hist[j].num);
			// new turn
			for (var p = 0; p < playerarray.length; p++) {
				if( playerarray[p].current > playerarray[p].max ) {
					playerarray[p].max = playerarray[p].current;
					playerarray[p].max_move = Number(hist[j].id) - 1;
				}
			}
		}
		if( hist[j].a == 'w' ) { // win
			// game over
			for (var p = 0; p < playerarray.length; p++) {
				if( playerarray[p].current > playerarray[p].max ) {
					playerarray[p].max = playerarray[p].current;
					playerarray[p].max_move = Number(hist[j].id) - 1;
				}
			}
		}
		if( hist[j].a == 't' || hist[j].a == 'l' ) { // select territory (normal / blind)
			playerarray[hist[j].s].current++;
		}
		if( hist[j].a == 'b' ) { // eliminate player bonus
			playerarray[hist[j].s].elim_bonus += Number(hist[j].num);
		}
		if( hist[j].a == 'u' ) { // use cards
			playerarray[hist[j].s].cards += Number(hist[j].num);
		}
		if( hist[j].a == 'e' ) { // eliminate player
			playerarray[hist[j].s].eliminated++;
		}
		if( hist[j].a == 'c' ) { // capture territory
			playerarray[hist[j].s].captured++;
			playerarray[hist[j].s].current++;
            playerarray[hist[j].s].attacked++;
			if( playerarray[hist[j].ds] == undefined ) {
				playerarray[hist[j].ds] = new Player();
			}
			playerarray[hist[j].ds].loss++;
			playerarray[hist[j].ds].current--;
            playerarray[hist[j].ds].defended++;
		}
		if( hist[j].a == 'v' || hist[j].a == 'a' ) { // blind-at-once attack / attack
			playerarray[hist[j].s].units_lost += Number(hist[j].al);
			playerarray[hist[j].s].units_killed += Number(hist[j].dl);
            playerarray[hist[j].s].attacked++;
			if( playerarray[hist[j].ds] == undefined ) {
				playerarray[hist[j].ds] = new Player();
			}
			playerarray[hist[j].ds].units_lost += Number(hist[j].dl);
			playerarray[hist[j].ds].units_killed += Number(hist[j].al);
            playerarray[hist[j].ds].defended++;

			var ad = hist[j].ad.split(",");
			var dd = hist[j].dd.split(",");
			for(var d = 0; d < ad.length; ++d) {
				if(playerarray[hist[j].s].attack_rolls[ad[d]-1] == undefined ) {
					playerarray[hist[j].s].attack_rolls[ad[d]-1] = 1;
				} else {
					playerarray[hist[j].s].attack_rolls[ad[d]-1]++;
				}
			}
			for(var d = 0; d < dd.length; ++d) {
				if(playerarray[hist[j].ds].defend_rolls[dd[d]-1] == undefined ) {
					playerarray[hist[j].ds].defend_rolls[dd[d]-1] = 1;
				} else {
					playerarray[hist[j].ds].defend_rolls[dd[d]-1]++;
				}
			}
		}
    }
    
	if( (Number(historyData._content.movelog.numreturned) + Number(hist[0].id)) < Number(historyData._content.movelog.total) ) {
        return processHistory(gameId, Number(hist[hist.length-1].id)+1);
	} else {
        return {
            playerarray
        }
    }
}

async function processPlayers(gameId: string) {
    const playerData = await getState(gameId);
	
	if( playerData.stat != 'ok' ) {
		return;
	}
	var players = playerData._content.players._content.player;
	for( var j = 0; j < players.length; j++) {
		playerinfo[players[j].id] = new Object();
		playerinfo[players[j].id].name = players[j].name;
		playerinfo[players[j].id].colorid = players[j].colorid;
		playerinfo[players[j].id].profileid = players[j].profileid;
	}
	// var areas = playerData._content.board._content.area;
	// total_territories = areas.length;
	// for( var j = 0; j < areas.length; j++ ) {
	// 	countries[areas[j].id] = new Object();
	// 	countries[areas[j].id].player = areas[j].playerid;
	// 	countries[areas[j].id].units = areas[j].units;
	// }
	next_set = Number(playerData._content.cards.worth);
	var cards = playerData._content.cards._content.player;
	if( cards ) {
		for( var j = 0; j < cards.length; j++) {
			playerinfo[cards[j].id].num_cards = cards[j].num;
		}
    }
    
    return {
        countries,
        playerinfo,
        total_territories,
        next_set
    }
}

async function processDetails(gameId: string) {
    const detailsData = await getDetails(gameId);

	if( detailsData.stat != 'ok' ) {
		document.write("Error " + detailsData._content.err.msg);
		return;
	}
	attack_die = Number(detailsData._content.rules.adie);
    attack_floor = Number(detailsData._content.rules.afdie);
	defend_die = Number(detailsData._content.rules.ddie);
	defend_floor = Number(detailsData._content.rules.dfdie);
	var conts = detailsData._content.continents._content.continent;
	for( var j = 0; j < conts.length; j++ ) {
		continents[conts[j].id] = new Object();
		continents[conts[j].id].name = conts[j].name;
		continents[conts[j].id].units = Number(conts[j].units);
		continents[conts[j].id].countries = conts[j].cids.split(',');
    }

    return {
        attack_die,
        attack_floor,
        defend_die,
        defend_floor,
        continents
    };
}

export async function getData(gameId: string) {
    const data = await Promise.all([
        processDetails(gameId),
        processPlayers(gameId),
        // processHistory(gameId)
    ]);

    return Object.assign({}, data[0], data[1]);//, data[2]);
}
