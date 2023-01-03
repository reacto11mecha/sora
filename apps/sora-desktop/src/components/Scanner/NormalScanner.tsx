import QrScanner from "qr-scanner";
import { validateId } from "id-generator";
import { useRef, useEffect } from "react";

import { trpc } from "@/utils/trpc";
import { useNavigate } from "react-router-dom";
import { useParticipant } from "@/context/ParticipantContext";
import { useToast, Box, Text, HStack } from "@chakra-ui/react";
import styles from "@/styles/components/Scanner.module.css";

const NormalScanner: React.FC<{ setInvalidQr: Function }> = ({
  setInvalidQr,
}) => {
  const toast = useToast();
  const navigate = useNavigate();

  const { qrId, setQRCode } = useParticipant();

  const videoRef = useRef<HTMLVideoElement>(null!);

  const checkParticipantMutation =
    trpc.absensi.participant.isParticipantAlreadyAttended.useMutation({
      onError: console.log,
    });

  useEffect(() => {
    const qrScanner = new QrScanner(
      videoRef.current,
      async ({ data }) => {
        qrScanner.stop();

        const isValidQr = validateId(data);

        if (!isValidQr) return setInvalidQr(true);

        const status = await checkParticipantMutation.mutateAsync(data);

        if (status.success) setQRCode(data);
      },
      {
        highlightCodeOutline: true,
        highlightScanRegion: true,
        onDecodeError: (error) => {
          if (error instanceof Error)
            toast({
              description: `Error: ${error.message}`,
              status: "error",
              duration: 5000,
              position: "top-right",
            });
        },
      }
    );

    qrScanner.start();

    return () => {
      qrScanner.destroy();
    };
  }, []);

  useEffect(() => {
    if (qrId) navigate("/vote");
  }, [qrId]);

  return (
    <HStack h="100vh" justifyContent="center">
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
        <HStack
          flexDirection="column"
          h="100%"
          w="80%"
          alignItems="center"
          justifyContent="center"
        >
          <Box h="85%">
            <video className={styles.video} ref={videoRef}></video>
          </Box>
          <Box h="auto">
            <Text fontWeight="bold" p={"1em"} fontSize="1.2em">
              Scan Barcode ID Mu!
            </Text>
          </Box>
        </HStack>
      </Box>
    </HStack>
  );
};

export default NormalScanner;
