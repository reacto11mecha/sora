import Head from "next/head";
import type { NextPage } from "next";
import { Container, Box, Text, Divider } from "@chakra-ui/react";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Pilih Paslon Mu | NVA13</title>

        <meta name="description" content="Generated by create next app" />
      </Head>

      <Container>
        <Box p={4} borderWidth="1px" mt="6" borderRadius="lg">
          <Text fontSize="2xl" fontWeight="semibold" color="gray.900">
            Tidak Ada Data PASLON
          </Text>
          <Divider orientation="horizontal" mt="1" mb="1" />
          <Text>
            Tidak ada data paslon yang ada, mohon hubungi admin untuk
            menambahkan data paslon.
          </Text>
        </Box>
      </Container>
    </>
  );
};

export default Home;
