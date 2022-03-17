import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Card, Form, Button } from "react-bootstrap";

import Highlighter from "react-highlight-colors";
import Creatable from 'react-select/creatable';
import { Leafletmap } from "./Leafletmap";
import "rangy/lib/rangy-textrange";
import 'rangy/lib/rangy-highlighter'
import 'rangy/lib/rangy-classapplier'
import Rangy from "rangy";
import '../CSS-files/Submit_form.css';
import { TwitterCard } from './TwitterCard';
import { useParams } from "react-router-dom";
import axios from "axios";
export const Submit_form = ({ children }) => {
    const [tweet, setTweet] = useState('No Data... Please report to developer');
    let { projectName } = useParams();
    const [isloading, setIsloading] = useState(true);
    const [refresh, setRefresh] = useState(0);
    const [category, setCategory] = useState('')
    const [highlightSelection, setSelection] = useState([]);
    const [neuroHighlight, setNeuroHighlight] = useState({});
    const [highlighter, setHighlighter] = useState(null);
    const [toggleSubmit, setToggleSubmit] = useState(false);
    const [MaplayersFunction, setMaplayersFunction] = useState();
    const [projectDescription, setProjectDescription] = useState(null);
    const [submitKey, setSubmitKey] = useState(0)
    const [isDeleting, setIsDeleting] = useState(false);
    Rangy.init()
    // helpers


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
        fetch('/api/' + projectName).then(response => {
            if (response.ok) {
                return response.json()
            }
            else {
                alert("failed to grab data");
            }
        }).then(data => {
            console.log(data)
            setTweet(data)
            setIsloading(false)
            setNeuroHighlight(data.neuro_result)
            setProjectDescription({ "label": data.project_description.label, "geo_json": data.project_description.geo_json })
        }
        )

        setHighlighter(Rangy.createHighlighter())
        setSelection([])


    }, [toggleSubmit])
    useEffect(() => {
        var tweet_div = document.getElementById("tweet");
        const range = Rangy.createRange()
        if (!tweet_div) {
            return null;
        }
        var new_index_side = 0
        if (tweet_div.childNodes[1]) {
            console.log(tweet_div.childNodes[1].tagName)
        }
        for (var highlightByAI of neuroHighlight) {
            setSelection(allSelection => [...allSelection, highlightByAI])
        }
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
                console.log(objLocation.start_idx)
                range.setStart(Node, objLocation.start_idx - new_index_side);
                range.setEnd(Node, objLocation.end_idx - new_index_side);
                new_index_side = objLocation.end_idx
                const mark = document.createElement('mark');
                range.surroundContents(mark);
                keyIndex++;
                nodeIndex++;
            }
        }

    }, [neuroHighlight])

    const handleClickRefresh = () => {
        setRefresh(refresh + 1)
        console.log(projectDescription.geo_json)
        setSelection([])

    }
    if (isloading) {
        return null;
    }
    const handleCategory = (e) => {
        setCategory(e.label)
    }
    const handleSubmit = async () => {
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
            url: '/api/' + projectName + '/submit',
            withCredentials: true,
            data: {
                'tweetid': tweet.id,
                'project': projectName, // handle user ID in backend 
                'highlight': highlightSelection,
                'category': category,
                'spatial-footprint': MaplayersFunction,
                'timestamp': new Date().toLocaleString()

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
        setToggleSubmit(data => !data)

    }

    const deleteTextHighlight = () => {
        highlighter.unhighlightSelection();
    }

    const handleTextSelection = () => {
        var tweetdiv = document.getElementById('tweet');
        const selection = Rangy.getSelection(tweetdiv);
        // need to solve the indeces bug 
        highlighter.addClassApplier(
            Rangy.createClassApplier("highlight", {
                ignoreWhiteSpace: true,
                elementTagName: "mark",
                tagNames: ["mark"],
                elementProperties: {
                    p: "#tweet",
                    onclick: function () {

                        var highlight = highlighter.getHighlightForElement(this);
                        console.log(highlight)
                        if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
                            highlighter.removeHighlights([highlight]);
                        }
                        
                        setSelection(highlights => {
                            delete highlights[highlight.id];
                            return highlights;
                        })
                        return highlight.id;
                    }
                }
            })
        );
        var selection_scnd = window.getSelection();
        console.log(selection_scnd.focusNode.data[selection_scnd.focusOffset]);
        alert(selection_scnd.focusOffset);

        var highlight_object = highlighter.highlightSelection("highlight", { containerElementId: "tweet" })[0];
        var start_idx = highlight_object.characterRange.start
        var end_idx = highlight_object.characterRange.end
        console.log(highlight_object)
        setSelection(allSelection => {
            return ({
                ...allSelection,
                [highlight_object.id]: {"location_name":selection.toString(),"start_idx":start_idx, "end_idx":end_idx}
            })
        })
        console.log(highlightSelection);
    };
    const handlePopup = () => {
        var popup = document.getElementById("myPopup2");
        popup.classList.toggle("show");

    }
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
                                    class="learn-more2"
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Highlight Text"
                                    onClick={handleTextSelection}><i className="fa-solid fa-highlighter"></i></Button>
                                <Button
                                    class="learn-more2"
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Delete Highlights"
                                    onClick={handleClickRefresh}><i className="fa-solid fa-arrow-rotate-right"></i></Button>
                            </div>
                        </div>
                        <div className="row">

                            <label className="submit-section">
                                <Creatable options={category_options} onChange={handleCategory} placeholder="Select Category"
                                    id="creatable-submit" />
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



            </Form>

        </>

    )
}