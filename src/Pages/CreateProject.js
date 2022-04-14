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
import $ from "jquery";
import * as util from "./Util.js"
export const CreateProject = ({ children }) => {
    const [jsondata, setJsondata] = useState(null)
    const [location, setLocation] = useState([{
        location_name: "Arkansas, United States"
    }])
    const [projectName, setProjectName] = useState(null)
    const [selectionState, setSelectionState] = useState(false)
    const [StateOptions, setDataOptions] = useState(null)
    const navigate = useNavigate();
    const [mapLayers, setMapLayers] = useState(null)
    const [stateLabel, setStateLabel] = useState(null)
    const [file, setFile] = useState()
    useEffect(() => {
        fetch('/createprojects').then(response => {
            console.log(response)
            if (response.ok) {
                return response.json()
            }
        }).then(data => {
            console.log(data);
            setDataOptions(data)
        })

    }, [])

    const handleStateClick = (event) => {
        setSelectionState(true);
        setStateLabel({ "label": event.label });
        setJsondata(event.geojson);
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
            }); 
  
    }
    const handletwitterDataInput = (event) => {
        // const formData = new FormData(); 
        // formData.append("TwitterFile", event.target.files[0])
        if( event.target.files[0].type === "text/plain"){
            setFile(event.target.files[0]);
        }else{
            util.ToggleMessage("error","please upload a text file");
        }
       
    }


    return (
        <div className="container">
            <div class="row">
                <div className="createBox">
                    <div className="col" style={{ "width": "50%", "position": "relative", "float": "left" }}>
                        <div class="row">
                            <Card className="form-create">
                                Project Name: <input id="projectnameinput" onChange={(e) => setProjectName(e.target.value)} />
                                <div className="radio_buttonsection">
                                    <div className="col">
                                        <div className="row" style={{ "margin": "5px" }}>
                                            <div className="col-md-3" >
                                                <b style={{ float: "left", top:"15px", position:"relative" }}>Select a State: </b>
                                            </div>
                                            <div className="col">
                                                <Select
                                                    options={StateOptions}
                                                    className="createSelect"
                                                    placeholder="Select a State"
                                                    value={stateLabel}
                                                    onChange={handleStateClick} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3" >
                                                <input className="radiobutton" id="drawradio" type="radio" name="createProj"
                                                    checked={ !selectionState }
                                                    onClick={() => {
                                                        setSelectionState(false);
                                                        setStateLabel(null);
                                                    }} />
                                            </div>
                                            <div className="col-md-6">
                                                <b>  Draw the geographic scope on map </b>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <label class="custom-file-upload">
                                    <input type="file" onChange={handletwitterDataInput} 
                                     accept="text/txt"/>
                                    {file ? "Uploaded: " + file.name : "Upload Twitter Data (.txt file)"}
                                </label>
                            </Card>
                        </div>
                        <div class="row">
                            <button type="secondary" class="button" id="createbtn" style={{ "float": "left" }} onClick={handleSave} >Save</button>
                        </div>
                    </div>
                    <div className="col" style={{ "width": "50%", "position": "relative", "float": "right" }}>
                        {/* Below is map re renders after every switch of state or drawing */}
                        {selectionState ? <Leafletmap key="1" id="create-map" geojson={jsondata} drawings={false} setMaplayersFunction={setMapLayers} editControl={false} /> : <Leafletmap key="2" id="create-map" onChange={null} searchBar={false} drawings={false} setMaplayersFunction={setMapLayers} editControl={true}/>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreateProject;
