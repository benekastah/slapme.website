#!/usr/bin/env python

import asyncio
import datetime
import json
import random

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


def gen_name():
    return ' '.join(
        random.choice(tuple(words)) for _ in range(random.randint(2, 3)))


def now():
    epoch = datetime.datetime.utcfromtimestamp(0)
    return (datetime.datetime.utcnow() - epoch).total_seconds() * 1000.


class Game:
    def __init__(self, host):
        self.host = host
        self.players = {}

    async def add_player(self, player):
        self.players[player.client_name] = player
        await self.host.send(['added_player', player.client_name])

    async def remove_player(self, player):
        if player == self.host:
            players = list(self.players.values()) + [self.host]
            self.host = None
            self.players = {}
            await asyncio.wait([p.leave_game() for p in players])
            await asyncio.wait([p.send(['game_terminated']) for p in players])
        elif player.client_name in self.players:
            del self.players[player.client_name]
            await asyncio.wait([
                self.host.send(['removed_player', player.client_name]),
                player.send(['left_game'])
            ])


class Client:
    def __init__(self, websocket):
        global games
        self.games = games
        self.websocket = websocket
        self.client_name = None

    def __call__(self, method, *args, **kwargs):
        return getattr(self, 'on_{}'.format(method))(*args, **kwargs)

    def leave_game(self):
        self.game.remove_player(self)
        self.game = None

    def on_start(self):
        game_id = gen_name()
        self.game = Game(self)
        self.games[game_id] = self.game

    def on_join(self, game_id, client_name):
        game = self.games[game_id]
        if client_name in game:
            raise KeyError('Name already used')
        self.game = game
        self.client_name = client_name
        self.game.add_player(self)

    async def recv(self):
        return json.loads(await self.websocket.recv())

    async def send(self, msg):
        return await self.websocket.send(json.dumps(msg))

    async def safe_send(self, msg):
        try:
            await self.send(self.websocket, msg)
        except ConnectionClosed:
            pass


async def slapme(websocket, path):
    client = Client(websocket)
    while True:
        try:
            msg = await client.recv(websocket)
        except ConnectionClosed:
            break
        client(*msg)
    if client.game:
        client.leave_game()
