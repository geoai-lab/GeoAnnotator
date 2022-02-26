import React, { Component } from 'react'
import { Popup } from "./Popup"
import gsap from "gsap";
import TweenLite from 'gsap'
import "../CSS-files/Home.css"
function Home() {
    window.onload = function () {
        var title = document.getElementById("text");

    }
    return (

        <>

            <div id="text" className="text0">
                GeoAI for Location Understanding and Extraction (GLUE)
            </div>
            <h2><i>Understanding and extracting
                location descriptions on social media
                during natural disasters</i></h2>
            <h1>About GLUE</h1>
            <p>
                GeoAI for Location Understanding and Extraction (GLUE) is
                a project funded by the National Science Foundation (NSF).
                The objective of this project is to understand how
                people describe locations on social media during natural
                disasters. Social media platforms, such as Twitter, are
                increasingly being used by people impacted by natural disasters.
                Descriptions about the locations of victims and accidents are often
                contained in help-seeking messages posted on these platforms. However,
                a limited understanding exists of how locations are described on social
                media during natural disasters, which hinders their automatic extraction via
                GeoAI tools. This project aims to fill such a knowledge gap. The project
                outcomes can inform future disaster response practices to help save lives
                and reduce inequality in response efforts.
            </p>

        </>
    );
}

export default Home;