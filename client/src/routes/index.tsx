import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "../App";
import { StartGame } from "@/views";

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <StartGame />,
    },
    {
      path: "/:id",
      element: <App />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
