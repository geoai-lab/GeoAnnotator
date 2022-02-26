import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup, Polygon, Rectangle } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import CreatableSelect from "react-select/creatable";
import '../CSS-files/Compare.css'
import { ListGroup, Modal, Dropdown, DropdownButton, ButtonGroup } from "react-bootstrap";
import { slide as Menu } from 'react-burger-menu'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import { TwitterCard } from './TwitterCard'
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
    //position ZOOM_LEVEL
    const MapSection = (e) => {
        return (
            <MapContainer id='leaflet-compare' center={e.center} zoom={e.zoom} ref={mapRef}
                attributionControl={false}>
                <TileLayer
                    url={osm.maptiler.url}
                    attribution={osm.maptiler.attribution}
                />
            </MapContainer>
        )
    }
    const annotators = [
        { value: '1', label: 'John Smith' },
        { value: '2', label: 'Jill Valentine' }
    ]
    return (

        <div className="row">
            <div className='column'>
                Annotator: <CreatableSelect 
                options={annotators} 
                label="hi"
                noOptionsMessage={() => null}
                promptTextCreator={() => false}
                formatCreateLabel={() => undefined} />
                <MapSection center={position} zoom={ZOOM_LEVEL} />
                <TwitterCard>Tweets coming from annotator 1</TwitterCard>
            </div>
            <div className="column">
                Annotator: <CreatableSelect 
                options={annotators} 
                noOptionsMessage={() => null}
                promptTextCreator={() => false}
                formatCreateLabel={() => undefined} />
                <MapSection center={position} zoom={ZOOM_LEVEL} />
                <TwitterCard>Tweets coming from annotator 2</TwitterCard>
            </div>
        </div>

    )
}