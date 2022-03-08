import axios from "axios";
import '../CSS-files/CreateProject.css'
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import CreatableSelect from "react-select/creatable";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { TwitterCard } from './TwitterCard'
import { Leafletmap } from "./Leafletmap";

export const CreateProject = ({ children }) => {
    const [jsondata, setJsondata] = useState(null)
    const [location, setLocation] = useState([{
        location_name: "Arkansas, United States"
    }])
    const [projectName, setProjectName] = useState(null)
    const [selectionState, setSelectionState] = useState(true)
    const [dataOptions, setDataOptions] = useState(null)
    const [mapLayers, setMapLayers] = useState(null)
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
                "Project Name":projectName, 
                "map-layers": selectionState ? JSON.stringify(jsondata) : JSON.stringify(mapLayers[Object.keys(mapLayers)[0]]) , 
            }
           })
            .then((response) => {
                if (response.status == 200) {
                  
                }

            }).catch((error) => {
                if (error.response.status == 401) {
                 
                }
                else if (error.response.status == 409) {
                    
                }
            })
    }

    return (


        <div className="createBox">
            <div className="column">
                <form className="form-create">
                    Project Name: <input onChange={(e) => setProjectName(e.target.value)} />
                    <input id="selection1" type="radio" value="state" name="createProj" onClick={() => setSelectionState(true)} /> Select a State {selectionState && <CreatableSelect
                        options={dataOptions}
                        id="selection1"
                        noOptionsMessage={() => null}
                        promptTextCreator={() => false}
                        formatCreateLabel={() => undefined}
                        onChange={handleStateClick} />}
                    <input id="selection" type="radio" name="createProj" onClick={() => setSelectionState(false)} /> Draw the geographic score on map
                    <button type="secondary" className="createbtn" style={{ "float": "left" }} onClick={handleSave} >Save</button>
                    <button className="createbtn" style={{ "float": "right" }}>Cancel</button>

                </form>
            </div>
            <div className="column">
                {/* Below is map re renders after every switch of state or drawing */}
                {selectionState ? <Leafletmap key="1" geojson={jsondata} id="create-map" drawings={false} setMaplayersFunction={setMapLayers} /> : <Leafletmap key="2" id="create-map" onChange={null} searchBar={true} drawings={true} setMaplayersFunction={setMapLayers} />}
            </div>
        </div>

    );
}

export default CreateProject;
