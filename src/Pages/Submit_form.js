import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Card, Form, Button } from "react-bootstrap";

import Creatable from 'react-select/creatable';
import { Leafletmap } from "./Leafletmap";
import "rangy/lib/rangy-textrange";
import 'rangy/lib/rangy-highlighter';
import 'rangy/lib/rangy-classapplier';
import Rangy from "rangy";
import '../CSS-files/Submit_form.css';
import { TwitterCard } from './TwitterCard';
import { useParams } from "react-router-dom";
import axios from "axios";
import Loading from "./Loading";
import moment from "moment-timezone";
export const Submit_form = ({ children }) => {
    const [tweet, setTweet] = useState('No Data... Please report to developer');
    const [isloading, setIsloading] = useState(true);
    const [refresh, setRefresh] = useState(0);
    const [category, setCategory] = useState('')
    const [highlightSelection, setSelection] = useState([]);
    const [neuroHighlight, setNeuroHighlight] = useState({});
  
    const [toggleSubmit, setToggleSubmit] = useState(1);
    const [MaplayersFunction, setMaplayersFunction] = useState();
    const [projectDescription, setProjectDescription] = useState(null);
    const [submitKey, setSubmitKey] = useState(0)
    const [waitingForData, setWaitingForData] = useState(true);
    const [markKeyIdentifier, setMarkKeyIdentifier] = useState(1);
    const [highlightObjects, setHighlightObjects] = useState({}); 
    var params = useParams();
    const memoizedValue = () => highlightObjects;
    Rangy.init();
    const highlighter = Rangy.createHighlighter(); 
    const Applier = Rangy.createClassApplier("highlight", {
        ignoreWhiteSpace: true,
        elementTagName: "mark",
        tagNames: ["mark"],
        onElementCreate: function (elem, classApplier){
            setMarkKeyIdentifier(data => data +1);
            // need to delete if there is intersection
        },
        elementAttributes:{
            key:markKeyIdentifier
        },
        elementProperties: {
            p: "#tweet",
            onclick: function (eventObj) {
                const keyIdentifier = this.getAttribute("key"); 
                var LatestHighlightobjects = null;
                setHighlightObjects(data=> {
                    LatestHighlightobjects = data;
                    return(data);
                })
                console.log("EVERYTHING BELOW");
                console.log(LatestHighlightobjects)
                console.log("ABOVE")
                var highlight = LatestHighlightobjects[keyIdentifier];
                console.log(highlight);
                console.log( highlighter.removeHighlights([highlight]))
                if (window.confirm("Delete this Highlight?")) {
                    highlighter.removeHighlights([highlight]);
                    setSelection(highlights => {
                        delete highlights[highlight.id];
                        return highlights;
                    })
                    console.log(Selection);
                }
            
                return highlight;
            }
        }
    })
    highlighter.addClassApplier(
        Applier
    );

   
    const Required_comp = (value) => <input
        tabIndex={-1}
        autoComplete="off"
        style={{ opacity: 0, height: 0 }}
        onChange={handleCategory}
        value={value}
        required
    />
    const category_options = [
        { value: 'C1', label: 'C1:House number addresses' },
        { value: 'C2', label: 'C2: Street names' },
        { value: 'C3', label: 'C3: Highways' },
        { value: 'C4', label: "C4: Exits of highways" },
        { value: 'C5', label: "C5: Intersection of roads (rivers)" },
        { value: 'C6', label: "C6: Natural features" },
        { value: 'C7', label: "C7: Other human-made features" },
        { value: 'C8', label: "C8: Local Organizations" },
        { value: 'C9', label: "C9: Admin units" },
        { value: 'C10', label: "C10: Multiple-areas" }
    ]
    useEffect(() => {
        setMarkKeyIdentifier(1);
        setWaitingForData(true);
       // setHighlightObjects({});
        setRefresh(data => data +1);
        setCategory(null);
        var linktograb = params.tweetid ? params.tweetid : 'any'
        fetch('/api/' + linktograb).then(response => {
            if (response.ok) { 
                return response.json(); 
            }
            else {
                alert("failed to grab data");
            }
        }).then(data => {
            if(data.id == tweet.id){
                setToggleSubmit(data => data+1); // reload again
            }
            setTweet(data)
            setWaitingForData(false);
            setIsloading(false)
            setNeuroHighlight(data.neuro_result)
            setProjectDescription({ "label": data.project_description.label, "geo_json": data.project_description.geo_json })
        }
        )

       
        setSelection([])

        
    }, [toggleSubmit])
    useEffect(() => {
       
        if(!neuroHighlight){
            return;
        }
        var tweet_div = document.getElementById("tweet");
        //const range = Rangy.createRange()
        if (!tweet_div) {
            return null;
        }
        var new_index_side = 0
        if (tweet_div.childNodes[1]) {
            console.log(tweet_div.childNodes[1].tagName)
        }
        var neuroDict = {};
        var neuroId = 1
        for (var highlightByAI of neuroHighlight) {
            neuroDict[neuroId] = highlightByAI;
            neuroId = neuroId + 1;
        }
        setSelection(neuroDict);
        var range = Rangy.createRange(tweet_div)
        var keys = Object.keys(neuroHighlight)
        var new_index_side = 0
        var ObjectToAdd = {}
        for (var [nodeIndex, keyIndex] = [0, 0]; keyIndex < keys.length;) {
            var Node = tweet_div.childNodes[nodeIndex]
            if (!Node) {
                break
            }
            else if (Node.tagName == 'MARK') {
                nodeIndex++;
                continue;
            } else {
                var objLocation = neuroHighlight[keys[keyIndex]]
                range.setStart(Node, objLocation.start_idx - new_index_side);
                range.setEnd(Node, objLocation.end_idx - new_index_side);
                new_index_side = objLocation.end_idx
                var charRange =  highlighter
         
                var highlight_object = highlighter.highlightRanges("highlight", [range],{ containerElementId: "tweet" })[0]
                highlight_object.characterRange.end = objLocation.end_idx;
                highlight_object.characterRange.start = objLocation.start_idx;
                ObjectToAdd[keyIndex+1] = highlight_object;
                //range.surroundContents(mark);
                keyIndex++;
                nodeIndex++;
            }
        }
       
        setHighlightObjects(ObjectToAdd);
        
        

    }, [neuroHighlight])

    const handleClickRefresh = () => {
        setRefresh(refresh + 1)
        setSelection([])

    }
    if (isloading) {
        return null;
    }
    const handleCategory = (e) => {
        console.log(tweet);
        setCategory(e.label)
    }
    const handleSubmit = async () => {
        setToggleSubmit(data => data + 1 )
        params.tweetid = 'any';
        var popup = document.getElementById("myPopup2");
        popup.classList.toggle("show");
        
        setTimeout(function () {
            popup.classList.toggle("show");
        }, 1000)
        if (!category) {
            return null;
        }
        axios({
            method: "POST",
            url: '/api/submit',
            withCredentials: true,
                // gives me "2016-03-22 12:00:00 am EDT"
            data: {
                'tweetid': tweet.id, // handle user ID in backend 
                'highlight': highlightSelection,
                'category': category,
                'spatial-footprint': Object.keys(MaplayersFunction).map( key => key == -1? MaplayersFunction[-1] : MaplayersFunction[key].toGeoJSON()),
                'timestamp': moment().tz("America/New_York").format("YYYY-MM-DD hh:mm:ss a z")

            }
        })
            .then((response) => {
                if (response.status == 200) {

                }

            }).catch((error) => {
                if (error.response.status == 500) {

                    alert("submission failed")
                }

            })
      

    }

    const handleTextSelection = () => {
        var tweetdiv = document.getElementById('tweet');
        const selection = Rangy.getSelection(tweetdiv);
        // need to solve the indeces bug 
       
        var highlight_object = highlighter.highlightSelection("highlight", { containerElementId: "tweet" })[0];
        var start_idx = highlight_object.characterRange.start
        var end_idx = highlight_object.characterRange.end
        setSelection(allSelection => {
            return ({
                ...allSelection,
                [markKeyIdentifier]: { "location_name": selection.toString(), "start_idx": start_idx, "end_idx": end_idx }
            })
        })
        setHighlightObjects(allHighlights => {
            return({
                ...allHighlights, 
                [markKeyIdentifier]:highlight_object
            });
        })
        setMarkKeyIdentifier(key => key+1);
        console.log(highlightSelection);
    };
  
    return (
        <>
          
            <Form>

                {/*First Column*/}
                <div className="row">
                    <div className="column1">
                        {!isloading && projectDescription && <Leafletmap id="annotate-map" onChange={neuroHighlight} searchBar={true} drawings={true} setMaplayersFunction={setMaplayersFunction}
                            geojson={projectDescription.geo_json} />}
                    </div>

                    {/*Second column*/}
                    <div className="column2" >
                        <div className="row" id="tweetsection">
                            <TwitterCard uniqueKey={refresh}>{tweet.content}</TwitterCard>
                            <div id="submitbuttonsection">
                                <Button
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Highlight Text"
                                    onClick={handleTextSelection}><i className="fa-solid fa-highlighter"></i></Button>
                                <Button
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Delete Highlights"
                                    onClick={handleClickRefresh}><i className="fa-solid fa-arrow-rotate-right"></i></Button>
                            </div>



                        </div>
                        <div>
                            <div className="row">

                                <label className="submit-section">
                                    <Creatable options={category_options} onChange={handleCategory}
                                        placeholder="Select Category"
                                        id="creatable-submit"
                                        value={ category ? {"label":category} : null}
                                        maxMenuHeight={180} />
                                    {Required_comp(category) /*Required to fill in category*/}
                                </label>

                            </div>

                            <div className="popup2" key={submitKey}>
                                <span className="popuptext2" id="myPopup2">Submitted!</span>
                                <button
                                    class="learn-more"
                                    type='button'
                                    id="submitbutton-annotate"
                                    title="Submit Annotation"
                                    onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>

                    </div>
                </div>



            </Form>
            {waitingForData && <Loading/>}
        </>

    )
}