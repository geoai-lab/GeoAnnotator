import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import "./leafletmap.css"

import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";
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

export const Leafletmap = ({ onChange }) => {
    const provider = new OpenStreetMapProvider({
        params: {
            email: 'jv11699@gmail.com', // auth for large number of requests
            countrycodes: 'us'
        }
    }
    );

    //Results must be cached on your side. Clients sending repeatedly the same query may be classified as faulty and blocked.
    const [position, setPosition] = useState({ lat: 43.5128472, lng: -76.2510408 }); // { lat: 42.8864, lng: -78.8784 }
    const [mapLayers, setMapLayers] = useState({});
    const [isloading, setIsloading] = useState(true)
    const [locations, setLocations] = useState({})
    const [timeout, setTimeout] = useState(false)
    const [navbarOpen, setNavbarOpen] = useState(false)
    const [isinitial, setIsinitial] = useState(false)
    const [rectangleBoundary, setRectangleBoundary] = useState([
        [43.4928472, -76.2710408],
        [43.5328472, -76.2310408]
    ])

    const ZOOM_LEVEL = 12;
    const mapRef = useRef();
    const ChangeView = (center) => {
        
        // should only change when position changes 
        const map = useMap();
        if(!isinitial){
            return null
        }
        map.setView(center.center, 12);
        map.fitBounds(rectangleBoundary)
        return null
    }
    useEffect(() => {
        if (timeout == true) {
            console.log("already done waiting")
            return
        }
        var location_total = ""
        if (Object.keys(onChange).length !== 0) {
            for (var predicted of onChange) {
                location_total = location_total + predicted.location_name + " "
            }
        }
        const fetchData = async () => {
            try {
                const data = await provider.search({ query: location_total, country: "us", credentials: "same-origin" })
                return data
            }
            catch (error) {
                console.log(error);
            }
        }


        var res_api = setTimeout(() => {
            fetchData().then(data => {
                setLocations(data)
                setTimeout(true)
                setIsloading(false)
            })
        }, 1500)


        return () => clearTimeout(res_api)


    }, [timeout])



    if (isloading) {
        return <div class="windows8">
        <div class="wBall" id="wBall_1">
         <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_2">
         <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_3">
         <div class="wInnerBall"></div>
        </div>
        <div class="wBall" id="wBall_4">
         <div class="wInnerBall"></div>
       </div>
       <div class="wBall" id="wBall_5">
        <div class="wInnerBall"></div>
       </div>
      </div>;
    }
    const handleSuggestionRequest = (e) => {
        e.preventDefault();
        const json_value = JSON.parse(e.target.value)


        setPosition(
            { lat: json_value.latlng[0], lng: json_value.latlng[1] }
        )
        setRectangleBoundary(
            json_value.bounds
        )
        setIsinitial(true)

    };

    const SearchField = () => {
        const searchControl = new GeoSearchControl({
            provider: provider,
            showMarker: false,
            style: 'button',
            position: 'topleft',
            keepResult: true,
            updateMap: true
        });

        const map = useMap();

        useEffect(() => {
            map.addControl(searchControl);
            map.on('geosearch/showlocation', data => {
                setPosition(
                    { lat: data.location.x, lng: data.location.y }
                )
                setRectangleBoundary(
                    data.location.bounds
                )
            });
            return () => map.removeControl(searchControl);
        }, []);

        return null;
    };


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
            setMapLayers((prevLayers) => ({
                ...prevLayers,
                [key]: undefined
            }));
        }



    }



    const purpleOptions = { color: 'purple' }
    return (
        <>


            <div className="row">
                <div className="col text-center">

                    <div className='form-group col-md-13'>

                        <MapContainer center={position} zoom={ZOOM_LEVEL} ref={mapRef}

                            attributionControl={false}>
                            <Rectangle
                                bounds={rectangleBoundary}
                                pathOptions={purpleOptions}
                            />
                            <ChangeView center={position} />
                            <SearchField />
                            <FeatureGroup>
                                <EditControl
                                    position="topright"
                                    onCreated={_onCreate}
                                    onEdited={_onEdit}
                                    onDeleted={_onDeleted}
                                    draw={
                                        {
                                            rectangle: true,
                                            circle: false,
                                            circlemarker: false,
                                            marker: false,
                                            polyline: false
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

                </div>

            </div>
            <div class="suggestions" >
                <DropdownButton id="dropdown-item-button" title="Suggestions" drop="up" 
                variant="secondary" key="up" as={ButtonGroup}
                align={{ lg: 'start' }}>
                    { !isloading &&
                    <Dropdown.Menu  >
                        { Object.keys(locations).map(function (key_o, index) {
                            return (< Dropdown.Item
                                as="button"
                                onClick={(e) => { handleSuggestionRequest(e) }} eventKey={key_o} id={key_o} value={JSON.stringify({ "latlng": [locations[key_o].y, locations[key_o].x], "bounds": locations[key_o].bounds })} >{locations[key_o].label}</Dropdown.Item >)
                        })}
                    </Dropdown.Menu>}
                </DropdownButton>

            </div>
        </>
    )
}
