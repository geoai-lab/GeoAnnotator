import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle, GeoJSON } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import axios from "axios";
import 'leaflet-geosearch/dist/geosearch.css';
import 'leaflet/dist/leaflet.css';
import "leaflet-draw/dist/leaflet.draw.css";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Loading from "./Loading";
import '../CSS-files/Compare.css'
import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup, Card } from "react-bootstrap";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { TwitterCard } from './TwitterCard'
import Rangy from "rangy";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import * as util from './Util.js';
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
/**
     * Component of the comparison page
     * This component is shown at /compare page when there is a resolver and he/she is trying to resolve which two annotations are more correct. 
     */
export const Compare = () => {
    const [position, setPosition] = useState({ lat: 43.5128472, lng: -76.2510408 }); // state object of the position of the map in terms of latitude and longitude. Initial position is given 
    const ZOOM_LEVEL = 12; // Zoom Level of initial render of the map
    const mapRef1 = useRef(); // references for the left side map (currently not being used)
    const mapRef2 = useRef();// references for the right side map (currently not being used)
    const [annotators, setAnnotators] = useState(""); // state object that will contain the submissions of annotations. (i.g. this state will contain the submissions that the resovler is going to resolve)
    let { projectName } = useParams(); // parameter of specific tweet (not implemented yet. but in the future this will be needed if a specific tweet wants to be resovled)
    const navigate = useNavigate(); // navigation object to. Acts much like an <a href=""/>
    const [userData1, setUserData1] = useState(); // current annotation data of the left side the compare page
    const [userData2, setUserData2] = useState();// current annotation data of the right side the compare page
    const [curTweetId, setCurTweetId] = useState(""); // current tweet id that is being resolved 
    const [choosenUser, setChoosenUser] = useState(null); // the choosen correct annotation by the resolver 
    const [userKey1, setUserKey1] = useState(1); // unique key for CSS userData1
    const [userKey2, setUserKey2] = useState(1); // unique key for CSS userData2
    const [waitingForData, setWaitingForData] = useState(true); // State object to show a loading screen 
    const [submissionEffect, setSubmissionEffect] = useState(true); // state object to run a useEffect 
    //position ZOOM_LEVEL
    useEffect(() => {
        // useEffect to grab data needed to comparisons (i.g. fetches data from the backend to grab submissions of annotators )
        axios({
            method: "GET",
            url: "/comparison",
            withCredentials: true
        })
            .then((response) => {

                if (response.status == 200) {
                    console.log(response.data)
                    setWaitingForData(false);
                    setChoosenUser(null);
                    setAnnotators(response.data.map((user) => {
                        setCurTweetId(user.tweetid);
                        return ({
                            "label": user.username,
                            "value": user.username,
                            "submissionid": user.submission_id,
                            "text": user.text,
                            "highlight": user.annotation.highlight,
                            "userid": user.userid,
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
                else if (error.response.status == 500) {
                    util.ToggleMessage("primary","All submissions have been resolved by you");
                }
            })
    }
        , [submissionEffect])
    useEffect(() => {
        // useEffect when the left side of the map is different. (i.g. when a resolver chooses a different annotation/annotator for user 1, run thorugh this effect and update the tweet that specific annotator highlighted)
        if (userData1) {
            pre_highlight("tweetcard1", userData1.highlight)
        }
    }, [userData1])
    useEffect(() => {
           // useEffect when the right side of the map is different. (i.g. when a resolver chooses a different annotation/annotator for user 2, run thorugh this effect and update the tweet that specific annotator highlighted)
        if (userData2) {
            pre_highlight("tweetcard2", userData2.highlight)
        }
    }, [userData2])
    const MapSection = (e) => {
        // function to return a map object with polygons of annotations 
        return (
            <MapContainer key={e.key} id='leaflet-compare' center={e.center} zoom={e.zoom}
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
        // function to pre highlight on the twitter card the location descriptions that was highlighted 
        const sortable = Object.values(highlight_array).sort((a, b) => a.start_idx - b.start_idx)
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
    const handleCreateAnnotation = () => { 
        // function for when a resolver wants to create a new annotation with that specific tweet 
        navigate("/api/" + curTweetId);
    }
    const handleSubmit = () => {
        // event handler to handle when a resolver finally submits which annotation he/she thinks is right. 
        setWaitingForData(true);
        setUserKey1(data => data + 1);
        setUserData2(data => data + 1);
        setUserData1(null);
        setUserData2(null);
        setChoosenUser(null);
        setSubmissionEffect(data => !data);
        axios({
            method: "POST",
            url: '/compare/submit',
            withCredentials: true,
            data: {
                'submission-userid-1': userData1.userid, // handle user ID in backend 
                'submission-userid-2': userData2.userid,
                'submissionid-1': userData1.submissionid,
                'submissionid-2': userData2.submissionid,
                'choosing-correct-submission': choosenUser
            }
        })
            .then((response) => {
                if (response.status == 200) {
                    alert("submission sucess");

                }

            }).catch((error) => {
                if (error.response.status == 500) {
                    alert("submission failed")
                }

            })
    }
    return (
        <>
            <div className="container" id="compareSection">
                {!waitingForData &&
                    <div>
                        <div className="row" style={{ "height": "100%", "width": "100%", "position": "absolute", "left": "10px" }}>
                            <div className='col' style={{ "z-index": "10", "height": "100%", "width": "50%", "position": "relative" }}>
                                <div className="row">
                                    <Select
                                        options={(annotators && userData2) ? annotators.filter(data => data.label != userData2.label) : annotators}
                                        className="selectCompare"
                                        placeholder="Select Annotator"
                                        onChange={(e) => {
                                            if (userData1 && (userData1.label == e.label)) {
                                                return null;
                                            }
                                            setUserKey1(data => data + 1);
                                            setUserData1(e);
                                        }}
                                        maxMenuHeight={200} />
                                </div>
                                <div className="row">
                                    {userData1 && <MapSection key={1} center={position} zoom={ZOOM_LEVEL} geojsonData={userData1.geojson} projectdata={userData1.projectGeojson} />}
                                </div>
                                <div class="row">
                                    <div className="resolvesection" id="resolvesection1">
                                        {userData1 && <TwitterCard key={userKey1} id="usercard1" title="choose which highlight is correct" tweet_id={"tweetcard1"}>{userData1.text}</TwitterCard>}
                                    </div>
                                </div>
                                {userData1 && <input id="resolve1" type="radio" value="state" name="resolve" onClick={(e) => {
                                    var id1 = document.getElementById("resolvesection1");
                                    id1.style.boxShadow = "20px 20px 50px 15px green";
                                    var id2 = document.getElementById("resolvesection2");
                                    id2.style.boxShadow = "none";
                                    setChoosenUser(userData1.userid);

                                }} />}
                                {userData1 &&
                                    <div>
                                        <Card
                                            id="catinpt"
                                            type="text"
                                        >{userData1.category}</Card>
                                    </div>}

                            </div>
                            <div className="col" style={{ "width": "50%", "position": "relative" }}>
                                <div class="row">
                                    <Select
                                        className="selectCompare"
                                        options={(annotators && userData1) ? annotators.filter(data => data.label != userData1.label) : annotators}
                                        placeholder="Select Annotator"
                                        onChange={(e) => {
                                            if (userData2 && (userData2.label == e.label)) {
                                                return null;
                                            }
                                            setUserKey2(data => data + 1);
                                            setUserData2(e);
                                        }}
                                        onClick={(e) => e.preventDefault()}
                                        maxMenuHeight={200} />
                                </div>
                                <div class="row">
                                    {userData2 && <MapSection key={2} center={position} zoom={ZOOM_LEVEL} geojsonData={userData2.geojson} projectdata={userData2.projectGeojson} />}
                                </div>
                                <div class="row">
                                    <div className="resolvesection" id="resolvesection2">
                                        {userData2 && <TwitterCard key={userKey2} id="usercard2" title="choose which highlight is correct" tweet_id={"tweetcard2"}>{userData2.text}</TwitterCard>}
                                    </div>
                                </div>
                                {userData2 && <input id="resolve2" type="radio" value="state" name="resolve" onClick={(e) => {

                                    var id2 = document.getElementById("resolvesection2");
                                    id2.style.boxShadow = "20px 20px 50px 15px green";
                                    var id1 = document.getElementById("resolvesection1");
                                    id1.style.boxShadow = "none";
                                    setChoosenUser(userData2.userid);
                                }} />}
                                {userData2 &&
                                    <div>
                                        <Card
                                            id="catinpt"
                                            type="text"
                                        >{userData2.category}</Card>
                                    </div>}

                            </div>

                        </div>
                        <div class="row">
                            {choosenUser && userData2 && userData1 && <div id="comparebuttons">
                                <button className="CompareBtn" onClick={handleSubmit}>
                                    Submit!
                                </button>
                                <button onClick={handleCreateAnnotation} className="CompareBtn">
                                    Create new annotation
                                </button>
                            </div>}
                        </div>
                    </div>}
            </div>
            {waitingForData && <Loading />}

        </>
    )
}