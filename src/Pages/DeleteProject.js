import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './Button';
import '../CSS-files/Navbar.css'
import axios from "axios";
import Select from 'react-select'
import { useParams } from "react-router-dom";
import Popup from 'reactjs-popup';
import 'reactjs-popup/dist/index.css';
import * as util from "./Util.js";
import { useNavigate } from "react-router-dom";
/**
     * Component is a popup function that opens if user wants to delete a project
     * @param {string} CurProjectName String that contains the current project name. 
     */
export const DeleteProject = ({ setProjectDeletion,CurProjectName  }) => {
    const [project, setProjects] = useState([]) // contains all of the project names
    const [selectedProjects, setSelectedProjects] = useState() // selected projects that will be deleted
    useEffect(() =>{ 
        // useEffect that detects the selection of projects
        if(selectedProjects){
            var deletingCurProject =  selectedProjects.map(data => data.label).includes(CurProjectName)
            if(deletingCurProject){ // fires if the project you are deleting is the one the user is currently on 
                util.ToggleMessage("warning","You are trying to delete project you are currently on", function(){});
            }
        
        }
       
    }, [CurProjectName, selectedProjects])
    useEffect(() => {
        // useEffect on render, will grab all of the project names from the database 
        fetch('/project+descriptions').then(response => {
            if (response.ok) {
                return response.json()
            }
        }).then(data => {
            var projectList = []
            for (var project of data) {
                projectList.push({ "label": project["project-name"], "value": project["project-name"] })
            }
            setProjects(projectList)
        }
        )
    }, [])
    const onSubmit = () => {
        axios({
            method: "POST",
            url: '/deleteproject',
            withCredentials: true,
                // gives me "2016-03-22 12:00:00 am EDT"
            data: {
               ['projects']: selectedProjects.map(data => data.label)

            }
        }).then( response => {
            if(response.status === 200){
                util.ToggleMessage("success","Project/s Deleted");
            }
        })
    }
    return (
        <>
            <div class="modal fade" id="deleteModal" tabindex="-1" role="dialog" aria-labelledby="deleteModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="deleteModalLabel">Delete Projects</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <Select
                                isMulti
                                id="selectBar"
                                className="basic-multi-select"
                                options={project}
                                onChange={(e) => setSelectedProjects(e)}
                                placeholder="Select.." />

                        </div>
                        <div class="modal-footer">
                            <Button id="delete-submission" class="btn mt-3" data-dismiss="modal" aria-label="Close"
                                onClick={(e) => {
                                    e.preventDefault(); 
                                    onSubmit();
                                    return (null);
                                }}>Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

