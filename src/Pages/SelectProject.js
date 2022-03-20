import React from 'react';
import '../CSS-files/SelectProject.css';
import { useEffect, useState, useRef } from 'react';
import Popup from 'reactjs-popup';
import { Card } from 'react-bootstrap';
import Select from 'react-select'
import { Button } from 'react-bootstrap';
export const SelectProject = ({setChanger, changeOpen, onSubmit,setProjectName}) => {
    const [project, setProjects] = useState([])
    useEffect(()=>{
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
    },[])
    return (
        <>
            <Popup
                open={changeOpen}
                onClose={ () => setChanger(false)}
                modal
                nested
            >
                {close => (
                    <>
                        <button id="exitbutton" onClick={close}>
                            &times;
                        </button>
                        <Card className="modal2">
                            <div className="header"> Select a Project </div>
                            <div className="popup-content">
                                <Select
                                    id="selectBar"
                                    options={project}
                                    onChange={(e) => setProjectName(e.label)}
                                    placeholder="Select.." />
                                <Button id="select-submission" class="btn mt-3"
                                    onClick={() =>{
                                    setChanger(false);
                                    onSubmit(false); 
                                    return(null);
                                    }}>Submit</Button>
                            </div>
                        </Card>
                    </>
                )}
            </Popup>
        </>
    )
}
