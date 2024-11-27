import React, { useState } from "react";
import { TextField, Typography, Box, Button } from "@mui/material";

export const ParametersDisplay = ({
  parameters,
  setParameters,
  handleCheckClick,
  handleSimulateClick,
  handleUrlChange, // New prop
}) => {
  const [editingParams, setEditingParams] = useState({}); // Track which parameters are being edited
  const [url, setUrl] = useState(""); // State to track the URL

  const handleUrlSubmit = () => {
    console.log("Updated URL:", url);
    if (url) {
      handleUrlChange(url); // Call the function from App.js to update the URL
      console.log("Updated URL:", url);
    } else {
      alert("Please enter a valid URL.");
    }
  };

  return (
    <Box
      sx={{
        padding: 2,
        backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white
        borderRadius: "8px",
        maxWidth: "600px", // Restrict max width for consistency
        width: "87%", // Use relative width for responsiveness
        margin: "auto",
        marginLeft: "-10px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)", // Subtle shadow for better visibility
        display: "flex",
        flexDirection: "column",
        gap: "20px", // Default gap
        "@media (min-width: 769px)": {
          gap: "15px", // Smaller gap on larger screens
          padding: 2,
          marginLeft: "140px",
        },
      }}
    >
  {Object.keys(parameters).map((param) => (
    <Box
      key={param}
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
        "@media (min-width: 769px)": {
          gap: "90px", // Compact layout for larger screens
        },
      }}
    >
      <Typography
        sx={{
          fontWeight: "bold",
          width: "120px", // Reserve space for labels
          flexShrink: 0,
          textAlign: "left", // Align text
        }}
      >
        {param}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          flexGrow: 1,
          "@media (min-width: 769px)": {
            gap: "5px", // Compact gap for larger screens
          },
        }}
      >
        <TextField
          type="number"
          value={
            editingParams[param] !== undefined
            ? editingParams[param]
            : parameters[param]?.value !== undefined
            ? parameters[param]?.value
            : ""
          }
          disabled={!parameters[param].IsEditable}
          onChange={(e) => {
            const newValue = e.target.value;
            setEditingParams((prev) => ({ ...prev, [param]: newValue }));
            setParameters((prev) => ({
              ...prev,
              [param]: { ...prev[param], isUpdated: true },
            }));
          }}
          onFocus={() =>
            setEditingParams((prev) => ({
              ...prev,
              [param]: parameters[param]?.value || "",
            }))
          }
          onBlur={() => {
            setParameters((prev) => ({
              ...prev,
              [param]: {
                ...prev[param],
                value: editingParams[param],
                isUpdated: true,
              },
            }));
            setEditingParams((prev) => {
              const updated = { ...prev };
              delete updated[param];
              return updated;
            });
          }}
          size="small"
          sx={{
            width: "200px",
            "@media (min-width: 769px)": {
              width: "220px", // Make the field smaller for larger screens
            },
          }}
        />
        {parameters[param].IsEditable && (
          <Button
            disabled={!parameters[param].isUpdated}
            onClick={() => {
              handleCheckClick(param);
              setParameters((prev) => ({
                ...prev,
                [param]: { ...prev[param], isUpdated: false },
              }));
            }}
            variant="contained"
            color="primary"
            size="small"
          >
            Update
          </Button>
        )}
      </Box>
    </Box>
  ))}

  {/* URL Field */}
  <Box
  sx={{
    display: "flex",
    flexDirection: "column", // Arrange "Configuration" above the input
    gap: "10px",
    marginTop: "20px",
  }}
>
  <Typography
    variant="h6"
    sx={{
      fontWeight: "bold", // Emphasize the text
      textAlign: "left",  // Align text to the left
    }}
  >
    Configuration
  </Typography>
  <Box
    sx={{
      display: "flex",
      alignItems: "center", // Align items vertically in the center
      gap: "10px",          // Space between TextField and Button
    }}
  >
    <TextField
      label="API URL"
      variant="outlined"
      size="small"
      fullWidth
      value={url}
      onChange={(e) => setUrl(e.target.value)}
    />
    <Button
      variant="contained"
      color="primary"
      onClick={handleUrlSubmit}
      sx={{ backgroundColor: "black", color: "white" }}
    >
      Send
    </Button>
  </Box>
</Box>
</Box>
  );
};
