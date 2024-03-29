import { useRef, useState } from "react";
import Head from "next/head";
import NextLink from "next/link";
import {
  // Alert dialog
  AlertDialog,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  HStack,
  Spinner,
  Stack,
  // Table
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";

import { api } from "~/utils/api";
import Sidebar from "~/components/Sidebar";

const Candidate = () => {
  const toast = useToast();

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const cancelRef = useRef<HTMLButtonElement>(null!);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const candidateQuery = api.candidate.adminCandidateList.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });
  const settingsQuery = api.settings.getSettings.useQuery(undefined, {
    refetchInterval: 2500,
    refetchIntervalInBackground: true,
  });
  const counterQuery = api.candidate.getCandidateAndParticipantCount.useQuery(
    undefined,
    {
      refetchInterval: 2500,
      refetchIntervalInBackground: true,
    },
  );

  const candidateDeleteMutation =
    api.candidate.adminDeleteCandidate.useMutation({
      onSuccess(result) {
        onClose();

        toast({
          description: result.message,
          status: "success",
          duration: 6000,
          position: "top-right",
          isClosable: true,
        });
      },

      onError(result) {
        toast({
          description: result.message,
          status: "error",
          duration: 6000,
          position: "top-right",
          isClosable: true,
        });
      },
    });

  // Untuk keperluan hapus data
  const [currentID, setID] = useState<number | null>(null);

  const getNama = () => {
    const currentCandidate = candidateQuery.data?.find(
      (p) => p.id === currentID,
    );

    return currentCandidate?.name;
  };

  return (
    <>
      <Head>
        <title>Daftar Kandidat</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Kandidat
          </Text>
        </HStack>
        <HStack>
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            h={"100%"}
            w={"100%"}
            style={{ minHeight: "80vh" }}
          >
            <VStack align="stretch" px={2} py={2}>
              <HStack>
                <NextLink
                  href="/kandidat/tambah"
                  passHref={
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canVote?: boolean })
                      ?.canVote
                  }
                >
                  <Button
                    isDisabled={
                      settingsQuery.isLoading || settingsQuery.data?.canVote
                    }
                    borderRadius="md"
                    bg="blue.500"
                    color="white"
                  >
                    Tambah Kandidat Baru
                  </Button>
                </NextLink>

                <NextLink href="/kandidat/status" passHref>
                  <Button borderRadius="md" bg="yellow.500" color="white">
                    Cek Status Pemilihan
                  </Button>
                </NextLink>
              </HStack>

              <HStack>
                <TableContainer w="100%" h="100%">
                  {!candidateQuery.isLoading &&
                  !candidateQuery.isError &&
                  candidateQuery.data.length > 0 &&
                  counterQuery.data ? (
                    <Stack direction="row" mr="2" mt="3" mb="3">
                      <Badge fontSize="1.3em">
                        <Tooltip label="Jumlah suara masuk ke masing-masing kandidat terpilih">
                          Akumulasi Kandidat:
                        </Tooltip>{" "}
                        {counterQuery.data.candidates} Orang
                      </Badge>
                      <Badge fontSize="1.3em">
                        <Tooltip label="Jumlah peserta pemilihan yang valid dalam memilih kandidat">
                          Akumulasi Pemilih:
                        </Tooltip>{" "}
                        {counterQuery.data.participants} Orang
                      </Badge>
                      <Badge
                        fontSize="1.3em"
                        colorScheme={
                          counterQuery.data.isMatch ? "green" : "red"
                        }
                        variant="solid"
                      >
                        <Tooltip
                          label={
                            counterQuery.data.isMatch
                              ? "Jumlah peserta yang berhasil memilih sesuai dengan jumlah keseluruhan kandidat"
                              : "Jumlah peserta yang berhasil memilih tidak sesuai dengan jumlah keseluruhan kandidat"
                          }
                        >
                          {counterQuery.data.isMatch
                            ? "COCOK!"
                            : "TIDAK COCOK!"}
                        </Tooltip>
                      </Badge>
                    </Stack>
                  ) : null}

                  <Table variant="simple">
                    {!candidateQuery.isLoading &&
                    !candidateQuery.isError &&
                    candidateQuery.data.length < 1 ? (
                      <TableCaption>
                        Tidak ada kandidat yang tersedia, silahkan tambahkan
                        kandidat terlebih dahulu.
                      </TableCaption>
                    ) : null}

                    <Thead>
                      <Tr>
                        <Th>#</Th>
                        <Th>Nama Kandidat</Th>
                        <Th>Yang Memilih</Th>
                        <Th>Gambar</Th>
                        <Th>Aksi</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {candidateQuery.isLoading && (
                        <Tr>
                          <Td colSpan={5} style={{ textAlign: "center" }}>
                            <Spinner
                              size="xl"
                              speed="0.95s"
                              emptyColor="gray.200"
                              color="blue.500"
                            />
                          </Td>
                        </Tr>
                      )}

                      {!candidateQuery.isLoading &&
                        !candidateQuery.isError &&
                        candidateQuery.data &&
                        candidateQuery.data.map((p, idx) => (
                          <Tr key={p.id}>
                            <Td>{++idx}</Td>
                            <Td>{p.name}</Td>
                            <Td>{p.counter} Orang</Td>
                            <Td>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`/api/uploads/${p.img}`}
                                alt={`Gambar dari kandidat ${p.name}.`}
                              />
                            </Td>
                            <Td>
                              <NextLink
                                href={`/kandidat/edit/${p.id}`}
                                passHref={
                                  !settingsQuery.isLoading ||
                                  !(
                                    settingsQuery.data as unknown as {
                                      canVote?: boolean;
                                    }
                                  )?.canVote
                                }
                              >
                                <Button
                                  isDisabled={
                                    settingsQuery.isLoading ||
                                    settingsQuery.data?.canVote
                                  }
                                  bg="orange.500"
                                  _hover={{ bg: "orange.700" }}
                                  color="white"
                                >
                                  Edit
                                </Button>
                              </NextLink>
                              <Button
                                isDisabled={
                                  settingsQuery.isLoading ||
                                  settingsQuery.data?.canVote ||
                                  p.counter > 0
                                }
                                bg="red.500"
                                _hover={{ bg: "red.700" }}
                                ml={2}
                                color="white"
                                onClick={() => {
                                  if (
                                    !settingsQuery.isLoading ||
                                    !(
                                      settingsQuery.data as unknown as {
                                        canVote?: boolean;
                                      }
                                    )?.canVote
                                  ) {
                                    setID(p.id);
                                    onOpen();
                                  }
                                }}
                              >
                                Hapus
                              </Button>
                            </Td>
                          </Tr>
                        ))}

                      {!candidateQuery.isLoading && !candidateQuery.data && (
                        <Tr>
                          <Td colSpan={5} style={{ textAlign: "center" }}>
                            Tidak ada data kandidat, Silahkan tambah kandidat
                            baru dengan tombol di atas.
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </TableContainer>
              </HStack>
            </VStack>
          </Box>
        </HStack>
      </VStack>
      <AlertDialog
        isCentered
        isOpen={
          !(settingsQuery.isLoading || settingsQuery.data?.canVote) && isOpen
        }
        leastDestructiveRef={cancelRef}
        onClose={() => {
          if (!candidateDeleteMutation.isLoading) {
            setID(null);
            onClose();
          }
        }}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            {!candidateDeleteMutation.isLoading && <AlertDialogCloseButton />}
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Hapus Kandidat
            </AlertDialogHeader>

            <AlertDialogBody>
              Apakah anda yakin? Jika sudah terhapus maka kandidat {getNama()}{" "}
              <b>TIDAK BISA DIPILIH, DIREVISI, DAN DIKEMBALIKAN LAGI!</b>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={onClose}
                disabled={candidateDeleteMutation.isLoading}
              >
                Batal
              </Button>
              <Button
                bg="red.500"
                _hover={{ bg: "red.700" }}
                color="white"
                disabled={candidateDeleteMutation.isLoading}
                onClick={async () => {
                  if (
                    !settingsQuery.isLoading ||
                    !(settingsQuery.data as unknown as { canVote?: boolean })
                      ?.canVote
                  )
                    candidateDeleteMutation.mutate({
                      id: currentID as number,
                    });
                }}
                ml={3}
              >
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
};

export default Sidebar(Candidate);
