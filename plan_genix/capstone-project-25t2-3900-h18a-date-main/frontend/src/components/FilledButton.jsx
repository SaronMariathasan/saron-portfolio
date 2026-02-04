import React from "react";
import { Button } from "@mui/material";

export default function FilledButton({label, ...props}) {

  return (
    <Button
      variant="contained"
      sx={{
        backgroundColor: "#FD8A51",
        flex: 1,
        borderRadius: 3,
      }}
      {...props}
    >
      {label}
    </Button>
  );
}