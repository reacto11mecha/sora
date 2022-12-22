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
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { DateTime } from "luxon";
import NextLink from "next/link";
import Head from "next/head";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import Sidebar from "../../../components/Sidebar";
import InputImageBox from "../../../components/InputImageBox";

import { trpc } from "../../../utils/trpc";
import { EditPaslonValidationSchema as validationSchema } from "../../../schema/admin.paslon.schema";

type FormValues = {
  ketua: string;
  wakil: string;
  image: File;
};

const EditPaslonWithID = () => {
  const toast = useToast();
  const router = useRouter();

  const [imgFromInput, setIFI] = useState<string | null>(null);

  const { handleSubmit, register, formState, reset, watch, control } =
    useForm<FormValues>({
      resolver: zodResolver(validationSchema),
    });

  const settingsQuery = trpc.settings.getSettings.useQuery(undefined, {
    onSuccess(result) {
      if (result.canVote) router.push("/paslon");
    },
  });
  const paslonQuery = trpc.paslon.getSpecificCandidate.useQuery(
    { id: router.query.id as string },
    {
      onSuccess: reset,
      onError(result) {
        toast({
          description: result.message,
          status: "error",
          duration: 6000,
          position: "top-right",
          isClosable: true,
        });
      },
    }
  );

  useEffect(() => {
    const subscription = watch((value, { name, type }) => {
      if (name === "image" && type === "change") {
        const image = (value.image as unknown as { [0]: File })[0];

        if (image) {
          const objectUrl = URL.createObjectURL(image);
          setIFI(objectUrl);
        } else {
          if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);

          setIFI(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();

      if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);

      setIFI(null);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watch]);

  const onSubmit = async (data: FormValues) => {
    const formData = new FormData();
    const keys = Object.keys(data);

    formData.append("timeZone", DateTime.local().zoneName);
    formData.append("id", router.query.id as string);

    for (const key of keys) {
      if (key === "image" && data.image)
        formData.append(key, (data[key] as unknown as { [0]: File })[0]);
      else formData.append(key, data[key as keyof FormValues]);
    }

    const response = await fetch("/api/admin/paslon", {
      method: "PUT",
      body: formData,
      headers: {
        credentials: "include",
      },
    });

    const result = await response.json();

    toast({
      description: result.message,
      status: result.error ? "error" : "success",
      duration: 6000,
      position: "top-right",
      isClosable: true,
    });

    if (result.error) {
      reset();

      if (imgFromInput !== null) URL.revokeObjectURL(imgFromInput);
      setIFI(null);
    } else {
      router.push("/paslon");
    }
  };

  return (
    <>
      <Head>
        <title>Ubah Paslon</title>
      </Head>
      <VStack align="stretch">
        <HStack mb={"10px"} style={{ justifyContent: "center" }}>
          <Text fontWeight="500" fontSize="5xl">
            Ubah Paslon
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
                  isInvalid={formState.errors?.ketua as unknown as boolean}
                >
                  <FormLabel htmlFor="ketua">Nama Ketua</FormLabel>
                  <Input
                    type="text"
                    isDisabled={
                      paslonQuery.isLoading ||
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canVote ||
                      formState.isSubmitting
                    }
                    placeholder="Masukan Nama Ketua"
                    {...register("ketua")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.ketua?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl
                  mt={6}
                  isInvalid={formState.errors?.wakil as unknown as boolean}
                >
                  <FormLabel htmlFor="wakil">Nama Wakil Ketua</FormLabel>
                  <Input
                    type="text"
                    isDisabled={
                      paslonQuery.isLoading ||
                      settingsQuery.isLoading ||
                      settingsQuery.data?.canVote ||
                      formState.isSubmitting
                    }
                    placeholder="Masukan Nama Wakil Ketua"
                    {...register("wakil")}
                  />
                  <FormErrorMessage>
                    {formState.errors?.wakil?.message}
                  </FormErrorMessage>
                </FormControl>
                <FormControl
                  mt={6}
                  isInvalid={formState.errors?.image as unknown as boolean}
                >
                  <Controller
                    name={"image"}
                    control={control}
                    render={({ field }) => (
                      <InputImageBox
                        imgFromInput={imgFromInput}
                        isDisabled={formState.isSubmitting}
                        count={1}
                        onChange={(e) =>
                          field.onChange(
                            (e.target as unknown as { files: File }).files
                          )
                        }
                        onImageDropped={(img) => field.onChange(img)}
                      />
                    )}
                  />
                  <FormErrorMessage>
                    {formState.errors?.image?.message}
                  </FormErrorMessage>
                </FormControl>
                <Button
                  width="full"
                  mt={4}
                  bg="orange.500"
                  _hover={{ bg: "orange.700" }}
                  color="white"
                  isLoading={formState.isSubmitting}
                  isDisabled={
                    paslonQuery.isLoading ||
                    settingsQuery.isLoading ||
                    settingsQuery.data?.canVote
                  }
                  type="submit"
                >
                  Edit
                </Button>
                <NextLink href="/paslon" legacyBehavior passHref>
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

export default Sidebar(EditPaslonWithID);
