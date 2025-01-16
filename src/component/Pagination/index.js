import React from "react";
import { Box, Pagination } from "@mui/material";
import { color, styled } from "@mui/system";

const CustomPagination = styled(Pagination)(({ theme }) => ({
  "& .MuiPaginationItem-root": {
    fontSize: "1rem",
    fontWeight: "500",
    color: "#333", // Default text color
    border: "1px solid transparent", // Default border (transparent for no border look)
    transition: "all 0.3s ease",
    color: "#fff",
  },
  "& .Mui-selected": {
    backgroundColor: "#ffcc00", // Your primary color
    color: "#fff", // Text color on selected page
    fontWeight: "700", // Bold text for selected page
    border: "1px solid #ffcc00", // Border around the selected item
  },
  "& .MuiPaginationItem-root:hover": {
    backgroundColor: "#ffd633", // Light hover effect
    color: "#333", // Text color on hover
    border: "1px solid #ffd633", // Border on hover
  },
}));

const PaginationComponent = ({ page, totalPages, pageChange }) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        marginTop: "20px",
      }}
    >
      <CustomPagination
        count={totalPages} // Total number of pages
        page={page} // Current active page
        onChange={(event, value) => pageChange(value)} // Triggered when page changes
        siblingCount={1} // Number of siblings next to the current page
        boundaryCount={1} // Number of pages at the start and end
        shape="rounded" // Rounded style for items
        size="medium" // Size of the pagination
      />
    </Box>
  );
};

export default PaginationComponent;
