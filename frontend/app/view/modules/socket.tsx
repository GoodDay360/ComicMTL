import Storage from '@/constants/module/storages/storage'; // Adjust the import path as needed
import uuid from 'react-native-uuid';
import NetInfo from '@react-native-community/netinfo';


const connectWebSocket = (socketBaseContext: string, socket_id: string | number[], onOpen: (event: any) => void, onMessage: (event: any) => void): Promise<WebSocket> => {
    return new Promise((resolve, reject) => {
        const _socket = new WebSocket(`${socketBaseContext}/ws/queue/request_chapter/${socket_id}`);

        _socket.onopen = (event: any) => {
            onOpen(event);
            resolve(_socket);
        };

        _socket.onmessage = onMessage;

        const handleReconnect = () => {
            console.log('WebSocket closed or error. Attempting to reconnect...');
            setTimeout(() => {
                connectWebSocket(socketBaseContext, socket_id, onOpen, onMessage).then(resolve).catch(reject);
            }, 10000); // Wait 3 seconds before attempting to reconnect
        };

        // _socket.onclose = handleReconnect;
        _socket.onerror = (error: any) => {
            console.error('WebSocket error:', error);
            _socket.close();
            // handleReconnect();
        };
    });
};


export const createSocket = async (
    socketBaseContext: string,
    socket: any,
    onOpen: (event: any) => void,
    onMessage: (event: any) => void
) => {
    const stored_socket_info = await Storage.get("SOCKET_INFO");
    let socket_id: string | number[];

    if (stored_socket_info) {
        socket_id = stored_socket_info.id;
    } else {
        socket_id = uuid.v4();
        await Storage.store("SOCKET_INFO", { id: socket_id });
    }

    const _socket = await connectWebSocket(socketBaseContext, socket_id, onOpen, onMessage);
    socket.current = _socket;

    return _socket;
};

export const setupSocketNetworkListener = (
    socketBaseContext: string,
    socket:any,
    onOpen: (event: any) => void,
    onMessage: (event: any) => void
) => {
    var previousIsConnected:any = null;
    return NetInfo.addEventListener(state => {
        
        if (previousIsConnected === state.isConnected){
            previousIsConnected = state.isConnected;

        }else if (state.isConnected) {
            previousIsConnected = state.isConnected;
            console.log("Socket Network listener started.")
            console.log('Internet connected. Connecting WebSocket...');
            createSocket(socketBaseContext, socket, onOpen, onMessage)
        }
    });
};