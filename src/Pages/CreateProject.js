
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
export const CreateProject = ({ children, OnLogin }) => {
    
    const [location, setLocation] = useState([{
        location_name:"Arkansas, United States"
    }])

    const state_options = [{'value': 'AK', 'label': 'Alaska'}, {'value': 'AL', 'label': 'Alabama'}, {'value': 'AR', 'label': 'Arkansas'}, 
    {'value': 'AZ', 'label': 'Arizona'}, {'value': 'CA', 'label': 'California'}, {'value': 'CO', 'label': 'Colorado'}, {'value': 'CT', 'label': 'Connecticut'}, 
    {'value': 'DC', 'label': 'District of Columbia'}, {'value': 'DE', 'label': 'Delaware'}, {'value': 'FL', 'label': 'Florida'}, {'value': 'GA', 'label': 'Georgia'}, 
    {'value': 'HI', 'label': 'Hawaii'}, {'value': 'IA', 'label': 'Iowa'}, {'value': 'ID', 'label': 'Idaho'}, {'value': 'IL', 'label': 'Illinois'}, {'value': 'IN', 'label': 'Indiana'}, {'value': 'KS', 'label': 'Kansas'}, {'value': 'KY', 'label': 'Kentucky'}, {'value': 'LA', 'label': 'Louisiana'}, {'value': 'MA', 'label': 'Massachusetts'}, {'value': 'MD', 'label': 'Maryland'}, {'value': 'ME', 'label': 'Maine'}, {'value': 'MI', 'label': 'Michigan'}, {'value': 'MN', 'label': 'Minnesota'}, {'value': 'MO', 'label': 'Missouri'}, {'value': 'MS', 'label': 'Mississippi'}, {'value': 'MT', 'label': 'Montana'}, {'value': 'NC', 'label': 'North Carolina'}, {'value': 'ND', 'label': 'North Dakota'}, {'value': 'NE', 'label': 'Nebraska'}, {'value': 'NH', 'label': 'New Hampshire'}, {'value': 'NJ', 'label': 'New Jersey'}, {'value': 'NM', 'label': 'New Mexico'}, {'value': 'NV', 'label': 'Nevada'}, {'value': 'NY', 'label': 'New York'}, {'value': 'OH', 'label': 'Ohio'}, {'value': 'OK', 'label': 'Oklahoma'}, {'value': 'OR', 'label': 'Oregon'}, {'value': 'PA', 'label': 'Pennsylvania'}, {'value': 'RI', 'label': 'Rhode Island'}, {'value': 'SC', 'label': 'South Carolina'}, {'value': 'SD', 'label': 'South Dakota'}, {'value': 'TN', 'label': 'Tennessee'}, {'value': 'TX', 'label': 'Texas'}, {'value': 'UT', 'label': 'Utah'}, {'value': 'VA', 'label': 'Virginia'}, {'value': 'VT', 'label': 'Vermont'}, {'value': 'WA', 'label': 'Washington'}, {'value': 'WI', 'label': 'Wisconsin'}, {'value': 'WV', 'label': 'West Virginia'}, {'value': 'WY', 'label': 'Wyoming'}]
    

    return (


        <>
            <div className="column">
                <form className="form-create">
                    Project Name: <input />
                    <input id="selection1" type="radio" value="state" name="createProj" /> Select a State <CreatableSelect
                        options={state_options}
                        id="selection1"
                        noOptionsMessage={() => null}
                        promptTextCreator={() => false}
                        formatCreateLabel={() => undefined} />
                    <input id="selection" type="radio" name="createProj" /> Draw the geographic score on map
                    <button id="createbtn" style={{ "float": "left" }}>Save</button>
                    <button id="createbtn" style={{ "float": "right" }}>Cancel</button>

                </form>
            </div>
            <div className="column">
              <Leafletmap id="create-map" onChange={location}/>
            </div>
        </>

    );
}

export default CreateProject;
