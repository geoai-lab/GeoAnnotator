import React from 'react'
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import "../CSS-files/TwitterCard.css";
/**
     * Component of the /api page
     * This component is a twitter card that contains the twitter data that is going to be highlighted 
     * @param {string} id id used for the CSS styling of this component object 
     * @param {string} unqiqueKey key used for unique components 
     * @param {string} title String title that is going to be at the top of the card 
     * @param {string} tweet_id unique id for the string of the tweet
     */
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