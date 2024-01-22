import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { LoginView, GameView } from "@/views";

const Routes = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <LoginView />,
    },
    {
      path: "/:id",
      element: <GameView />,
    },
  ]);

  return <RouterProvider router={router} />;
};

export default Routes;
