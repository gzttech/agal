# agal

agal(**a** **g**lance **a**t **l**ogs) is like _tail_, but can be accessed remotely via browsers.

## install

```
pip install agal
```


## Basic Usage

**Start server**

```
agal-server --key your-own-encryption-key --input_port 8700 --port 8800
```

**Feed log**

```
tail -f server.log | agal-cli --uri ws://127.0.0.1:8700 --key your-own-encryption-key
```

Now you may access the log in your browser via http://127.0.0.1:8800

