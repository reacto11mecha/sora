import { Text } from "@chakra-ui/react";
import { useEffect } from "react";

import { formatTime } from "@/lib/utils";
import { useUser } from "@/lib/hooks";
import Router from "next/router";

import Sidebar from "@/component/Sidebar";

import type { NextPage } from "next";

const Paslon: NextPage = () => {
  const [user] = useUser();

  useEffect(() => {
    if (!user) Router.push("/admin/login");
  }, [user]);

  return (
    <Sidebar>
      <Text>Paslon</Text>
    </Sidebar>
  );
};

export default Paslon;
