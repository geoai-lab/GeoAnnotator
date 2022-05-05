import React from 'react';
import '../CSS-files/SelectProject.css';
import { useEffect, useState, useRef } from 'react';
import Popup from 'reactjs-popup';
import { Card } from 'react-bootstrap';
import Select from 'react-select'
import { Button } from 'react-bootstrap';
import $ from 'jquery';
/**
     * Component of the Login/Registration page
     * This component handles a form where the user can either login, or register a new account 
     * @param {setLogin} setFunction id used for the CSS styling of this component object 
     */
export const PopupMessage = () => {
    return (
        <>
            <div class="alert alert-success collapse" id="popupMessageSuccess" style={{ zIndex: 9999, width: "50%", left: "25%", top: "15px", position: "fixed" }}>
                <strong>Success!</strong> <i class="fa-solid fa-circle-check"></i> <p></p>
            </div>
            <div class="alert alert-danger collapse" id="popupMessageDanger" style={{ zIndex: 9999, width: "50%", left: "25%", top: "15px", position: "fixed" }}>
                <i class="fa-solid fa-circle-exclamation"></i> <strong>Error!</strong><p></p>
            </div>
            <div class="alert alert-warning collapse" id="popupMessageWarning" style={{ zIndex: 9999, width: "50%", left: "25%", top: "15px", position: "fixed" }}>
                <i class="fa-solid fa-circle-exclamation"></i> <strong>Warning!</strong><p></p>
                <button id="warningOkButton" type="button" class="btn btn-secondary" style={{ "margin-right": "15px" }}>
                    Yes
                </button>
                <button type="button" class="btn btn-secondary" data-target="popupMessageWarning"
                    onClick={(e) => {
                        e.preventDefault();
                        $("#popupMessageWarning").hide("fade");
                    }}>
                    Cancel
                </button>
            </div>
            <div class="alert alert-primary collapse" id="popupMessagePrimary" style={{ zIndex: 9999, width: "50%", left: "25%", top: "15px", position: "fixed" }}>
                <i class="fa-solid fa-circle-exclamation"></i><strong>Info:</strong><p></p>
                <button type="button" class="btn btn-secondary" data-target="popupMessageWarning"
                    onClick={(e) => {
                        e.preventDefault();
                        $("#popupMessagePrimary").hide("fade");
                    }}
                    style={{ "background-color": "blue" }}>
                    Ok
                </button>
            </div>
        </>
    )
}
