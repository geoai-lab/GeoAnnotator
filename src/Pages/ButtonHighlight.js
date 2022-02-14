import React, { useState, useRef, useEffect } from "react";

import L, { geoJSON } from "leaflet"
import { MapContainer, TileLayer, useMap, FeatureGroup } from "react-leaflet";
import osm from "./osm-providers";
import 'leaflet/dist/leaflet.css';
import { EditControl } from "react-leaflet-draw";
import 'leaflet-geosearch/dist/geosearch.css';
import "leaflet-draw/dist/leaflet.draw.css";
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import "./ButtonHighlight.css"
export const ButtonHighlight = () => {
    const selectableTextArea = document.querySelectorAll(".selectable-text-area");
    const twitterShareBtn = document.querySelector("#twitter-share-btn");

    selectableTextArea.forEach(elem => {
        if(elem){
        elem.addEventListener("mouseup", selectableTextAreaMouseUp);
        }
    });
    if(twitterShareBtn){
        twitterShareBtn.addEventListener("click", twitterShareBtnClick);
    }
    document.addEventListener("mousedown", documentMouseDown);

    function selectableTextAreaMouseUp(event) {
        setTimeout(() => { // In order to avoid some weird behavior...
            const selectedText = window.getSelection().toString().trim();
            if (selectedText.length) {
                const x = event.pageX;
                const y = event.pageY;
                const twitterShareBtnWidth = Number(getComputedStyle(twitterShareBtn).width.slice(0, -2));
                const twitterShareBtnHeight = Number(getComputedStyle(twitterShareBtn).height.slice(0, -2));

                if (document.activeElement !== twitterShareBtn) {
                    twitterShareBtn.style.left = `${x - twitterShareBtnWidth * 0.5}px`;
                    twitterShareBtn.style.top = `${y - twitterShareBtnHeight * 1.25}px`;
                    twitterShareBtn.style.display = "block";
                    twitterShareBtn.classList.add("btnEntrance");
                }
                else {
                    twitterShareBtn.style.left = `${x - twitterShareBtnWidth * 0.5}px`;
                    twitterShareBtn.style.top = `${y - twitterShareBtnHeight * 0.5}px`;
                }
            }
        }, 0);
    }

    function documentMouseDown(event) {
        if (event.target.id !== "twitter-share-btn" ) {
            
            twitterShareBtn.style.display = "none";
            twitterShareBtn.classList.remove("btnEntrance");
            window.getSelection().empty();
        }
    }

    function twitterShareBtnClick(event) {
        const selectedText = window.getSelection().toString().trim();
        if (selectedText.length) {
            // General Twitter Share URL: https://twitter.com/intent/tweet?text={title}&url={url}&hashtags={hash_tags}&via={user_id}
            const twitterShareUrl = "https://twitter.com/intent/tweet";
            const text = `${encodeURIComponent(selectedText)}`;
            const currentUrl = encodeURIComponent(window.location.href);
            const hashtags = "helloworld, test, testing";
            const via = "CodingJrney";
            window.open(`${twitterShareUrl}?text="${text}"&url=${currentUrl}&hashtags=${hashtags}&via=${via}`);

            // Alternatively, we could include everything in the "text" field -> more room to customize the tweet:
            // window.open(`${twitterShareUrl}?text="${text}" by @${via} ${hashtags.split(",").map(h => "%23"+h.trim()).join(" ")} ${currentUrl}`);

            // We could also specify new window features:
            // const newWindowOptions = "height=400,width=550,top=0,left=0,resizable=yes,scrollbars=yes";
            // window.open(`${twitterShareUrl}?text="${text}"&url=${currentUrl}&hashtags=${hashtags}&via=${via}`, "ShareOnTwitter", newWindowOptions);
        }
    }
    return (
        <button id="twitter-share-btn"><i class="fab fa-twitter" aria-label="Share on Twitter"></i></button>
    )
};
