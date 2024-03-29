// src/pages/_app.tsx

import type { AppType } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import "react-datepicker/dist/react-datepicker.css";
import "~/components/DatePicker/chakra-support.css";
import { api } from "~/utils/api";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <ChakraProvider resetCSS>
        <Component {...pageProps} />
      </ChakraProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
