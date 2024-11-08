import React, { useState } from "react";
import {
  MenuItem,
  Select,
  Box,
  InputLabel,
  TextField,
  IconButton,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import BuildIcon from "@mui/icons-material/Build";

export const DeviceSelector = ({
  devices,
  freq,
  selected,
  onSelect,
  onFreqChange,
}) => {
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentFreq, setCurrentFreq] = useState(freq);
  const handleChange = (event) => {
    onSelect(event.target.value);
  };

  const handleFreqChange = (event) => {
    if (event.target.value <= 0) {
      setCurrentFreq(1);
    } else {
      setCurrentFreq(event.target.value);
    }
  };

  const handleUpdateFreq = () => {
    onFreqChange(currentFreq);
    setIsUpdate(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        alignItems: "space-between",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "300px",
        }}
      >
        <InputLabel
          id="device-label"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Device
        </InputLabel>
        <Select
          labelId="device-label"
          value={selected}
          onChange={handleChange}
          sx={{ width: "200px", height: "40px" }}
        >
          {devices.map((device) => (
            <MenuItem key={device} value={device}>
              {device}
            </MenuItem>
          ))}
        </Select>
      </Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          width: "300px",
          gap: "20px",
        }}
      >
        <InputLabel
          id="device-label"
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Plant Freq
        </InputLabel>
        <div style={{ display: "flex", width: "200px" }}>
          <TextField
            type="number"
            value={currentFreq}
            disabled={!isUpdate}
            onChange={handleFreqChange}
            size="small"
            sx={{ height: "40px" }}
          />
          {isUpdate ? (
            <IconButton onClick={handleUpdateFreq}>
              <CheckIcon sx={{ color: "green" }} />
            </IconButton>
          ) : (
            <IconButton onClick={() => setIsUpdate(true)}>
              <BuildIcon />
            </IconButton>
          )}
        </div>
      </Box>
    </Box>
  );
};
