import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormErrorMessage,
  FormHelperText,
  FormLabel,
  HStack,
  Heading,
  Input,
  useToast,
} from "@chakra-ui/react";
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { electronAPI } from "@electron-toolkit/preload";

type Props = Pick<typeof electronAPI, "ipcRenderer">;

export const Setting = ({ ipcRenderer }: Props) => {
  const toast = useToast();

  const [formURL, setFormURL] = useState("");

  const setServerUrl = useCallback(async (url: string) => {
    try {
      const serverURL = new URL(url);

      await ipcRenderer.invoke("set-server-url", serverURL.origin);

      toast({
        description: "Berhasil memperbarui pengaturan alamat server!",
        status: "success",
        duration: 4500,
        position: "top-right",
      });

      setTimeout(() => {
        location.href = "#/";
        location.reload();
      }, 3000);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        description: `Gagal memperbarui url | ${error.message}`,
        status: "error",
        duration: 5000,
        position: "top-right",
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const composeAsync = async () => {
      const storeValue = await ipcRenderer.invoke("get-server-url");

      setFormURL(storeValue);
    };

    composeAsync();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <HStack h={"100vh"} justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        display="flex"
        boxShadow="rgba(99, 99, 99, 0.2) 0px 2px 8px 0px"
        alignItems="center"
        justifyContent="center"
      >
        <Box w={"55%"}>
          <Heading>Pengaturan Aplikasi</Heading>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              setServerUrl(formURL);
            }}
          >
            <FormControl
              marginTop="1.3rem"
              marginBottom="1.3rem"
              isRequired
              isInvalid={formURL === ""}
            >
              <FormLabel>Alamat Server Utama</FormLabel>
              <Input
                type="url"
                value={formURL}
                placeholder="Semisal http://localhost:3000"
                onChange={(e) => setFormURL(e.target.value)}
              />
              {formURL !== "" ? (
                <FormHelperText>
                  Masukan alamat server utama aplikasi sora supaya aplikasi ini
                  bisa berjalan.
                </FormHelperText>
              ) : (
                <FormErrorMessage>Diperlukan alamat server.</FormErrorMessage>
              )}
            </FormControl>

            <Button type="submit" w={"100%"} colorScheme="green">
              Simpan
            </Button>
          </form>
        </Box>
      </Box>
    </HStack>
  );
};
