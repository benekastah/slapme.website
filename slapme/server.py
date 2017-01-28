#!/usr/bin/env python

import asyncio
import json
import random
import string
from collections import defaultdict

from websockets.exceptions import ConnectionClosed

games = defaultdict(lambda: set())


def gen_game_id():
    global games
    id_ = ''.join(random.choice(string.ascii_lowercase) for _ in range(4))
    if id_ in games:
        return gen_game_id()
    else:
        return id_


async def slapme(websocket, path):
    global games
    path_parts = [p for p in path.split('/') if p][1:]
    game_id = path_parts[0].lower() if path_parts else gen_game_id()
    clients = games[game_id]
    await websocket.send(json.dumps(['game', game_id]))

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
    if not clients:
        del games[game_id]
