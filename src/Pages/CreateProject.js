import axios from "axios";
import '../CSS-files/CreateProject.css'
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import Select from "react-select";
import { TwitterCard } from './TwitterCard'
import { Leafletmap } from "./Leafletmap";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
export const CreateProject = ({ children }) => {
    const [jsondata, setJsondata] = useState(null)
    const [location, setLocation] = useState([{
        location_name: "Arkansas, United States"
    }])
    const [projectName, setProjectName] = useState(null)
    const [selectionState, setSelectionState] = useState(false)
    const [dataOptions, setDataOptions] = useState(null)
    const navigate = useNavigate();
    const [mapLayers, setMapLayers] = useState(null)
    const [stateLabel, setStateLabel] = useState(null)
    const [file, setFile] = useState()
    useEffect(() => {
        fetch('/createproject').then(response => {
            if (response.ok) {
                return response.json()
            }
        }).then(data => {
            setDataOptions(data)
        }
        )
    }, [])

    const handleStateClick = (event) => {
        setSelectionState(true);
        document.getElementById('drawradio').checked = false;
        setStateLabel({ "label": event.label })
        setJsondata(event.geojson)
        console.log(event.geojson)
    }
    const handleSave = (event) => {
        event.preventDefault();
        axios({
            method: "POST",
            url: "/createproject-submit",
            withCredentials: true,
            data: {
                "Project Name": projectName,
                "map-layers": selectionState ? JSON.stringify(jsondata) : JSON.stringify(mapLayers[Object.keys(mapLayers)[0]]),
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    navigate('/api/project_name=' + projectName)
                }   

            }).catch((error) => {
                if (error.response.status == 401) {

                }
                else if (error.response.status == 409) {

                }
            })
    }
    const handletwitterDataInput = (event) => {
        setFile(event.target.files[0])
        
    }
   

    return (


        <div className="createBox">
            <div className="column">
                <Card className="form-create">
                    Project Name: <input id="projectnameinput" onChange={(e) => setProjectName(e.target.value)} />
                    <div className="radio_buttonsection">
                        <div className="div-table-row">
                            <div className="div-table-col">
                                Select a State  <Select
                                    options={dataOptions}
                                    className="createSelect"
                                    placeholder="Select a State"
                                    value={stateLabel}
                                    onChange={handleStateClick} />
                            </div>
                            <div className="div-table-col">
                                <input className="radiobutton" id="drawradio" type="radio" name="createProj"
                                    onClick={() => {
                                        setSelectionState(false);
                                        setStateLabel(null);
                                    }} /> Draw the geographic score on map
                            </div>
                        </div>
                    </div>


                    <button type="secondary" className="createbtn" style={{ "float": "left" }} onClick={handleSave} >Save</button>

                    <label class="custom-file-upload">
                        <input type="file" onChange={handletwitterDataInput}/>
                                {file ? "Uploaded: " + file.name: "Upload Twitter Data"}
                    </label>
                </Card>

            </div>

            <div className="column">
                {/* Below is map re renders after every switch of state or drawing */}
                {selectionState ? <Leafletmap key="1" id="create-map" geojson={jsondata} id="create-map" drawings={false} setMaplayersFunction={setMapLayers} /> : <Leafletmap key="2" id="create-map" onChange={null} searchBar={true} drawings={true} setMaplayersFunction={setMapLayers} />}
            </div>
        </div>

    );
}

export default CreateProject;
