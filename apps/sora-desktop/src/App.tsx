import { lazy, useState } from "react";

import superjson from "superjson";
import { httpBatchLink } from "@trpc/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { soraTRPC } from "@/utils/trpc";
import { SettingProvider } from "@/context/SettingContext";

const Main = lazy(() => import("./routes/Main"));

const router = createHashRouter([
  {
    path: "/",
    element: <Main />,
  },
]);

const App: React.FC = () => {
  const [soraQueryClient] = useState(() => new QueryClient());
  const [soraTRPCClient] = useState(() =>
    soraTRPC.createClient({
      transformer: superjson,
      links: [
        httpBatchLink({
          url: "http://localhost:3000/api/trpc",
        }),
      ],
    })
  );

  return (
    <soraTRPC.Provider client={soraTRPCClient} queryClient={soraQueryClient}>
      <QueryClientProvider client={soraQueryClient}>
        <SettingProvider>
          <RouterProvider router={router} />
        </SettingProvider>
      </QueryClientProvider>
    </soraTRPC.Provider>
  );
};

export default App;
