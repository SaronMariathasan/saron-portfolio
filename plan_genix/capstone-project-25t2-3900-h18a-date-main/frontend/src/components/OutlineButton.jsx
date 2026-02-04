import React from "react";
import { Button } from "@mui/material";

export default function OutlinedButton({ label, ...props }) {
  return (
    <Button
      variant="outlined"
      sx={{
        color: "#FD8A51",
        borderColor: "#FD8A51",
        flex: 1,
        borderRadius: 3
      }}
      {...props}
    >
      {label}
    </Button>
  );
}
