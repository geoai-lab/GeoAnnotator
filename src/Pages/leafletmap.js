import React, { useState, useRef, useEffect } from "react";

import L from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup} from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import { Card } from 'react-bootstrap';
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import "../CSS-files/leafletmap.css"
import AsyncSelect from 'react-select/async';
import Popup from 'reactjs-popup';
import Loading from "./Loading";
import "../CSS-files/Login.css"
import * as util from './Util.js';
import $ from "jquery";
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
     * Component for the /api-grab, /compare, /createproject paths of the application. 
     * This component is an updated version of a react-leaflet leaflet map. Handles all of a map's requirements from a web application.
     * @param {string} id id used for the CSS styling of this component object 
     * @param {json} onChange - This parameter contains the location description data required to zoom into a place and draw polygons on the map.
     * @param {GeoJson} geojson - If this parameter exists, then this polygon should be included to the map. This option is currently only used in the new project part, where you may input geojson data from the states section.
     * @param {boolean} searchBar - If this argument is true, a search bar will be added to the map. The nominatim data on the GeoAI lab servers is used by the search bar to return nominatim data.
     * @param {boolean} drawings - If this argument is true, then allow the user to draw on the map. If not, it does not allow user to draw on the map
     * @param {function} setMaplayersFunction - setFunction that is used to update the state of the current setterFunction. The polygons on the current leafletmap object are the values that are updated.
     * @param {booolean} editControl - If this argument is true, then show an edit control feature on the map where user can draw, edit, create, and delete polygons. Else if argument is false, the initialization of this component will not contian any editControl object 
     * @param {function} setCurrentLocationDescription - this implementation is not finished. Initially, this is planned to contain data of location descriptions to differentiate polygons by location descriptions/colors
     * @param {boolean} noRepeat - if this function is true, then each time a new polygon appears on this component, the old ones get removes. Therefore, you will only see one instance of a drawing in this component if the argument is true.
     */
