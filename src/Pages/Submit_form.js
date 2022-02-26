import React, { useEffect, useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { Popup } from "./Popup"
import Highlighter from "react-highlight-colors";
import Creatable from 'react-select/creatable';
import { Leafletmap } from "./leafletmap";
import "rangy/lib/rangy-textrange";
import 'rangy/lib/rangy-highlighter'
import 'rangy/lib/rangy-classapplier'
import Rangy from "rangy";
import './Submit_form.css';
import { TwitterCard } from './TwitterCard';

export const Submit_form = () => {
    const [tweet, setTweet] = useState('No Data... Please report to developer')
    const [isloading, setIsloading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [category, setCategory] = useState('')
    const [selection, setSelection] = useState([]);
    const [neuroHighlight, setNeuroHighlight] = useState({})
    const [highlighter, setHighlighter] = useState(null)
   
  
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
        fetch('/api').then(response => {
            if (response.ok) {
                return response.json()
            }
        }).then(data => {
            setTweet(data.content)
            setIsloading(false)
            setNeuroHighlight(data.neuro_result)
            console.log(data.id)
        }
        )
       
        Rangy.init();
        setHighlighter(Rangy.createHighlighter())
        


    }, [])
    const handleClickRefresh = () => {
        setRefresh(refresh + 1)
        setSelection([])

    }
    // Might need to implement to Rangy Soon
    if (isloading) {
        return null;
    }
    const handleCategory = (e) => {
        setCategory(e.value)
    }
    const handleSubmit = async () => {
        if (!category) {
            return null;
        }
        try {
            fetch('/api/submit', {
                method: 'POST',
                body: JSON.stringify({
                    "Hi": "oh no"
                })
            })
        } catch (e) {
            console.log(e)
        }
    }

    const deleteTextHighlight = () => {

        highlighter.unhighlightSelection();

    }
    

    const handleTextSelection = () => {

        const selection = Rangy.getSelection();

        highlighter.addClassApplier(
            Rangy.createClassApplier("highlight", {
                ignoreWhiteSpace: true,
                elementTagName: "mark",
                tagNames: ["mark"],
                elementProperties: {
                    href: "#",
                    onclick: function () {
                        
                        var highlight = highlighter.getHighlightForElement(this);
                        if (window.confirm("Delete this note (ID " + highlight.id + ")?")) {
                            highlighter.removeHighlights([highlight]);
                        }
                        return null;
                    }
                }
            })
        );
        selection.expand("word", { containerElementId: "tweet" });
        highlighter.highlightSelection("highlight", { containerElementId: "tweet" });


        setSelection(allSelection => [...allSelection, selection.toString()])
    };

    const handleAIToggle = () => {
        // clicking again is not handled 
        const range = Rangy.createRange()
        var tweet_div = document.getElementById("tweet");
        // need to make this a toggle on or off 
        var new_index_side = 0
        if (tweet_div.childNodes[1]) {
            console.log(tweet_div.childNodes[1].tagName)
        }
        console.log(neuroHighlight)


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

    }
    return (
        <>


            <Form>
            
                {/*First Column*/}
                <div className="row">
                    <div className="column1">
                        <Leafletmap onChange={neuroHighlight} />
                    </div>
                    {/*Second column*/}
                    <div className="column2" >
                        {/* Annotator might be removed soon*/}
                        <div className="row">
                            <label>
                                Annotator: <input type="text" />
                            </label>
                        </div>
                        <div className="row">
                            <TwitterCard key={refresh}>{tweet}</TwitterCard> 
                            <div>
                                <Button
                                    class="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Highlight Text"
                                    onClick={handleTextSelection}><i class="fa-solid fa-highlighter"></i></Button>
                                <Button
                                    class="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Delete Highlights"
                                    onClick={handleClickRefresh}><i class="fa-solid fa-arrow-rotate-right"></i></Button>
                                <Button
                                    class="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Show Ai Highlights"
                                    onClick={handleAIToggle}><i class="fa-solid fa-brain"></i></Button>
                                <Button
                                    class="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Show Ai Highlights"
                                    onClick={deleteTextHighlight}><i class="fa-solid fa-arrow"></i></Button>

                            </div>
                        </div>
                        <div className="row">
                            <label>
                                Category: <Creatable options={category_options} onChange={handleCategory} />
                                {Required_comp(category) /*Required to fill in category*/}
                            </label>
                        </div>
                        <Button
                            id="submit-button"
                            type='primary'
                            title="Submit Annotation"
                            onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>


            </Form>

        </>
    )
}