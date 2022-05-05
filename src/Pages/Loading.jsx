import React from 'react'
import "../CSS-files/Loading.css"
/**
     * Component of the loading 
     * This component handles an html object when to show the user a loading screen 
     * @param {string} id used for the CSS styling of this component object 
     */
export const Loading = ({id}) => {
  return (
    <>
                <div id={id? id : "loading-id"} className="row" style={{"z-index": 500}}>
                    <div className="d-flex justify-content-center"  style={{"z-index": 500}}>
                        <div className='form-group col-md-12' style={{"z-index": 500}}>
                            <div className="windows8" style={{"z-index": 500}}>
                                <div className="wBall" id="wBall_1">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_2">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_3">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_4">
                                    <div className="wInnerBall"></div>
                                </div>
                                <div className="wBall" id="wBall_5">
                                    <div className="wInnerBall"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
  )
}
export default Loading;
