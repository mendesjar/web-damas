import ReactDOM from "react-dom/client";
import "./index.css";
import Routes from "./routes/index.tsx";
import { SocketProvider } from "./context/SocketContext.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <SocketProvider>
    <Routes />
  </SocketProvider>
);
