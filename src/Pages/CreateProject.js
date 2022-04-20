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
import Loading from "./Loading";
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
    const [isLoading, setIsLoading] = useState(false);
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
    const handleSave = () => {
        if(Object.keys(mapLayers).length === 0 ){
            util.ToggleMessage("error","No Polygons Drawn"); 
            setIsLoading(false);
            return null;
        }
        axios({
            method: "POST",
            url: "/createproject-submit",
            withCredentials: true,
            data: {
                "Project Name": projectName,
                "map-layers": selectionState ? JSON.stringify(jsondata) : JSON.stringify(mapLayers[Object.keys(mapLayers)[0]].toGeoJSON()),
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    util.ToggleMessage("success", "Upload Complete!");
                    navigate('/api')
                }

            }).catch((error) => {
                if (error.response.status == 401) {
                    util.ToggleMessage("error", error);
                }
                else if (error.response.status == 409) {

                }
            });

    }
    const handletwitterDataInput = (event) => {
        // const formData = new FormData(); 
        // formData.append("TwitterFile", event.target.files[0])
        if (event.target.files[0].type === "text/plain") {
            setFile(event.target.files[0]);
        } else {
            util.ToggleMessage("error", "please upload a text file");
        }

    }
    const onFileUpload = (event) => {
        event.preventDefault();
        if(!file){
            util.ToggleMessage("error","Did not upload any text file"); 
            return null; 
        }
        setIsLoading(true);
        util.ToggleMessage("success","Uploading..")
        const formData = new FormData();
        formData.append("projectName",projectName);
        formData.append(
            "file",
            file
        );
        formData.append("filename", file.name);
        axios({
            method: "POST",
            url: "/uploadfile",
            withCredentials: true,
            data: formData,
            headers: { "Content-Type": 'multipart/form-data'}
        }).then(response => {
            if (response.status === 200) {
                handleSave();
            }
            console.log(response)
        }).catch(error => {
            setIsLoading(false);
            console.log(error)
            util.ToggleMessage("error", error);
        });
    };



    return (
        <>
            <div className="container">
                <div class="row">
                    <div className="createBox">
                        <div className="col" style={{ "width": "50%", "position": "relative", "float": "left" }}>
                            <div class="row">
                                <Card className="form-create">
                                    Project Name: <input id="projectnameinput" onChange={(e) => setProjectName(e.target.value)} />
                                    <div className="radio_buttonsection">
                                        <div className="col">
                                            <div className="row">
                                                <div className="col-md-3">
                                                    <input className="radiobutton" id="drawradio" type="radio" name="selectState"
                                                        style={{ top: "20px", position: "relative" }}
                                                        checked={selectionState}
                                                        onClick={() => {
                                                            setSelectionState(true);
                                                        }} />
                                                </div>
                                                <div className="col-md-3" >
                                                    <b style={{ float: "left", top: "15px", position: "relative" }}>Select a State: </b>
                                                </div>
                                                <div className="col-md-6">
                                                    <Select
                                                        options={StateOptions}
                                                        className="createSelect"
                                                        placeholder="Select a State"
                                                        value={stateLabel}
                                                        onChange={handleStateClick}
                                                        isDisabled={!selectionState} />
                                                </div>
                                            </div>
                                            <div className="row" style={{ "paddingTop": "10px" }}>
                                                <div className="col-md-3" >
                                                    <input className="radiobutton" id="drawradio" type="radio" name="createProj"
                                                        checked={!selectionState}
                                                        onClick={() => {
                                                            setSelectionState(false);
                                                            setStateLabel(null);
                                                        }} />
                                                </div>
                                                <div className="col-md-6" style={{ "line-height": "180%" }} >
                                                    <b >  Draw the geographic scope on map </b>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <label class="custom-file-upload">
                                        <input type="file" onChange={handletwitterDataInput}
                                            accept="text/txt" />
                                        {file ? "Uploaded: " + file.name : "Upload Twitter Data (.txt file)"}
                                    </label>
                                </Card>
                            </div>
                            <div class="row">
                                <button type="secondary" class="button-19" role="button" id="createbtn" style={{ "float": "left" }} onClick={onFileUpload} >Save</button>
                            </div>
                        </div>
                        <div className="col" style={{ "width": "50%", "position": "relative", "float": "right" }}>
                            {/* Below is map re renders after every switch of state or drawing */}
                            {selectionState ? <Leafletmap key="1" id="create-map" geojson={jsondata} drawings={false} setMaplayersFunction={setMapLayers} editControl={false} /> : <Leafletmap key="2" id="create-map" onChange={null} searchBar={false} drawings={false} setMaplayersFunction={setMapLayers} editControl={true} />}
                        </div>
                    </div>
                </div>
            </div>
            {isLoading && <Loading/>}
        </>
    );
}

export default CreateProject;
