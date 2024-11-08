import React from "react";
import { TextField, Typography, Box, IconButton } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import SimulateIcon from "@mui/icons-material/Sync";

export const ParametersDisplay = ({ parameters, setParameters, handleCheckClick, handleSimulateClick }) => {
  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "#f9f9f9",
        borderRadius: "8px",
        maxWidth: "600px",
        margin: "auto",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      {Object.keys(parameters).map((param) => (
        <Box key={param} sx={{ display: "flex", alignItems: "center", gap: "50px" }}>
          <Typography sx={{ fontWeight: "bold", width: "150px", flexShrink: 0 }}>
            {param}
          </Typography>

          <TextField
            type="number"
            value={parameters[param].value !== undefined ? parameters[param].value : ""}
            disabled={!parameters[param].IsEditable}
            onChange={(e) => {
              if (e?.target?.value) {
                const paramValue = parameters[param];
                if (parameters[param].value !== e?.target?.value) {
                  setParameters(() => ({
                    ...parameters,
                    [param]: {
                      ...paramValue,
                      value: e.target.value,
                      isUpdated: true,
                    },
                  }));
                }
              }
            }}
            size="small"
            sx={{ minWidth: "120px", flexGrow: 1, marginRight: 0 }}
          />
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {/* Render CheckIcon only if IsEditable is true */}
            {parameters[param].IsEditable && (
              <IconButton
                disabled={!parameters[param].isUpdated || !parameters[param].IsEditable}
                onClick={() => handleCheckClick(param)}
                sx={{ padding: 0 }}
              >
                <CheckIcon
                  sx={{ color: !parameters[param].isUpdated || !parameters[param].IsEditable ? "grey" : "green" }}
                />
              </IconButton>
            )}

            {/* Render SimulateIcon only if IsSimulated is true */}
            {parameters[param].IsEditable && (
              <IconButton
                disabled={parameters[param].isUpdated || !parameters[param].IsSimulated}
                onClick={() => handleSimulateClick(param)}
                sx={{ padding: 0 }}
              >
                <SimulateIcon
                  sx={{ color: parameters[param].isUpdated ? "#ccc" : "blue" }}
                />
              </IconButton>
            )}
          </Box>
        </Box>
      ))}
    </Box>
  );
};
