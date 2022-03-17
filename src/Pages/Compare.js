import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle, GeoJSON } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import CreatableSelect from "react-select/creatable";
import '../CSS-files/Compare.css'
import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";
import { slide as Menu } from 'react-burger-menu'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { TwitterCard } from './TwitterCard'
import Rangy from "rangy";
import { useParams } from "react-router-dom";
// Once checked double check with saved on database theres a bounds and a x y 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

export const Compare = () => {
    const [position, setPosition] = useState({ lat: 43.5128472, lng: -76.2510408 }); // { lat: 42.8864, lng: -78.8784 }
    const ZOOM_LEVEL = 12;
    const mapRef = useRef();
    const [isloading, setIsloading] = useState(true)
    const [annotators, setAnnotators] = useState("");
    let { projectName } = useParams();
    const [userData1, setUserData1] = useState()
    const [userData2, setUserData2] = useState()
    //position ZOOM_LEVEL
    useEffect(() => {
        axios({
            method: "GET",
            url: "/compare/" + projectName,
            withCredentials: true
        })
            .then((response) => {
                if (response.status == 200) {
                    console.log(response.data)
                    setAnnotators(response.data.map((user) => {
                        return ({
                            "label": user.username,
                            "value": user.username,
                            "text": user.text,
                            "highlight": user.annotation.highlight,
                            "category": user.annotation.category,
                            "geojson": L.geoJSON(Object.values(user.annotation["spatial-footprint"])),
                            "projectGeojson": L.geoJSON(user.projectGeojson,
                                { style: { "fillColor": "white", "opacity": "1", "color": "red", "fillOpacity": "0" } })

                        });
                    }));
                }
            }).catch((error) => {
                if (error.response.status == 401) {
                    alert("No data found");
                }
            })
    }
        , [])
    useEffect(() => {
        if (userData1) {
            pre_highlight("tweetcard1", userData1.highlight)
        }
    }, [userData1])
    useEffect(() => {
        if (userData2) {
            pre_highlight("tweetcard2", userData2.highlight)
        }
    }, [userData2])
    const MapSection = (e) => {
        return (
            <MapContainer id='leaflet-compare' center={e.center} zoom={e.zoom} ref={mapRef}
                attributionControl={false}
                whenCreated={map => {
                    var layer = e.geojsonData.addTo(map);
                    var projectLayer = e.projectdata.addTo(map);
                    map.fitBounds(projectLayer.getBounds());
                }}>
                <TileLayer
                    url={osm.maptiler.url}
                    attribution={osm.maptiler.attribution}
                />
            </MapContainer>
        )
    }
    const pre_highlight = (idname, highlight_array) => {
        const sortable = Object.values(highlight_array).sort((a, b) => a.start_idx - b.start_idx)
        console.log(sortable);
        var tweet_div = document.getElementById(idname);
        const range = Rangy.createRange()
        console.log(tweet_div);
        if (!tweet_div) {
            return null;
        }
        var new_index_side = 0
        if (tweet_div.childNodes[1]) {
            console.log(tweet_div.childNodes[1].tagName)
        }
        var keys = Object.keys(sortable)
        var new_index_side = 0
        for (var [nodeIndex, keyIndex] = [0, 0]; keyIndex < keys.length;) {
            var Node = tweet_div.childNodes[nodeIndex]
            if (!Node) {
                break
            }
            else if (Node.tagName == 'MARK') {
                nodeIndex++;
                continue;
            } else {
                var objLocation = sortable[keys[keyIndex]]
                range.setStart(Node, objLocation.start_idx - new_index_side);
                range.setEnd(Node, objLocation.end_idx - new_index_side);
                new_index_side = objLocation.end_idx
                const mark = document.createElement('mark');
                range.surroundContents(mark);
                keyIndex++;
                nodeIndex++;
            }
        }

    }

    return (

        <div className="row">
            <div className='column'>
                Annotator: <CreatableSelect
                    options={annotators}
                    noOptionsMessage={() => null}
                    promptTextCreator={() => false}
                    formatCreateLabel={() => undefined}
                    onChange={(e) => {
                        setUserData1(e);
                    }} />
                {userData1 && <MapSection center={position} zoom={ZOOM_LEVEL} geojsonData={userData1.geojson} projectdata={userData1.projectGeojson} />}
                <div className="resolvesection" id="resolvesection1">
                    {userData1 && <TwitterCard id="usercard1" title="choose which highlight is correct" tweet_id={"tweetcard1"}>{userData1.text}</TwitterCard>}
                </div>
                {userData1 && <input id="resolve1" type="radio" value="state" name="resolve" onClick={(e) => {
                    var id1 = document.getElementById("resolvesection1");
                    id1.style.boxShadow = "20px 20px 50px 15px green";
                    var id2 = document.getElementById("resolvesection2");
                    id2.style.boxShadow = "none";
                }} />}
                { userData1 && 
                    <div>
                        <input
                            type="text"
                            value={userData1.category}
                        />
                    </div>}

            </div>
            <div className="column">
                Annotator: <CreatableSelect
                    options={annotators}
                    noOptionsMessage={() => null}
                    promptTextCreator={() => false}
                    formatCreateLabel={() => undefined}
                    onChange={(e) => setUserData2(e)} />
                {userData2 && <MapSection center={position} zoom={ZOOM_LEVEL} geojsonData={userData2.geojson} projectdata={userData2.projectGeojson} />}
                <div className="resolvesection" id="resolvesection2">
                    {userData2 && <TwitterCard id="usercard2" title="choose which highlight is correct" tweet_id={"tweetcard2"}>{userData2.text}</TwitterCard>}
                </div>
                {userData2 && <input id="resolve2" type="radio" value="state" name="resolve" onClick={(e) => {
                    var id2 = document.getElementById("resolvesection2");
                    id2.style.boxShadow = "20px 20px 50px 15px green";
                    var id1 = document.getElementById("resolvesection1");
                    id1.style.boxShadow = "none";
                }} />}
                {userData2 &&
                <div>
                    <input
                        type="text"
                        value={userData2.category}
                    />
                </div>}
            </div>
            {userData2 && userData1 && <div id="comparebuttons">
                <button className="CompareBtn">
                    Submit!
                </button>
                <button className="CompareBtn">
                    Create new annotation
                </button>
            </div>}
        </div>

    )
}