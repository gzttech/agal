import time
import threading
import secrets


class TokenStore:
    def __init__(self, default_timeout=None, token_nbytes=32):
        self._store = {}
        self._default_timeout = default_timeout or 60
        self._token_nbytes = token_nbytes
        self._lock = threading.Lock()

    def gen_token(self):
        with self._lock:
            token = secrets.token_urlsafe(self._token_nbytes)
            self._store[token] = time.time() + self._default_timeout
            return token
        self.clear()

    def check_token(self, token):
        with self._lock:
            poped = self._store.pop(token, 0)
            return False if poped < time.time() else True

    def clear(self):
        with self._lock:
            now = time.time()
            self._store = {k: v for k, v in self._store.items() if v > now}
