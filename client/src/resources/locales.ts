const locales = {
  enviroment: import.meta.env.VITE_ENVIROMENT,
  socketApi: import.meta.env.VITE_SOCKET_API,
  socketHost: import.meta.env.VITE_SOCKET_HOSTNAME,
  serverUrl: import.meta.env.VITE_SERVER_URL,
  socketPort: import.meta.env.VITE_SOCKET_PORT,
};

export default locales;
