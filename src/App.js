import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlantSelector } from "./PlantSelector";
import { DeviceSelector } from "./DeviceSelector";
import { ParametersDisplay } from "./ParametersDisplay";
import { Box, Typography } from "@mui/material";

function App() {
  const [basePath, setBasePath] = useState(process.env.REACT_APP_API_BASE_URL);;
  const [plants, setPlants] = useState([]);
  const [plantDevices, setPlantDevices] = useState([]);
  const [plantFreq, setPlantFreq] = useState();
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedPlantDeviceDetails, setSelectedPlantDeviceDetails] = useState(null);
  const interval = useRef();

  // Reset and re-fetch data when the URL changes
  useEffect(() => {
    if (basePath) {
      setPlants([]); // Clear plants data to force re-fetch
      setPlantDevices([]); // Clear device data to force re-fetch
      setSelectedPlant(""); // Reset selected plant to trigger new fetch
      setSelectedDevice(""); // Reset selected device to trigger new fetch
      setSelectedPlantDeviceDetails(null); // Reset device details to trigger new fetch
    }
  }, [basePath]); // This will trigger whenever basePath (the URL) changes

  // Fetch plant data
  const fetchPlants = async () => {
    if (basePath) {
      try {
        const response = await fetch(`${basePath}/plants`);
        const plants = await response.json();
        setPlants(plants);
      } catch (err) {
        console.log("err", err);
      }
    } else {
      setPlants(["Plant1", "Plant2"]);
    }
  };

  // Fetch devices and set frequency based on selected plant
  const fetchPlantDevices = async () => {
    if (basePath) {
      try {
        const response = await fetch(`${basePath}/${selectedPlant}/devices`);
        const plantDevicesAndFreq = await response.json();
        setPlantDevices(plantDevicesAndFreq.devices);
        setPlantFreq(plantDevicesAndFreq.frequency);
        setSelectedDevice(plantDevicesAndFreq.devices[0]);
      } catch (err) {
        console.log("err", err);
      }
    } else {
      setPlantDevices(selectedPlant === "Plant1" ? ["Device1", "Device2"] : ["Device3", "Device4"]);
      setPlantFreq(30);
    }
  };

  // Fetch initial device details
  const fetchPlantDeviceDetails = async () => {
    if (basePath) {
      try {
        const response = await fetch(`${basePath}/${selectedPlant}/${selectedDevice}`);
        const plantDeviceDetails = await response.json();
        setSelectedPlantDeviceDetails(plantDeviceDetails);
      } catch (err) {
        console.log("err", err);
      }
    } else {
      setSelectedPlantDeviceDetails({
        pH: { value: 12, simulate: true },
        Humidity: { value: 1, simulate: true },
        temp: { value: 10, simulate: true },
      });
    }
  };

  // Fetch values periodically and update the UI
  const fetchPlantDeviceDetailsValues = async () => {
    if (basePath && selectedPlant && selectedDevice) {
      try {
        const response = await fetch(`${basePath}/${selectedPlant}/${selectedDevice}/values`);
        const plantDeviceDetailsValues = await response.json();
        setSelectedPlantDeviceDetails((prevDetails) => {
          if (!prevDetails) return null;
          const updatedDetails = { ...prevDetails };
          Object.keys(plantDeviceDetailsValues).forEach((key) => {
            updatedDetails[key] = { ...updatedDetails[key], value: plantDeviceDetailsValues[key] };
          });
          return updatedDetails;
        });
      } catch (err) {
        console.log("err", err);
      }
    } else {
      setSelectedPlantDeviceDetails({
        pH: { value: 20, simulate: true },
        Humidity: { value: 8, simulate: true },
        temp: { value: 7, simulate: true },
      });
    }
  };

  const handleFreqChange = async (newFreq) => {
    if (basePath) {
      try {
        const response = await fetch(`${basePath}/${selectedPlant}/updateFreq`, {
          method: "POST",
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ value: +newFreq })
        });
        const res = await response.json();
        if (res) {
          interval.current && clearInterval(interval.current);
          setPlantFreq(+newFreq);
        }
      } catch (err) {
        console.log("err", err);
      }
    } else {
      interval.current && clearInterval(interval.current);
      setPlantFreq(+newFreq);
    }
  };

  const handleCheckClick = useCallback(async (param) => {
    if (basePath) {
      const response = await fetch(`${basePath}/${selectedPlant}/${selectedDevice}/${param}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: selectedPlantDeviceDetails[param].value, simulation: false })
      });
      const res = await response.json();
      if (res) {
        const paramValue = selectedPlantDeviceDetails[param];
        setSelectedPlantDeviceDetails((prevDetails) => ({
          ...prevDetails,
          [param]: {
            ...paramValue,
            isUpdated: false,
          },
        }));
      }
    } else {
      const paramValue = selectedPlantDeviceDetails[param];
      setSelectedPlantDeviceDetails((prevDetails) => ({
        ...prevDetails,
        [param]: {
          ...paramValue,
          isUpdated: false,
        },
      }));
    }
  }, [selectedPlant, selectedDevice, selectedPlantDeviceDetails]);

  const handleSimulateClick = useCallback(async (param) => {
    if (basePath) {
      const response = await fetch(`${basePath}/${selectedPlant}/${selectedDevice}/${param}`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value: selectedPlantDeviceDetails[param].value, simulation: true })
      });
      const res = await response.json();
      if (res) {
        const paramValue = selectedPlantDeviceDetails[param];
        setSelectedPlantDeviceDetails((prevDetails) => ({
          ...prevDetails,
          [param]: {
            ...paramValue,
            simulation: true,
          },
        }));
      }
    }
  }, [selectedPlant, selectedDevice, selectedPlantDeviceDetails]);
  
  const handleUrlChange = (newUrl) => {
    setBasePath(newUrl); // Update the basePath with the new URL
  };

  useEffect(() => {
    fetchPlants();
  }, [basePath]);

  useEffect(() => {
    selectedPlant && fetchPlantDevices();
  }, [selectedPlant, basePath]);

  useEffect(() => {
    selectedDevice && fetchPlantDeviceDetails();
  }, [selectedDevice, basePath]);

  useEffect(() => {
    if (plants.length) {
      setSelectedPlant(plants[0]);
    }
  }, [plants]);

  useEffect(() => {
    if (plantDevices.length) setSelectedDevice(plantDevices[0]);
  }, [plantDevices]);

  // Effect to handle periodic updates
  useEffect(() => {
    if (plantFreq && selectedPlant && selectedDevice) {
      fetchPlantDeviceDetailsValues(); // Fetch immediately on mount
      if (interval.current) clearInterval(interval.current); // Clear existing interval if any
      interval.current = setInterval(fetchPlantDeviceDetailsValues, plantFreq * 1000); // Set periodic fetching
    } else {
      clearInterval(interval.current);
    }

    // Cleanup interval on unmount or dependencies change
    return () => {
      clearInterval(interval.current);
    };
  }, [plantFreq, selectedPlant, selectedDevice]);

  return (
    <Box
      sx={{
        // backgroundImage: "url('/chemical-plant.jpg')", // Replace with your image URL
        // backgroundRepeat: "no-repeat",
        // backgroundSize: "cover", // Ensures the image covers the entire background
        // backgroundPosition: "center",
        width: "100%",
        display: "flex",
        flexDirection: "column", // Stack elements vertically for better responsiveness
        padding: "20px",
        gap: "20px",
        alignItems: "center",
        minHeight: "100vh", // Ensure the gradient covers the entire viewport
        background: "white", // Gradient background
        // backgroundRepeat: "no-repeat",
        "@media (min-width: 1024px)": {
          flexDirection: "row", // Switch to horizontal layout for larger screens
          alignItems: "flex-start",
        },
      }}
    >
      {/* Bioreactor Image */}
      <Box
        sx={{
          width: "100%", // Full width for smaller screens
          maxWidth: "600px",
          height: "300px",
          backgroundImage: "url(/bioreactorV2.gif)",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          opacity: 0.8,
          "@media (min-width: 1024px)": {
            width: "40%", // 40% width for larger screens
            height: "80vh",
            marginTop: "220px",
          },
        }}
      />

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          width: "100%", // Ensure full width for smaller screens
          maxWidth: "600px",
        }}
      >
        {/* Title */}
        <Typography
          variant="h4"
          component="h1"
          sx={{
            color: "black",
            fontWeight: "bold",
            alignItems: "center",
            width: "100%",
            marginLeft:"-20px",
            // marginRight:"1000px",
          }}
        >
          OPC Plant Simulator
        </Typography>

        {/* Plant Selector */}
        <PlantSelector plants={plants || []} selected={selectedPlant} onSelect={setSelectedPlant} />

        {/* Device Selector */}
        {selectedPlant && plantFreq && (
          <DeviceSelector
            devices={plantDevices}
            freq={plantFreq}
            selected={selectedDevice}
            onSelect={setSelectedDevice}
            onFreqChange={handleFreqChange}
          />
        )}

        {/* Parameters Display */}
        {selectedPlantDeviceDetails && (
          <ParametersDisplay
            parameters={selectedPlantDeviceDetails}
            setParameters={setSelectedPlantDeviceDetails}
            handleCheckClick={handleCheckClick}
            handleSimulateClick={handleSimulateClick}
            handleUrlChange={handleUrlChange}
          />
        )}
      </Box>
    </Box>
  );
}

export default App;