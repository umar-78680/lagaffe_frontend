import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

const Loader = () => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <Box textAlign="center">
        <CircularProgress color="primary" size={60} thickness={5} />
      </Box>
    </Box>
  );
};

export default Loader;
