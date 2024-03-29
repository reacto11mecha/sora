import { useEffect, useMemo, useRef, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  HStack,
  Link,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const Statistik = () => {
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const container = useRef<HTMLDivElement>(null!);

  const candidateQuery = api.candidate.statisticList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });

  const chartData = useMemo(
    () =>
      candidateQuery.data?.map((kandidat) => ({
        name: kandidat.name,
        ["Yang Memilih"]: kandidat.counter,
      })),
    [candidateQuery.data],
  );

  const tooltipColor = useColorModeValue("white", "#171923");
  const yangMemilihColor = useColorModeValue("#2F855A", "#38A169");

  useEffect(() => {
    const setSize = () => {
      setWidth(container.current.clientWidth - 50);
      setHeight(container.current.clientHeight - 13);
    };
    setSize();

    window.addEventListener("resize", setSize);

    return () => {
      window.removeEventListener("resize", setSize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Statistik Pemilihan</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Statistik
          </Text>
        </HStack>

        <HStack h={"80vh"}>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            h={"100%"}
            w={"100%"}
            ref={container}
          >
            <VStack
              align="stretch"
              px={2}
              py={2}
              style={{
                height: "100%",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {candidateQuery.isLoading && (
                <Spinner thickness="4px" size="xl" />
              )}

              {!candidateQuery.isLoading &&
                candidateQuery.data &&
                candidateQuery.data.length < 1 && (
                  <HStack>
                    <Text fontSize={"3xl"} style={{ textAlign: "center" }}>
                      Belum ada kandidat, buat terlebih dahulu di{" "}
                      <NextLink href={"/kandidat"} passHref>
                        <Link color="teal.500">halaman kandidat</Link>
                      </NextLink>
                      !
                    </Text>
                  </HStack>
                )}

              {!candidateQuery.isLoading &&
                candidateQuery.data &&
                candidateQuery.data.length > 0 && (
                  <BarChart width={width} height={height} data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: tooltipColor,
                        borderColor: tooltipColor,
                        borderRadius: "2mm",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="Yang Memilih" fill={yangMemilihColor} />
                  </BarChart>
                )}
            </VStack>
          </Box>
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(Statistik);
