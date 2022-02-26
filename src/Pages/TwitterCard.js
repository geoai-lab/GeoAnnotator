import React from 'react'
import { Link } from 'react-router-dom';
import { Card } from 'react-bootstrap';
import "../CSS-files/TwitterCard.css"
export const TwitterCard = ({ children, key }) => {
  
    return (
        <Card id="tweet-card">
            <Card.Header>{"Please Highlight Tweet Location "}
                <i class="fa-brands fa-twitter"></i>
            </Card.Header>
            <Card.Body>
                <span className="NameWithHandle">
                    <span className="name">Name</span>
                    <span className="handle">@HandleName</span>
                </span>
                <span className="time">3h ago</span>
                <p key={key} id="tweet">{children}</p>

            </Card.Body>
        </Card>
    )
};