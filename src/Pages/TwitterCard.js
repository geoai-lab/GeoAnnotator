import React from 'react'
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import "../CSS-files/TwitterCard.css"
export const TwitterCard = ({ children, uniqueKey, id , key, title, tweet_id}) => {
  
    return (
        <Card key={key? key: "1" } id={id ? id : "tweet-card"}>
            <h6 id="card-header-twitter"
                style={{"margin-bottom":"30px"}}>{title? title: "Please Annotate Location Descriptions in the Tweet Below"}
                <i className="fa-brands fa-twitter"></i>
            </h6>
            <Card.Body>
              
                <p key={uniqueKey} id={tweet_id ? tweet_id : "tweet"}>{children}</p>

            </Card.Body>
        </Card>
    )
};