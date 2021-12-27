import { useState, useEffect, useRef } from 'react';
import './App.css';


function App() {
  const [messageList, setMessageList] = useState([]);
  const [stopUpdate, setStopUpdate] = useState(false);
  const stopUpdateStateRef = useRef();
  const [jsonPretty, setJsonPretty] = useState(true);
  const [socket, setSocket] = useState(null);

  const toPrettyJson = (s) => {
    try {
      let parsed = JSON.parse(s);
      return JSON.stringify(parsed, null, 2);
    }
    catch(e) {
      return s;
    }
  }

  const initWebSocket = () => {
    const websocket = new WebSocket(`ws://${window.location.host}/data`);
    setSocket(websocket);
    websocket.addEventListener(
      "message",
      ({ data }) => {
        let entry = JSON.parse(data);
        if(!!entry.payload && !!entry.meta) {
          setMessageList((m) => [entry, ...m].slice(0, 30));
        }
      });
    websocket.addEventListener(
      "close",
      () => {
        if(!stopUpdateStateRef.current) {
          setTimeout(initWebSocket, 1000);
	}
      });
  }

  useEffect(() => {
    if(!!socket && (socket.readyState === 1 || socket.readyState === 0)) {
      socket.close()
    }
    if(stopUpdate) {
      return;
    }
    initWebSocket();
  }, [stopUpdate]);

  return (
    <div className="container">
      <div className="absolute left-4 top-4 grid grid-cols-1 gap-4">
        <button
          className="box-content w-24 h-12 z-50 text-white text-md font-semibold bg-blue-500 shadow"
          onClick={() => {
	    stopUpdateStateRef.current = !stopUpdate;
            setStopUpdate(!stopUpdate);
          }}>
          {stopUpdate ? "Resume" : "Pause"}
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
            window.open('https://github.com/gzttech/agal', '_blank')
          }}>
          Docs
        </button>
      </div>
      <div className="container mx-auto px-32 max-h-screen overflow-y-scroll">
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
                  copy
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
