import React, { useState, useEffect, useRef, useCallback } from "react";
import { PlantSelector } from "./PlantSelector";
import { DeviceSelector } from "./DeviceSelector";
import { ParametersDisplay } from "./ParametersDisplay";
import { Box } from "@mui/material";

function App() {
  const basePath = process.env.REACT_APP_API_BASE_URL;
  const [plants, setPlants] = useState([]);
  const [plantDevices, setPlantDevices] = useState([]);
  const [plantFreq, setPlantFreq] = useState();
  const [selectedPlant, setSelectedPlant] = useState("");
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedPlantDeviceDetails, setSelectedPlantDeviceDetails] = useState(null);
  const interval = useRef();

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

  useEffect(() => {
    fetchPlants();
  }, []);

  useEffect(() => {
    selectedPlant && fetchPlantDevices();
  }, [selectedPlant]);

  useEffect(() => {
    selectedDevice && fetchPlantDeviceDetails();
  }, [selectedDevice]);

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
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <PlantSelector plants={plants || []} selected={selectedPlant} onSelect={setSelectedPlant} />
      {selectedPlant && plantFreq && (
        <DeviceSelector devices={plantDevices} freq={plantFreq} selected={selectedDevice} onSelect={setSelectedDevice} onFreqChange={handleFreqChange} />
      )}
      {selectedPlantDeviceDetails && (
        <ParametersDisplay parameters={selectedPlantDeviceDetails} setParameters={setSelectedPlantDeviceDetails} handleCheckClick={handleCheckClick} handleSimulateClick={handleSimulateClick} />
      )}
    </Box>
  );
}

export default App;
