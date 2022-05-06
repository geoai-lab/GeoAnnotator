import React, { Component } from 'react'
import gsap from "gsap";
import TweenLite from 'gsap'
import "../CSS-files/Home.css"
import homepageimg from "./homepagepictures.PNG"
import sponsors from "./sponsors.PNG"
/**
     * Component for the / path of the application. 
     * Contains simple description of the web application 
     * @requires {user to be logged-in}
     */
function Home() {
    return (

        <>
          <div class="row" id="landing-page">
              <h1>
              GeoAI for Location Understanding and Extraction (GLUE)
              </h1>
              <h2>
              Understanding and extracting location descriptions on social media during natural disasters
              </h2>
          </div>
          <div class="row" id="landing-img">
            <img src={homepageimg} alt="nsf"/>
          </div>
          <div class="row" style={{"padding":"40px"}}>
            <h2 style={{float:"left"}}>
                <strong>About GLUE</strong>
            </h2>
            <p>
            GeoAI for Location Understanding and Extraction (GLUE) is a project funded by the National Science Foundation (NSF). The objective of this project is to understand how people describe locations on social media during natural disasters. Social media platforms, such as Twitter, are increasingly being used by people impacted by natural disasters. Descriptions about the locations of victims and accidents are often contained in help-seeking messages posted on these platforms. However, a limited understanding exists of how locations are described on social media during natural disasters, which hinders their automatic extraction via GeoAI tools. This project aims to fill such a knowledge gap. The project outcomes can inform future disaster response practices to help save lives and reduce inequality in response efforts.
            </p>
          </div>
          <div class="row" id="sponsors-img">
            <img src={sponsors} alt="sponsors"/>
          </div>
        </>
    );
}

export default Home;