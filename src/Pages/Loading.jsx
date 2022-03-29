import React from 'react'
import "../CSS-files/Loading.css"
export const Loading = ({id}) => {
  return (
    <>
                <div id={id? id : "loading-id"} className="row" style={{"z-index": 99999999999999}}>
                    <div className="d-flex justify-content-center">
                        <div className='form-group col-md-12'>
                            <div className="windows8">
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
