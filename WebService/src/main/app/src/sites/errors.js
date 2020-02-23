import React from 'react';
import NoMatchPic from "../img/PageNotFound.svg"

 export const NoMatch = porps => {
    return(
        <div className="fixHeight">
            <img
                alt=""
                src={NoMatchPic}
                className="noMatchPic center-horz center-vert"
            />
            <div className="noMatchGrad" />
        </div>
    );
};
