import React from "react";
import { MenuItem, Select, Box, InputLabel } from "@mui/material";

export const PlantSelector = ({ plants, selected, onSelect }) => {
  const handleChange = (event) => {
    onSelect(event.target.value);
  };

  return (
    <Box
      sx={{ display: "flex", justifyContent: "space-between", width: "300px" }}
    >
      <InputLabel
        id="plant-label"
        sx={{ display: "flex", justifyContent: "left", alignItems: "center" }}
      >
        Plant
      </InputLabel>
      <Select
        labelId="plant-label"
        value={selected}
        onChange={handleChange}
        sx={{ width: "200px", height: "40px" }}
      >
        {plants.map((plant) => (
          <MenuItem key={plant} value={plant}>
            {plant}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};
