import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import { ListGroup } from "react-bootstrap";
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
    const [listTags, setListTags] = useState(null)
    const [timeout, setTimeout] = useState(false)
    const [rectangleBoundary, setRectangleBoundary] = useState([
        [43.4928472, -76.2710408],
        [43.5328472, -76.2310408]
    ])
    
    const ZOOM_LEVEL = 12;
    const mapRef = useRef();
    const ChangeView = (center) => {
        const map = useMap();
       
        map.setView(center.center, 12);
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


    console.log(locations)
    if (isloading) {
        return <div id="loading"></div>;
    }
    const handleSuggestionRequest = (e) => {
        e.preventDefault();
        const json_value = JSON.parse(e.target.value)
        console.log(e.target)
        console.log(json_value)
        setPosition(
            { lat: json_value.latlng[0], lng: json_value.latlng[1] }
        )
        setRectangleBoundary(
            json_value.bounds
        )
        console.log(rectangleBoundary)
        const map = mapRef.current;
        if (map) {
            map.leafletElement.fitBounds(json_value.bounds)
        }
        //do something...

    };

    const SearchField = () => {
        const searchControl = new GeoSearchControl({
            provider: provider,
            showMarker: false,
            style: 'button',
            position: 'topleft',
            keepResult: true
        });

        const map = useMap();
        useEffect(() => {
            map.addControl(searchControl);
            return () => map.removeControl(searchControl);
        }, []);

        return null;
    };


    const _onCreate = (e) => {


        const { layerType, layer } = e;
        const id = layer._leaflet_id
        const geoJson = layer.toGeoJSON()
        setMapLayers((prevLayers) => ({
            ...prevLayers,
            [id]: geoJson
        }));

    };

    const _onEdit = (e) => {
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
    const alrt = () => {
        alert(JSON.stringify(mapLayers, 0, 2))
    }
    const polygon = [
        [43.4928472, -76.2710408],
        [43.5328472, -76.2310408]
    ]

    const purpleOptions = { color: 'purple' }
    return (
        <>


            <div className="row">
                <div className="col text-center">
                    <h2>Please plot the location</h2>
                    <div className="col">
                        <MapContainer center={position} zoom={ZOOM_LEVEL} ref={mapRef}
                            style={{ height: '50vh', width: '5wh' }}
                            attributionControl={false}>
                            <Rectangle
                                bounds={rectangleBoundary}
                                pathOptions={purpleOptions}
                            />
                            <ChangeView center={position}/>
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

                        <div style={{ margin: 'auto', display: 'block', width: 700, padding: 30 }}>
                            <h4>Suggestions to choose location</h4>

                            <ListGroup value={isloading}>
                                {locations && Object.keys(locations).map(function (key_o, index) {
                                    return (< ListGroup.Item action
                                        onClick={(e) => { handleSuggestionRequest(e) }} key={key_o} value={JSON.stringify({"latlng":[locations[key_o].y,locations[key_o].x],"bounds":locations[key_o].bounds})} >{locations[key_o].label}</ListGroup.Item >)
                                })}

                            </ListGroup>
                        </div>


                    </div>
                </div>
            </div>
        </>
    )
}
