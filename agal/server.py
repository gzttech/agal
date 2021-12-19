import os.path
import asyncio
import websockets
import threading
import http
import threading
import json
import collections
import mimetypes
import fire
import urllib.parse
from . import message_crypt
from . import constant


class Global:
   users = set()
   messages = collections.deque()
   message_count = 0


async def main_input(host, port, key):
    crypt = None
    if key:
        crypt = message_crypt.MessageCrypt(key)
    async def recv(websocket):
        async for entry in websocket:
            if crypt:
                message = crypt.json_decrypt(entry)
            else:
                message = entry
            print(message, entry)
            if message:
                Global.messages.append(message)

    async with websockets.serve(
        recv, host, port
    ):
        await asyncio.Future()  # run forever


async def static_serve(path, request_headers):
    print(path)
    parsed = urllib.parse.urlparse(path)
    if parsed.path == '/':
        file_path = '%s/static/index.html' % constant.LOCATION
    else:
        file_path = '%s/static/%s' % (constant.LOCATION,
                                      parsed.path.replace('..', ''))
    print(file_path, os.path.exists(file_path))
    if os.path.exists(file_path):
        content_type = mimetypes.guess_type(file_path)[0] or 'text/plain'
        return (http.HTTPStatus.OK,
                [('Content-Type', content_type)],
                open(file_path, 'rb').read())


async def distribution(websocket):
   try:
       Global.users.add(websocket)
       while True:
           try:
               message = Global.messages.popleft()
               Global.message_count += 1
               if isinstance(message, dict) and message.get('meta'):
                   message['meta']['key'] = '%s%010d' % (message['meta'].get('timestamp', ''),
                                                        Global.message_count)
               websockets.broadcast(Global.users, json.dumps(message))
           except Exception as e:
               if isinstance(e, IndexError):
                   pass
               else:
                   print(e)
               await asyncio.sleep(0.1)
   finally:
       Global.users.remove(websocket)


async def main_web(host, port):
    async with websockets.serve(
        distribution, host, port,
        process_request=static_serve,
    ):
        await asyncio.Future()


def start_web(*args):
    loop  = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main_web(*args))
    loop.close()


def start_input(*args):
    loop  = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    loop.run_until_complete(main_input(*args))
    loop.close()


def serve(key="", plain=False,
          host='0.0.0.0', port='8800',
          input_host='127.0.0.1', input_port='8700'):
    if not (key or plain):
        key = message_crypt.gen_key()
        print("Encryption key generated:\n%s\n" % key)
    thread_web = threading.Thread(target=start_web,
                                  args=(host, int(port)),
                                  daemon=True)
    thread_input = threading.Thread(target=start_input,
                                    args=(input_host, int(input_port), key),
                                    daemon=True)
    thread_web.start()
    thread_input.start()
    thread_web.join()
    thread_input.join()


def main():
    fire.Fire(serve)


if __name__ == '__main__':
    main()