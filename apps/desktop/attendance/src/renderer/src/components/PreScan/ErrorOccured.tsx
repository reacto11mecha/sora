import { Box, HStack, Heading, Text } from "@chakra-ui/react";

const ErrorOcurred: React.FC = () => {
  return (
    <HStack h={"100vh"} justifyContent="center">
      <Box
        borderWidth="2px"
        borderRadius="lg"
        w="85%"
        h="90%"
        style={{
          display: "flex",
          flexDirection: "column",
          boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
        }}
        alignItems="center"
        justifyContent="center"
      >
        <Heading p={".6em"} color="red.500" onClick={() => location.reload()}>
          Terjadi Kesalahan Internal
        </Heading>

        <Text fontSize="1.3em">
          Terjadi sebuah kesalahan pada aplikasi ini.
        </Text>
        <Text fontSize="1.3em">
          Mohon hubungi panitia untuk memperbaiki masalah ini.
        </Text>
      </Box>
    </HStack>
  );
};

export default ErrorOcurred;
