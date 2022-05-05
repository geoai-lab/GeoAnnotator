import Creatable from 'react-select/creatable';
import { Card, Form, Button } from "react-bootstrap";
import React, { useCallback, useEffect, useState, useMemo } from "react";
/**
     * Component of the /api page table content 
     * This component contains location descriptions of a certain highlight 
     */
export const TableContent = ({ locationDesc, tweet, spatialFootPrint }) => {
    const [category, setCategory] = useState(); 
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
    const handleCategory = (e) => {
        setCategory(e.label)
    }
    function truncate(str, n){
        return (str.length > n) ? str.substr(0, n-1) + '...' : str;
      };
    return (
        <>
            <div className="container">
                <table class="table" style={{"transition":"all .3s ease-in"}}>
                    <tbody>
                        <tr>
                            <th scope="row">Location Desc</th>
                            <td>{tweet}</td>
                            <td key="3"><a class="btn btn-secondary" type="button" key="5" onClick={(e) =>{
                                e.preventDefault();
                            }}>Edit..</a></td>
                        </tr>
                        <tr>
                            <th scope="row">Category</th>
                            <td colSpan="2">
                            <Creatable options={category_options} onChange={handleCategory}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        console.log("HEIRE")
                                    }}
                                    id="creatable-submit"
                                    value={category ? { "label": category } : null}
                                    maxMenuHeight={180} />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">Spatial Footprint</th>
                            <td>{truncate("skdjalsknfjkfnsgkjdangjskgnjkdngjksgn", 10)}</td>
                            <td><a class="btn btn-secondary" type="button" key="6" onClick={(e) =>{
                                e.preventDefault(); 
                            }}>Edit..</a></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </>
    )
}
export default TableContent;
