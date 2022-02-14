import React, { useState, useRef, useEffect } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
// Once checked double check with saved on database 
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

export const Leafletmap = () => {
    const [position, setPosition] = useState({ lat: 42.8864, lng: -78.8784 });
    const [mapLayers, setMapLayers] = useState({});
    const ZOOM_LEVEL = 12;
    const mapRef = useRef();
    const SearchField = () => {
        const provider = new OpenStreetMapProvider();

        // @ts-ignore
        const searchControl = new GeoSearchControl({
            provider: provider,
            showMarker: false,
            style: 'button'
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
        const id =  layer._leaflet_id 
        const geoJson =  layer.toGeoJSON()
        setMapLayers((prevLayers) => ({
            ...prevLayers, 
            [id]:geoJson
        }));
     
      };
    
    const _onEdit = (e) => {
        const { layerType, layer } = e;
        const layers = e.layers._layers
        if (Object.keys(layers).length == 0){
            return 
        }
        for (const [key, value] of Object.entries(layers)) {
            setMapLayers((prevLayers) => ({
                ...prevLayers, 
                [key]:value.toGeoJSON()
            }));
          }
          
    }
  
    const _onDeleted = (e) => {
        // Returns the deleted polygons
        const { layerType, layer } = e;
        const layers = e.layers._layers
        if (Object.keys(layers).length == 0){
            return 
        }
        for (const [key, value] of Object.entries(layers)) {
            setMapLayers((prevLayers) => ({
                ...prevLayers, 
                [key]:undefined
            }));
          }
       
        
       
    }
    return (
        <>

            <div className="row">
                <div className="col text-center">
                    <h2>Please plot the location</h2>
                    <div className="col">
                        <MapContainer center={position} zoom={ZOOM_LEVEL} ref={mapRef}
                            style={{ height: '50vh', width: '5wh' }}
                            attributionControl={false}>
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
                     
                        <pre className="text-left">{JSON.stringify(mapLayers, 0, 2)}</pre>
                    </div>
                </div>
            </div>
        </>
    )
}
