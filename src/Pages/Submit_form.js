import React, { useEffect, useState } from "react";
import { Card, Form, Button } from "react-bootstrap";
import Highlighter from "react-highlight-colors";
import Creatable from 'react-select/creatable';
import { Leafletmap } from "./leafletmap";
import "rangy/lib/rangy-textrange";
import 'rangy/lib/rangy-highlighter'
import 'rangy/lib/rangy-classapplier'
import Rangy from "rangy";
import './Submit_form.css';
import { ButtonHighlight } from "./ButtonHighlight"
export const Submit_form = () => {
    const [tweet, setTweet] = useState('No Data... Please report to developer')
    const [isloading, setIsloading] = useState(true)
    const [refresh, setRefresh] = useState(0)
    const [category, setCategory] = useState('')
    const [selection, setSelection] = useState([]);
    const [neuroHighlight, setNeuroHighlight] = useState({})
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
        { value: 'C7', label: 'C7:Other human-made' },
        { value: 'C5', label: 'Strawberry' },
        { value: 'vanilla', label: 'Vanilla' }
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
        

    }, [])
    const handleClickRefresh = () => {
        setRefresh(refresh + 1)
        setSelection([])

    }
    // Might need to implement to Rangy Soon
    if (isloading) {
        return <div id="loading"></div>;
    }
    const handleCategory = (e) => {
        setCategory(e.value)
    }
    const handleSubmit = async () => {
        if(!category){
            return null;
        }
        try{
            fetch('/api/submit',{
                method:'POST', 
                body: JSON.stringify({
                    "Hi":"oh no"
                })
            })
        }catch(e){
            console.log(e)
        }
    }


    const handleTextSelection = () => {

        const selection = Rangy.getSelection();
        const highlighter = Rangy.createHighlighter();
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
                        return false;
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
        console.log(neuroHighlight)
        ;
        
        for (var selection_tpr of neuroHighlight) {
            var textNode = tweet_div.childNodes[0]
            range.setStart(textNode, selection_tpr.start_idx);
            range.setEnd(textNode, selection_tpr.end_idx);
            
            const mark = document.createElement('mark');
            range.surroundContents(mark);
            tweet_div.normalize()
            
        }   
    }
    return (
        <>

            <Form>
                {/*First Column*/}
                <div className="row">
                    <div className="column">
                        <Leafletmap onChange={neuroHighlight}/>
                    </div>
                    {/*Second column*/}
                    <div className="column" >
                        {/* Annotator might be removed soon*/}
                        <div className="row">
                            <label>
                                Annotator: <input type="text" />
                            </label>
                        </div>
                        <div className="row">
                            <Card>
                                <Card.Header>{"Please Highlight Tweet Location "}
                                    <i class="fa-brands fa-twitter"></i>
                                </Card.Header>
                                <Card.Body>
                                    {/* <Highlighter text={tweet}
                                        colors={chosenColors}
                                        export={(highlightedtext) => {
                                            setHighlighttext(highlightedtext)
                                        }}
                                        key={refresh} /> */}

                                    <span className="NameWithHandle">
                                        <span className="name">Name</span>
                                        <span className="handle">@HandleName</span>
                                    </span>
                                    <span className="time">3h ago</span>
                                    <p key={refresh} id="tweet">{tweet}</p>

                                </Card.Body>
                            </Card>
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
                            </div>
                        </div>
                        <div className="row">
                            <label>
                                Category: <Creatable options={category_options} onChange={handleCategory} />
                                {Required_comp(category) /*Required to fill in category*/}
                            </label>
                        </div>
                        <Button
                            type='primary'
                            title="Submit Annotation"
                            onClick={handleSubmit}>Submit</Button>
                    </div>
                </div>


            </Form>

        </>
    )
}