export const Leafletmap = ({ children, id, onChange, geojson, searchBar, drawings, setMaplayersFunction, editControl, setCurrentLocationDescription, noRepeat }) => {
    
    const [position, setPosition] = useState({ lat: 39.7837304, lng: -100.445882 }); // initial position of the map when no data is given 
    const [mapLayers, setMapLayers] = useState({}); //  would keep the existing mapLayers (i.g. polygons and drawings that the user input, and not the data it recieved)
    const [isloading, setIsloading] = useState(true); // State object to determine whether to show a loading bar to the user. I.G. setIsLoading(true) when this component is waiting on data to be recieved
    const [locationTitle, setLocationTitle] = useState(''); // State object that would contain the current location of the component is zoomed at i.g. setLocationTitle("Buffalo New York"), and locationTitle will be used for the title of this component
    const [SearchText, setSearchText] = useState(""); // state object that will contain values in the search bar
    const [geojsonLayer, setGeojsonLayer] = useState(null); // The red contour of the polygon will be stored in a state object. In essence, the data contained in this state would be shown as a red outline polygon on the map. Contains mostly project geojson and/or US states GeoJson
    const [map, setMap] = useState(null); // State object for leaflet map object 
    const [geojsonTag, setGeojsonTag] = useState(null); // State object that essentially should contian the polygons returned by the search bar 
    const [selectGeojson, setSelectGeojson] = useState(); // If a user clicks on a polygon, this state object should that polygon object.
    const [changeOpen, setChangeOpen] = useState(false); // Would open a modal for the user to ask if they want to edit the said polygon, or delete it. 
    const [editing, setEditing] = useState(false); // If changeOpen == true, then this state object determines whether the user is currently editing the polygon or not. 
    var drawingControls; // would contain the drawingControls on initialization of EditControl of the Leaflet MapObject 
    const ZOOM_LEVEL = 4; // current zoom level of this object on initialization
    const mapRef = useRef(); // Map Reference
    useEffect(() => { // useEffect to update the leafletmap's data 
        if (searchBar && onChange) { // when there is a search bar and there is tweet data 
            if (mapLayers) { // if polygons exist inside the component, then delete the current polgons and their respective data
                setMapLayers(layers => {
                    Object.keys(layers).map(key => map.removeLayer(layers[key]));
                    return null;
                });
            }
            var location_total = ""
            if (Object.keys(onChange).length !== 0) { // if the tweet data, contains prediction/location description, then add up all of the prediction data onto one string and use that in the search bar to search the right polygon and lat/long using the nominatim at the GEOAI servers.
                for (var predicted of onChange) {
                    location_total = location_total + predicted.locationDesc + " "
                }
            }
            setSearchText(location_total); // the new location is inside the searchText (one that handles what goes inside the search bar)
            var res_api = fetchData(location_total).then(data => { // using the GEOAI nominatim instance, search for the values of location_total(contains location description)
                    setLocations(data);
                    setIsloading(false);
                    if (data[0] && map) {
                        setGeojsonTag(data[0].geometry)
                    }
                })

            return () => clearTimeout(res_api)

        } else if (searchBar && !onChange) { // only occurs during when drawing on /createproject
            setIsloading(false)
        }
        else { // only occurs when selecting states on /createproject 
            setIsloading(false);
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
            })
            layer.addTo(map)
            if(noRepeat){
                if(Object.keys(mapLayers).length > 0){
                    setMapLayers(data => {
                        map.removeLayer(data['-1']);
                    })
                }
                setMapLayers({"-1":layer})
            }
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
            const data = await fetch(response_string).then(response => response.json()).then(data => data.features)
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
        if(!drawings){
            $("a.leaflet-draw-draw-polygon").hide();
        }
        setIsinitial(false)
        const { layerType, layer } = e;
        const id = layer._leaflet_id;
        //const geoJson = layer.toGeoJSON();
        if(setCurrentLocationDescription){
            setCurrentLocationDescription(data => {
                layer.options.color = data.color;
                layer.options.fillColor = data.color;
                return data;
            }); 
        }
        console.log(layer);
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
        setIsinitial(false);
        if(!drawings){
            setTimeout(() => {
                drawingControls.enable();
            },300)
            
        }
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
            util.ToggleMessage("warning","There are still polygons on the screen. This will delete everything. Do you want to continue?",
                function(){
                    setMapLayers(layers => {
                        Object.keys(layers).map(key => map.removeLayer(layers[key]));
                        return null;
                    });
                    setUniqueKey(data => data + 1);
                    setEditing(false);
                    setIsinitial(true);
                    setGeojsonTag(json_value.geojson);
                    setLocationTitle(json_value.label);
                    $("#popupMessageWarning").hide("fade");
                });
          
           
        }else{
            setEditing(false);
            setIsinitial(true);
            setGeojsonTag(json_value.geojson);
            setLocationTitle(json_value.label);
        }


       
    }



    return (
        <>
            <div class="container">
                <div className="row" style={{ "z-index": -55, "height": "0%" }}>
                    <div className="col text-center">
                    
                        <div className='form-group col-md-13'>
                            <div>
                                <MapContainer id={id} center={position} zoom={ZOOM_LEVEL} ref={mapRef}
                                    attributionControl={false} whenCreated={map => {
                                        setMap(map);
                                        LeafletMap = map;
                                        Addgeojson(map, geojson, true);
                                    }}>

                                    <FeatureGroup >
                                        {editControl &&
                                            <EditControl
                                                position="topright"
                                                ref={mapRef}
                                                onCreated={_onCreate}
                                                onEdited={_onEdit}
                                                onDeleted={_onDeleted}
                                                onMounted={(drawControl) => {
                                                 
                                                    if (!drawings) {
                                                        drawingControls = drawControl._toolbars.draw._modes.polygon.handler;
                                                        drawControl._toolbars.draw._modes.polygon.handler.enable();
                                                    }
                                                }}
                                                edit={true}
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
                                                        polygon: true
                                                    }
                                                }

                                            />
                                        }
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
            </div>


        </>
    )
}
