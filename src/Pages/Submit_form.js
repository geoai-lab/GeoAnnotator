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
import * as util from "./Util.js";
import { TableContent } from "./TableContent";
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
    const [waitingForData, setWaitingForData] = useState(true);
    const [colorList, setColorList] = useState(["brown","orange","yellow","green","blue","indigo","violet","purple","pink","red"])
    var params = useParams();
    Rangy.init();
    const highlighter = Rangy.createHighlighter(); 
    const Applier = Rangy.createClassApplier("highlight", {
        ignoreWhiteSpace: true,
        elementTagName: "mark",
        tagNames: ["mark"],
        onElementCreate: function (elem, classApplier){
            setColorList(colors => {
                elem.style.backgroundColor = colors.pop();
                return colors; 
            })
            
            
            // need to delete if there is intersection
        },
        elementProperties: {
            p: "#tweet"
        }
    })
    highlighter.addClassApplier(
        Applier
    );

   
    useEffect(() => {
        console.log("REPEARING HERE")
        setWaitingForData(true);
        setRefresh(data => data +1);
        setCategory(null);
        var linktograb = params.tweetid ? params.tweetid : 'any'
        fetch('/api-grab/' + linktograb).then(response => {
            if (response.ok) { 
                return response.json(); 
            }
            else {
                alert("failed to grab data");
            }
        }).then(data => {
            // if(data.id == tweet.id){
            //     setToggleSubmit(data => data+1); // reload again
            // }
            console.log(data)
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
                range.setStart(Node, objLocation.startIdx - new_index_side);
                range.setEnd(Node, objLocation.endIdx - new_index_side);
                new_index_side = objLocation.endIdx
                var highlight_object = highlighter.highlightRanges("highlight", [range],{ containerElementId: "tweet" })[0]
                highlight_object.characterRange.end = objLocation.endIdx;
                highlight_object.characterRange.start = objLocation.startIdx;
                keyIndex++;
                nodeIndex++;
            }
        }
    
        

    }, [neuroHighlight])

    const handleClickRefresh = () => {
        setRefresh(refresh + 1)
        setSelection([])

    }
    if (isloading) {
        return null;
    }
   
    const handleSubmit = async () => {
        params.tweetid = 'any';
        if (!category) {
            util.ToggleMessage("error","You did not choose any category");
            return null;
        }
        if(MaplayersFunction === null){
            util.ToggleMessage("error","You do not have any map drawing/polygon");
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
        }).then((response) => {
                if (response.status == 200) {
                    util.ToggleMessage("success","Successful Submission!",function(){}, 1000);
                    setToggleSubmit(data => data + 1 )
                }

            }).catch((error) => {
                if (error.response.status == 500) {
                    alert("submission failed");
                }
                else if(error.response === 409){
                    alert("submission failed");
                }

            })
      

    }

    const handleTextSelection = () => {
        var tweetdiv = document.getElementById('tweet');
        const selection = Rangy.getSelection(tweetdiv);
        const ranges = selection.getAllRanges();
       
        // need to solve the indeces bug 
        var intersection = highlighter.getIntersectingHighlights(ranges);
        var highlight_object = highlighter.highlightSelection("highlight", { containerElementId: "tweet" })[0];
        var start_idx = highlight_object.characterRange.start
        var end_idx = highlight_object.characterRange.end
        setSelection(allSelection => {
            return ({
                ...allSelection,
                [highlight_object.id]: { "location_name": selection.toString(), "start_idx": start_idx, "end_idx": end_idx }
            })
        })
     
        console.log(highlightSelection);
    };
  
    return (
        <>
          
            <Form>

                {/*First Column*/}
                <div className="row">
                    <div className="column1">
                        {!isloading && projectDescription && <Leafletmap id="annotate-map" onChange={neuroHighlight} searchBar={true} drawings={true} editControl={true} setMaplayersFunction={setMaplayersFunction}
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
                                    style={{"margin-right":"60px"}}
                                    onClick={handleTextSelection}><i className="fa-solid fa-highlighter"></i></Button>
                                <Button
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Delete Highlights"
                                    onClick={handleClickRefresh}><i class="fa-solid fa-trash-can"></i></Button>
                            </div>
                        </div>
                        <div className="row" style={{"padding-top":"20px"}}>
                            <div className="col" style={{"padding-right":"50px"}}>
                                <label className="submit-section">
                                    <TableContent />
                                </label>
                            </div>
                            <div className="col" id="popup2">
                                <button
                                    class="button-19" role="button"
                                    type='button'
                                    id="submitbutton-annotate"
                                    title="Submit Annotation"
                                    onClick={handleSubmit}>Submit</button>
                            </div>
                        </div>

                    </div>
                </div>



            </Form>
            {waitingForData && <Loading />}
        </>

    )
}