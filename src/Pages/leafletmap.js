import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle, GeoJSON } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import { Card } from 'react-bootstrap';
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import "../CSS-files/leafletmap.css"
import { MDBCol } from "mdbreact";
import { useDebounce } from 'use-debounce';
import AsyncSelect from 'react-select/async';
import Popup from 'reactjs-popup';
import Loading from "./Loading";
import "../CSS-files/Login.css"
import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup, InputGroup } from "react-bootstrap";
import { slide as Menu } from 'react-burger-menu'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { object } from "prop-types";
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
    const [uniqueKey, setUniqueKey] = useState(0)
    const [geojsonLayer, setGeojsonLayer] = useState(null)
    const [rectangleBoundary, setRectangleBoundary] = useState()
    const [map, setMap] = useState(null)
    const [geojsonTag, setGeojsonTag] = useState(null);
    const [selectGeojson, setSelectGeojson] = useState();
    const [changeOpen, setChangeOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const ZOOM_LEVEL = 4;
    const [showGJOptions, setShowGJOptions] = useState(false);
    const mapRef = useRef();
    var typingTimer;
    useEffect(() => {

        if (searchBar && onChange) { // only fires during the /api
            if (mapLayers) {
                setMapLayers(layers => {
                    Object.keys(layers).map(key => map.removeLayer(layers[key]));
                    return null;
                });
                setUniqueKey(data => data + 1);
            }
            var location_total = ""
            if (Object.keys(onChange).length !== 0) {
                for (var predicted of onChange) {
                    location_total = location_total + predicted.locationDesc + " "
                }
            }
            setSearchText(location_total)
            var res_api = setTimeout(() => {
                fetchData(location_total).then(data => {
                    setLocations(data)
                    setTempTimeout(true)
                    setIsloading(false)
                    if (data[0] && map) {
                        setGeojsonTag(data[0].geometry)
                        setUniqueKey(data => data + 1)
                    }
                })
            }, 0)
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
        setEditing(false);


    }, [onChange])
    useEffect(() => {
        Addgeojson(map, geojson, true);
    }, [geojson])
    useEffect(() => {
        Addgeojson(map, geojsonTag, false);
    }, [geojsonTag])
    useEffect(() => {
        if (setMaplayersFunction) {
            setMaplayersFunction(mapLayers)
        }
    }, [mapLayers]);
    useEffect(() => {
        if (setMaplayersFunction && selectGeojson) {
            setMapLayers(oldLayers => {
                return ({
                    ...oldLayers,
                    [-1]: selectGeojson.feature

                });
            })
        }
    }, [selectGeojson])


    const Addgeojson = (map, geojson_type, isBorder) => {
        /* 
        Function only used when user is creating project and the addistion of geojsons are already here
        */

        if (geojson_type && map) {
            var layer = L.geoJSON(geojson_type, {
                style: isBorder ? { "fillColor": "white", "opacity": "1", "color": "red", "fillOpacity": "0" } :
                    { "fillColor": "blue", "opacity": ".95", "color": "blue", "fillOpacity": ".2" },
                onEachFeature: function (feature, layer) {
                    if (!isBorder) {
                        setSelectGeojson(layer);
                        layer.on('click', function (e) {
                            setChangeOpen(data => !data);
                        });

                    }

                }
            }).addTo(map)
            //this section if to fit the latest layer onto the screen
            if (geojsonLayer) {
                setGeojsonLayer(data => {
                    map.removeLayer(data);
                    map.fitBounds(layer.getBounds());
                    return layer;
                })
            } else { // initially goes through here
                if (!isBorder) {
                    setGeojsonLayer(layer);
                }
                map.fitBounds(layer.getBounds())

            }
        }
        return null;
    }

    const handleloadOptions = (input) => {
        if (input) {
            const myPromise = new Promise((resolve, reject) => {
                resolve(fetchData(input).then(data => {
                        var listData = []
                        for (var pair of data) {
                            listData.push({
                                label: pair.properties.display_name, value: pair.properties.display_name,
                                bounds: pair.bbox, geojson: pair.geometry
                            })
                        }
                        return listData
                    }));
              
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
                                label: pair.properties.display_name, value: pair.properties.display_name,
                                bounds: pair.bbox, geojson: pair.geometry
                            })
                        }
                        return listData
                    }));
                })
                return altPromise;
            }

        }

    }
    const fetchData = async (input_string) => {
        try {
            var response_string = "https://geoai.geog.buffalo.edu/nominatim/search?q=" + input_string + "&format=geojson&polygon_geojson=1";
            const data = await fetch(response_string).then(response =>  response.json() ).then(data => data.features)  
            return data
        }
        catch (error) {
            console.log(error);
        }
    }


    if (isloading) {
        return (<Loading />);
    }
    const _onCreate = (e) => {
        setIsinitial(false)
        const { layerType, layer } = e;
        const id = layer._leaflet_id;
        //const geoJson = layer.toGeoJSON();
        
        setMapLayers((prevLayers) => ({
            ...prevLayers,
            [id]: layer
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
                [key]: value
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
            setMapLayers((prevLayers) => {
                delete prevLayers[-1];
                return prevLayers;
            });
        }
        setEditing(false);
        setChangeOpen(data => !data);
    }
    const handleEditGeoJson = () => {

        if (selectGeojson && !editing) {
            setEditing(true);
            selectGeojson.editing.enable();
        } else if (selectGeojson && editing) {
            setEditing(false)
            selectGeojson.editing.disable();
        }
        setChangeOpen(data => !data);
    }
    const handleClickSearch = (json_value) => {
        if (mapLayers && (Object.keys(mapLayers).length > 0)) {
            if (window.confirm("There are still polygons on the screen. This will delete everything. Do you want to continue?")) {
                setMapLayers(layers => {
                    Object.keys(layers).map(key => map.removeLayer(layers[key]));
                    return null;
                });
                setUniqueKey(data => data + 1);
            }
            else {
                return null;
            }
        }
    
      
        setEditing(false);
        setIsinitial(true);
        setGeojsonTag(json_value.geojson);
        setLocationTitle(json_value.label);
    }



    return (
        <>

            <div className="row">
                <div className="col text-center">

                    <div className='form-group col-md-13'>
                        <div>
                            <MapContainer id={id} center={position} zoom={ZOOM_LEVEL} ref={map}
                                attributionControl={false} whenCreated={map => {
                                    setMap(map);
                                    Addgeojson(map, geojson, true);
                                }}>
                              
                                <FeatureGroup >
                                    <EditControl
                                        position="topright"
                                        ref={map}
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
                            </MapContainer>

                        </div>
                        <div className="suggestions" >


                            {searchBar && <AsyncSelect
                                cacheOptions
                                id="dropdown-item-button" title="Suggestions"
                                variant="secondary"
                                placeholder="Search Location"
                                value={SearchText ? { label: SearchText, value: SearchText } : null}
                                defaultOptions
                                align={{ lg: 'start' }}
                                onChange={handleClickSearch}
                                loadOptions={handleloadOptions}
                                filterOption={(options) => options}>
                            </AsyncSelect>}


                        </div>
                        <Popup
                            open={changeOpen}
                            onClose={() => setChangeOpen(false)}
                            modal
                            nested
                        >
                            {close => (
                                <>
                                    <button id="exitbutton" onClick={close}>
                                        &times;
                                    </button>
                                    <Card className="modal2">
                                        <div className="header"> Polygon Option </div>
                                        <div className="popup-content">
                                            <div class="row">
                                                <div class="col">
                                                    <div className="deletesection" id="deletebox">
                                                        <span className="deletemessage" id="deletemessage" onClick={handleDeleteGeojson}>Delete</span>
                                                    </div>
                                                </div>
                                                <div class="col">
                                                    <div className="editsection" id="editbox">
                                                        <span className="deletemessage" id="editmessage" onClick={handleEditGeoJson}>Edit</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>
                                </>
                            )}
                        </Popup>
                        <div id="suggestion-title">
                            {locationTitle}
                        </div>
                    </div>
                </div>

            </div>



        </>
    )
}
