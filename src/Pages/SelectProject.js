import React from 'react';
import '../CSS-files/SelectProject.css';
import { useEffect, useState, useRef } from 'react';
import Popup from 'reactjs-popup';
import { Card } from 'react-bootstrap';
import Select from 'react-select'
import { Button } from 'react-bootstrap';
/**
     * Component of the Login/Registration page
     * This component handles a form where the user can either login, or register a new account 
     * @param {setLogin} setFunction id used for the CSS styling of this component object 
     */
export const SelectProject = ({id, addCreate, onSubmit, setProjectName, }) => {
    const [project, setProjects] = useState([])
    useEffect(() => {
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
    return (
        <>
                <h1>{addCreate}</h1>
            <div class="modal fade" id={id ? id : "exampleModal"} tabindex="-1" role="dialog" aria-labelledby="ModalLabel" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="ModalLabel">Select a Project</h5>
                            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                <span aria-hidden="true">&times;</span>
                            </button>
                        </div>
                        <div class="modal-body">
                            <Select
                                id="selectBar"
                                options={project}
                                onChange={(e) => setProjectName(e.label)}
                                placeholder="Select.." />

                        </div>
                        <div class="modal-footer">
                            <Button id="select-submission" class="btn mt-3" data-dismiss="modal"
                                onClick={() => {
                                    onSubmit(false);
                                    return (null);
                                }}>Submit</Button>
                    
                            <Button id="select-submission" class="btn mt-3" data-dismiss="modal"
                                onClick={() => {
                                    onSubmit(true);
                                    return (null);
                                }}>Create a Project</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
