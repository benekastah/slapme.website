#!/usr/bin/env python

import asyncio
import datetime
import json
import random
import string
from collections import defaultdict

from websockets.exceptions import ConnectionClosed

games = {}

words = {
    'abibliophobia',
    'absquatulate',
    'allegator',
    'anencephalous',
    'argle-bargle',
    'bamboozled',
    'batrachomyomachy',
    'bawdy',
    'bazinga',
    'bevy',
    'bifurcate',
    'bilirubin',
    'billingsgate',
    'bloviate',
    'blunderbuss',
    'bobolink',
    'borborygm',
    'boustrophedon',
    'bowyang',
    'brouhaha',
    'buccaneer',
    'bulgur',
    'bumbershoot',
    'bumfuzzle',
    'callipygian',
    'canoodle',
    'canoodle',
    'cantankerous',
    'cantankerous',
    'carbuncle',
    'catercornered',
    'caterwaul',
    'cattywampus',
    'cheeky',
    'cockalorum',
    'cockamamie',
    'codswallop',
    'collop',
    'collywobbles',
    'comeuppance',
    'conniption',
    'coot',
    'crapulence',
    'crudivore',
    'didgeridoo',
    'dingy',
    'discombobulate',
    'donnybrook',
    'doodle',
    'doohickey',
    'doozy',
    'douchenozzle',
    'dudgeon',
    'ecdysiast',
    'eructation',
    'eschew',
    'fard',
    'fartlek',
    'fatuous',
    'fiddledeedee',
    'filibuster',
    'finagle',
    'firkin',
    'flanker',
    'flibbertigibbet',
    'floozy',
    'flummox',
    'folderol',
    'formication',
    'frock',
    'frollick',
    'fuddy-duddy',
    'fungible',
    'furbelow',
    'furphy',
    'gaberlunzie',
    'gardyloo!',
    'gastromancy',
    'gazump',
    'girdle',
    'gobbledygook',
    'gobemouche',
    'gobsmacked',
    'godwottery',
    'gongoozle',
    'gonzo',
    'goombah',
    'grog',
    'gumption',
    'gunky',
    'hemidemisemiquaver',
    'hitherto',
    'hobbledehoy',
    'hocus-pocus',
    'hoi polloi',
    'hoosegow',
    'hootenanny',
    'hornswoggle',
    'hullabaloo',
    'indubitably',
    'jackanapes',
    'janky',
    'jiggery-pokery',
    'kahuna',
    'katydid',
    'kerfuffle',
    'kerplunk',
    'kinkajou',
    'klutz',
    'knickers',
    'la-di-da',
    'lackadaisical',
    'lagopodous',
    'lickety-split',
    'lickspittle',
    'logorrhea',
    'lollygag',
    'loopy',
    'malarkey',
    'manscape',
    'maverick',
    'mollycoddle',
    'monkey',
    'mugwump',
    'mugwump',
    'mumpsimus',
    'namby-pamby',
    'namby-pamby',
    'nincompoop',
    'noggin',
    'oocephalus',
    'ornery',
    'pandiculation',
    'panjandrum',
    'pantaloons',
    'passel',
    'persnickety',
    'pettifogger',
    'popinjay',
    'pratfall',
    'prestidigitation',
    'proctor',
    'quean',
    'rambunctious',
    'ranivorous',
    'rapscallion',
    'rigmarole',
    'rookery',
    'rumpus',
    'scootch',
    'scuttlebutt',
    'shebang',
    'shenanigan',
    'shih tzu',
    'sialoquent',
    'skedaddle',
    'skullduggery',
    'slangwhanger',
    'smegma',
    'smellfungus',
    'smock',
    'snarky',
    'snickersnee',
    'snollygoster',
    'snool',
    'snuffle',
    'spelunker',
    'spork',
    'sprocket',
    'squeegee',
    'succubus',
    'tatas',
    'tater',
    'tatterdemalion',
    'troglodyte',
    'tuber',
    'tuchis',
    'turdiform',
    'unremacadamized',
    'viper',
    'vomitory',
    'wabbit',
    'waddle',
    'walkabout',
    'wasabi',
    'weasel',
    'wenis',
    'whatnot',
    'widdershins',
    'wombat',
    'wonky',
    'yahoo',
    'zeitgeist',
}


def gen_client_name():
    return ' '.join(
        random.choice(tuple(words)) for _ in range(random.randint(2, 3)))


def gen_game_id():
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(4))


games = {}


async def slapme(websocket, path):
    path_parts = [p for p in path.split('/') if p][1:]
    game_id = path_parts[0] if path_parts else None

    global games
    if game_id:
        game_id = game_id.lower()
        clients = games[game_id]
        print('Non host connected', path)
    else:
        while True:
            game_id = gen_game_id()
            if game_id not in games:
                break
        clients = games[game_id] = set()
        await websocket.send(json.dumps(['game', game_id]))
        print('Host connected', path)

    clients.add(websocket)
    while True:
        try:
            msg = await websocket.recv()
        except ConnectionClosed:
            break
        sends = [c.send(msg) for c in clients if c != websocket]
        if sends:
            await asyncio.wait(sends)
    clients.remove(websocket)
