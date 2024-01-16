import {
  Route,
  RouterProvider,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";
import App from "../App";
import { StartGame } from "@/views";

const Routes = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path="/" element={<StartGame />}>
        <Route path="/start-game" element={<App />} />
      </Route>
    )
  );

  return <RouterProvider router={router} />;
};

export default Routes;
