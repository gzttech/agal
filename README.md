# agal

agal(**a** **g**lance **a**t **l**ogs) is like _tail -f_, but can be accessed remotely via browsers.

agal is composed of agal-server and agal-cli. __agal-server__ is used both as a websocket server for gathering logs, and a web server for viewing logs. __agal-cli__ is used for feeding logs to __agal-server__.

## Install

```
pip install agal
```

## Basic Usage

**Start a server**

```
agal-server --key your-own-encryption-key --input_port 8700 --port 8800
```

Here:

- `--key` is a communication encryption key shared by __agal-server__ and __agal-cli__.
- `--input_port` is the websocket port for gathering the logs.
- `--port` is the web port for glancing at the logs.

**Feed logs**

Use `agal-cli` to feed the log entries to a remote server.

```
tail -f server.log | agal-cli --uri ws://127.0.0.1:8700 --key your-own-encryption-key
```

Here:

- `--uri` is the address of `agal-server` specfied by `--input_port`
- `--key` is a communication encryption key shared by __agal-server__ and __agal-cli__.


You may glance at the logs in your browser via http://127.0.0.1:8800 .

