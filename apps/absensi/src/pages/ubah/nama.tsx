import {
  useToast,
  useColorModeValue,
  VStack,
  HStack,
  Box,
  Link,
  Text,

  // Form
  FormErrorMessage,
  FormControl,
  FormLabel,
  Input,
  Button,
} from "@chakra-ui/react";
import Head from "next/head";
import Router from "next/router";
import NextLink from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Sidebar from "~components/Sidebar";

import {
  ChangeNameSchemaValidator as validationSchema,
  type ChangeNameType as FormValues,
} from "~schema/auth.schema";
import { trpc } from "~utils/trpc";

const UbahNama = () => {
  const toast = useToast();

  const { handleSubmit, register, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(validationSchema),
  });

  const userInfo = trpc.auth.me.useQuery(undefined, {
    refetchOnWindowFocus: false,
    onSuccess(result) {
      reset({ nama: result.username });
    },
  });

  const nameMutatation = trpc.auth.changeName.useMutation({
    onSuccess(result) {
      toast({
        description: result.message,
        status: "success",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

      Router.push("/");
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

  const onSubmit = (data: FormValues) => {
    if (data.nama === userInfo.data?.username)
      return toast({
        description:
          "Nama yang ingin di ubah tidak boleh sama dengan nama yang sebelumnya!",
        status: "error",
        duration: 6000,
        position: "top-right",
        isClosable: true,
      });

    nameMutatation.mutate(data);
  };

  return (
    <>
      <Head>
        <title>Ubah Nama</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Nama
          </Text>
        </HStack>
        <HStack justifyContent="center">
          <Box
            bg={useColorModeValue("white", "gray.800")}
            borderWidth="1px"
            borderRadius="lg"
            overflow="hidden"
            w={{
              base: "75%",
              md: "50%",
            }}
          >
            <Box my={4} mx={4} textAlign="left">
              <form onSubmit={handleSubmit(onSubmit)}>
                <FormControl
                  isInvalid={formState.errors?.nama as unknown as boolean}
                >
                  <FormLabel htmlFor="nama">Nama Lengkap</FormLabel>
                  <Input
                    type="text"
                    placeholder="Masukan Nama Lengkap"
                    isDisabled={nameMutatation.isLoading || userInfo.isLoading}
                    {...register("nama")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.nama?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  bg="green.600"
                  color="white"
                  _hover={{
                    bg: "green.800",
                  }}
                  isLoading={nameMutatation.isLoading}
                  isDisabled={userInfo.isLoading}
                  type="submit"
                >
                  Ubah
                </Button>
                <NextLink href="/" legacyBehavior passHref>
                  <Link display={"flex"} justifyContent="center" mt={2} mb={3}>
                    Kembali
                  </Link>
                </NextLink>
              </form>
            </Box>
          </Box>
        </HStack>
      </VStack>
    </>
  );
};

export default Sidebar(UbahNama);