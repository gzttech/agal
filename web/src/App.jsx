import { useState, useEffect, useRef } from 'react';
import './App.css';


function App() {
  const [messageList, setMessageList] = useState([]);
  const [jsonPretty, setJsonPretty] = useState(true);
  const [socket, setSocket] = useState(null);
  const [config, setConfig] = useState({
    maxLines: 30,
    stopUpdate: false
  });
  const configRef = useRef();
  configRef.current = config;

  const toPrettyJson = (s) => {
    try {
      let parsed = JSON.parse(s);
      return JSON.stringify(parsed, null, 2);
    }
    catch(e) {
      return s;
    }
  };

  const initWebSocket = () => {
    fetch("/token")
      .then((response) => response.json())
      .then((data) => {
        let token = data?.token??"";
        if(!!token) {
          const websocket = new WebSocket(`ws://${window.location.host}/data`);
          setSocket(websocket);
          websocket.addEventListener(
            "open",
            () => {
              websocket.send("auth " + token);
            }
          );
          websocket.addEventListener(
            "message",
            ({ data }) => {
            let entry = JSON.parse(data);
            if(!!entry.payload && !!entry.meta) {
              setMessageList((m) => [entry, ...m].slice(0, configRef.current.maxLines));
            }
          });
          websocket.addEventListener(
            "close",
            () => {
              if(!configRef.current.stopUpdate) {
                setTimeout(initWebSocket, 1000);
              }
          });
        }
      });
  };

  useEffect(() => {
    if(!!socket && (socket.readyState === 1 || socket.readyState === 0)) {
      socket.close();
    }
    console.log(config);
    if(config.stopUpdate) {
      return;
    }
    initWebSocket();
  }, [config.stopUpdate]);

  return (
    <div className="container">
      <div className="absolute left-4 top-4 grid grid-cols-1 gap-4">
        <div className="w-24 h-8">
          <input
            className="w-12 h-8"
            type="number"
            value={config.maxLines}
            title="Max lines kept."
            onChange={(event) => {
                configRef.current = {...config, maxLines: event.target.value};
                setConfig({...config, maxLines: event.target.value});
          }} /> Lines
        </div>
        <button
          className="box-content w-24 h-12 z-50 text-white text-md font-semibold bg-blue-500 shadow"
          onClick={() => {
            configRef.current = {...config, stopUpdate: !config.stopUpdate};
            setConfig((config) => ({...config, stopUpdate: !config.stopUpdate}));
          }}>
          {config.stopUpdate ? "Resume" : "Pause"}
        </button>
        <button
          className="box-content w-24 h-12 z-50 text-white text-md font-semibold bg-blue-500 shadow"
          onClick={() => {
            setJsonPretty(!jsonPretty);
          }}>
          {jsonPretty ? "Text" : "JSON"}
        </button>
        <button
          className="box-content w-24 h-12 z-50 text-white text-md font-semibold bg-blue-500 shadow"
          onClick={() => {
            window.open('https://github.com/gzttech/agal', '_blank');
          }}>
          Docs
        </button>
      </div>
      <div className="container mx-auto pl-32 max-h-screen overflow-y-scroll">
        {
          messageList.map( (entry, idx) => {
            return (
              <div key={ entry.meta.key } className={"relative w-full mb-1 " + ((idx % 2 === 0) ? "bg-blue-50": "")}>
                <div
                  className="absolute right-0 top-0 text-sm text-gray-400"
                  onClick={() => {
                    navigator.clipboard.writeText(entry.payload).then(function() {
                    });
                  }}
                >
                  <button>copy</button>
                </div>
                <pre className="block whitespace-pre-wrap break-all">
                  { jsonPretty ? toPrettyJson(entry.payload) : entry.payload }
                </pre>
              </div>
            );
          })
        }
      </div>
    </div>
  );
}

export default App;
