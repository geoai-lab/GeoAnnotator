import React, { useCallback, useEffect, useState, useMemo } from "react";
import { Card, Form, Button } from "react-bootstrap";
import { Popup } from "./Popup"
import Highlighter from "react-highlight-colors";
import Creatable from 'react-select/creatable';
import { Leafletmap } from "./Leafletmap";
import "rangy/lib/rangy-textrange";
import 'rangy/lib/rangy-highlighter'
import 'rangy/lib/rangy-classapplier'
import Rangy from "rangy";
import '../CSS-files/Submit_form.css';
import { TwitterCard } from './TwitterCard';

export const Submit_form = () => {
    const [tweet, setTweet] = useState('No Data... Please report to developer')
    const [isloading, setIsloading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [category, setCategory] = useState('')
    const [selection, setSelection] = useState([]);
    const [neuroHighlight, setNeuroHighlight] = useState({})
    const [highlighter, setHighlighter] = useState(null)
    const [toggleSubmit, setToggleSubmit]= useState(false)
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
        fetch('/api').then(response => {
            if (response.ok) {
                return response.json()
            }
        }).then(data => {
            setTweet(data.content)
            setIsloading(false)
            setNeuroHighlight(data.neuro_result)
          
        }
        )
       
        console.log("went thru")
        setHighlighter(Rangy.createHighlighter())
        
        

    }, [toggleSubmit])
    const AIToggle = useMemo( () => {
        
      
        var tweet_div = document.getElementById("tweet");
        const range = Rangy.createRange()
        if(!tweet_div){ // check if the div exists
            return null; 
        }
       
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
    }, [neuroHighlight])
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
        setToggleSubmit(data => !data)

        
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
   
    
    return (
        <>


            <Form>
            
                {/*First Column*/}
                <div className="row">
                    <div className="column1">
                        <Leafletmap id="annotate-map" onChange={neuroHighlight} searchBar={true} drawings={true}/>
                    </div>
                    
                    {/*Second column*/}
                    <div className="column2" >
                        
                        <div className="row">
                            <TwitterCard uniqueKey={refresh}>{tweet}</TwitterCard> 
                            {AIToggle}
                            <div>
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
                                
                                <Button
                                    className="btn btn-secondary btn-floating"
                                    type='button'
                                    title="Show Ai Highlights"
                                    onClick={deleteTextHighlight}><i className="fa-solid fa-arrow"></i></Button>

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
                            type='button'
                            title="Submit Annotation"
                            onClick={handleSubmit}>Submit</Button>
                        
                    </div>
                </div>


            </Form>

        </>
    )
}