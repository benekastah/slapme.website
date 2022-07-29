import asyncio
import websockets
from slapme import slapme

start_server = websockets.serve(slapme, '0.0.0.0', 8765)
asyncio.get_event_loop().run_until_complete(start_server)
print('Started websocket server on 0.0.0.0:8765')
asyncio.get_event_loop().run_forever()
