import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle, GeoJSON } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import "../CSS-files/leafletmap.css"
import { MDBCol } from "mdbreact";
import { useDebounce } from 'use-debounce';
import AsyncSelect from 'react-select/async';

import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup, InputGroup } from "react-bootstrap";
import { slide as Menu } from 'react-burger-menu'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
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

export const Leafletmap = ({ children, id, onChange, geojson, searchBar, drawings, setMaplayersFunction }) => {
    const provider = new OpenStreetMapProvider({
        params: {
            email: 'jv11699@gmail.com', // auth for large number of requests
            countrycodes: 'us',
            polygon_geojson: "1"
        }
    }
    );

    // need to fix caching mechanism
    //Results must be cached on your side. Clients sending repeatedly the same query may be classified as faulty and blocked.
    const [position, setPosition] = useState({ lat: 39.7837304, lng: -100.445882 }); // { lat: 42.8864, lng: -78.8784 }
    const [mapLayers, setMapLayers] = useState({}); // puts the data needed to get submitted 
    const [isloading, setIsloading] = useState(true)
    const [locations, setLocations] = useState({})
    const [locationTitle, setLocationTitle] = useState('')
    const [timeout, setTempTimeout] = useState(false)
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [isinitial, setIsinitial] = useState(false)
    const [SearchText, setSearchText] = useState("");
    const [SearchBounceValue] = useDebounce(SearchText, 1500);
    const [uniqueKey, setUniqueKey] = useState(0)
    const [geojsonLayer, setGeojsonLayer] = useState(null)
    const [rectangleBoundary, setRectangleBoundary] = useState()
    const [map, setMap] = useState(null)
    const [geojsonTag, setGeojsonTag] = useState(null)
    const [selectGeojson, setSelectGeojson] = useState(null)
    const ZOOM_LEVEL = 4;
    const mapRef = useRef();
    var typingTimer;

    useEffect(() => {

        if (searchBar && onChange) { // only fires during the /api

            var location_total = ""
            if (Object.keys(onChange).length !== 0) {
                for (var predicted of onChange) {
                    location_total = location_total + predicted.location_name + " "
                }
            }
            setSearchText(location_total)
            var res_api = setTimeout(() => {
                fetchData(location_total).then(data => {
                    setLocations(data)
                    setTempTimeout(true)
                    setIsloading(false)
                    if (data[0] && map) {
                        setGeojsonTag(data[0].raw.geojson)
                        setUniqueKey(data => data + 1)
                    }
                })
            }, 1500)
            setUniqueKey(data => data + 1)

            return () => clearTimeout(res_api)

        } else if (searchBar && !onChange) { // only occurs during when drawing on /createproject
            setIsloading(false)
            setTempTimeout(true)
        }
        else { // only occurs when selecting states on /createproject 
            setIsloading(false)
            setTempTimeout(true)
            if (geojson) {
                setGeojsonLayer(L.geoJSON(geojson))
            }

        }


    }, [onChange])
    useEffect(() => {
        Addgeojson(map);
    }, [geojson])

    const Addgeojson = (map) => {
        /* 
        Function only used when user is creating project and the addistion of geojsons are already here
        */

        if (geojson && map) {
            var layer = L.geoJSON(geojson, { style: { "fillColor": "white", "opacity": "1", "color": "red", "fillOpacity": "0" } }).addTo(map)
            if (geojsonLayer) {
                setGeojsonLayer(data => {
                    map.removeLayer(data)
                    map.fitBounds(layer.getBounds())
                    return layer
                })
            } else {

                setGeojsonLayer(layer)
                map.fitBounds(layer.getBounds())

            }
        }
        return null;
    }
    const Setlayers = useMemo(() => {
        setMaplayersFunction(mapLayers)
        return null;
    }, [mapLayers])

    const handleloadOptions = (input) => {
        console.log(input)
        if (input) {
            const myPromise = new Promise((resolve, reject) => {
                typingTimer = setTimeout(() => {
                    resolve(fetchData(input).then(data => {
                        var listData = []
                        for (var pair of data) {
                            listData.push({
                                label: pair.label, value: pair.label, latlng: { y: pair.y, x: pair.x },
                                bounds: pair.bounds, geojson: pair.raw.geojson
                            })
                        }
                        return listData
                    }));
                }, 1500);
            });
            return myPromise;
        }
        else {
            if (SearchText) {

                const altPromise = new Promise((resolve, reject) => {
                    resolve(fetchData(SearchText).then(data => {
                        var listData = []
                        for (var pair of data) {
                            listData.push({
                                label: pair.label, value: pair.label, latlng: { y: pair.y, x: pair.x },
                                bounds: pair.bounds, geojson: pair.raw.geojson
                            })
                        }
                        return listData
                    }));
                }, 1000)
                return altPromise;
            }

        }





    }

    const fetchData = async (input_string) => {
        try {
            const data = await provider.search({ query: input_string, country: "us", credentials: "same-origin", format: "geojson" })
            console.log(data)
            return data
        }
        catch (error) {
            console.log(error);
        }
    }

    const ChangeView = (center) => {
        //I could have it only run when positions change 

        useEffect(() => {
            // should only change when position changes 

            if (!isinitial) {
                return null
            }
            map.setView(center.center, 12);
            map.fitBounds(rectangleBoundary)
            setIsinitial(false)
            return null
        }, [position])
        return null;
    }

    if (isloading) {
        return (
            <>
                <div className="row">
                    <div className="col text-center">
                        <div className='form-group col-md-13'>
                            <div className="windows8">
                                <div className="wBall" id="wBall_1">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_2">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_3">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_4">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_5">
                                    <div className="wInnerBall"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>);
    }





    const _onCreate = (e) => {

        setIsinitial(false)
        const { layerType, layer } = e;
        const id = layer._leaflet_id
        const geoJson = layer.toGeoJSON()
        setMapLayers((prevLayers) => ({
            ...prevLayers,
            [id]: geoJson
        }));



    };

    const _onEdit = (e) => {
        setIsinitial(false)
        const { layerType, layer } = e;
        const layers = e.layers._layers
        if (Object.keys(layers).length == 0) {
            return
        }
        for (const [key, value] of Object.entries(layers)) {
            setMapLayers((prevLayers) => ({
                ...prevLayers,
                [key]: value.toGeoJSON()
            }));
        }

    }

    const _onDeleted = (e) => {
        setIsinitial(false)
        // Returns the deleted polygons
        const { layerType, layer } = e;
        const layers = e.layers._layers
        if (Object.keys(layers).length == 0) {
            return
        }
        for (const [key, value] of Object.entries(layers)) {
            setMapLayers((prevLayers) => {
                delete prevLayers[key];
                return prevLayers; 
            }
            )
        }



    }

    const handleDeleteGeojson = () => {

        if (selectGeojson) {
            var deletemessage = document.getElementById("deletemessage")
            deletemessage.style.visibility = "hidden";
            map.removeLayer(selectGeojson);
            setSelectGeojson(null);
        }

    }

    const purpleOptions = { color: 'red' }
    var handleClickSearch = (json_value) => {


        setPosition(
            { lat: json_value.latlng.y, lng: json_value.latlng.x }
        )
        setRectangleBoundary(
            json_value.bounds
        )
        setIsinitial(true)
        setUniqueKey(data => data + 1)
        setGeojsonTag(json_value.geojson)
        setLocationTitle(json_value.label)
    }





    return (
        <>

            <div className="row">
                <div className="col text-center">

                    <div className='form-group col-md-13'>

                        <MapContainer id={id} center={position} zoom={ZOOM_LEVEL} ref={mapRef}
                            attributionControl={false} whenCreated={map => {
                                setMap(map);
                                Addgeojson(map);
                            }}>

                            {geojsonTag && <GeoJSON key={uniqueKey} data={geojsonTag} onEachFeature={(feature, layer) => {
                                layer.on('click', function (e) {

                                    //map.removeLayer(layer);
                                });
                                layer.on('mouseover', function (e) {
                                    var deletemessage = document.getElementById("deletemessage")
                                    deletemessage.style.visibility = "visible";
                                    setSelectGeojson(layer)
                                    //map.removeLayer(layer);
                                });
                                layer.on('mouseout', function (e) {
                                    if (e.originalEvent.relatedTarget.className === "deletemessage" || e.originalEvent.relatedTarget.className === "deletesection") {
                                        var deletemessage = document.getElementById("deletemessage")
                                        deletemessage.style.visibility = "visible";
                                        setSelectGeojson(layer)
                                    } else {
                                        var deletemessage = document.getElementById("deletemessage")
                                        deletemessage.style.visibility = "hidden";
                                        setSelectGeojson(null)
                                    }


                                    //map.removeLayer(layer);
                                });


                            }} />}

                            <ChangeView center={position} />

                            <FeatureGroup>
                                <EditControl
                                    position="topright"
                                    onCreated={_onCreate}
                                    onEdited={_onEdit}
                                    onDeleted={_onDeleted}
                                    draw={drawings ?
                                        {
                                            rectangle: true,
                                            circle: false,
                                            circlemarker: false,
                                            marker: true,
                                            polyline: true
                                        }
                                        :
                                        {
                                            rectangle: false,
                                            circle: false,
                                            circlemarker: false,
                                            marker: false,
                                            polyline: false,
                                            polygon: false
                                        }
                                    }
                                />

                            </FeatureGroup>
                            <TileLayer
                                url={osm.maptiler.url}
                                attribution={osm.maptiler.attribution}
                            />

                            {setMaplayersFunction && Setlayers}

                        </MapContainer>

                    </div>
                    <div className="suggestions" >


                        {searchBar && <AsyncSelect
                            cacheOptions
                            key={uniqueKey}
                            id="dropdown-item-button" title="Suggestions"
                            variant="secondary"
                            placeholder="Search"
                            value={SearchText ? { label: SearchText, value: SearchText } : null}
                            defaultOptions
                            align={{ lg: 'start' }}
                            onChange={handleClickSearch}
                            loadOptions={handleloadOptions}
                            filterOption={(options) => options}>
                        </AsyncSelect>}


                    </div>
                    <div className="deletesection" id="deletebox">
                        <span className="deletemessage" id="deletemessage" onClick={handleDeleteGeojson}>Delete?</span>
                    </div>
                    <div id="suggestion-title">

                        {locationTitle}
                    </div>

                </div>

            </div>



        </>
    )
}
