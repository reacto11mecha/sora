import Head from "next/head";
import NextLink from "next/link";
import {
  Box,
  Button,
  Container,
  HStack,
  Stack,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { DateTime } from "luxon";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const Admin = () => {
  const userInfo = api.auth.me.useQuery();

  return (
    <>
      <Head>
        <title>Dashboard Admin</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Dashboard Admin
          </Text>
        </HStack>

        <HStack>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
          >
            <Container mx={7} my={7}>
              <Text fontWeight={500} fontSize={"30px"} mb={5}>
                Informasi Akun Anda
              </Text>

              <Text>Nama: {userInfo.data?.name ?? "N/A"}</Text>
              <Text>Email: {userInfo.data?.email ?? "N/A"}</Text>
              <Text>
                Tanggal Pendaftaran:{" "}
                {(userInfo.data?.createdAt &&
                  DateTime.fromMillis(Number(userInfo.data?.createdAt))
                    .setLocale("id-ID")
                    .toFormat("cccc, dd MMMM yyyy, HH:mm:ss")) ??
                  "N/A"}
              </Text>

              <Stack spacing={2} direction="row" align="center" mt={5}>
                <NextLink href="/ubah/password" legacyBehavior passHref>
                  <Button
                    as={"a"}
                    borderRadius="md"
                    bg="red"
                    color="white"
                    _hover={{
                      bg: "red.800",
                    }}
                  >
                    Ganti Password
                  </Button>
                </NextLink>
                <NextLink href="/ubah/nama" legacyBehavior passHref>
                  <Button
                    as={"a"}
                    borderRadius="md"
                    bg="green.600"
                    color="white"
                    _hover={{
                      bg: "green.800",
                    }}
                  >
                    Ganti Nama
                  </Button>
                </NextLink>
              </Stack>
            </Container>
          </Box>
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(Admin);
