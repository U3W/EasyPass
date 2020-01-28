import Radium, {StyleRoot} from "radium";
import * as React from "react";
import {fadeOut} from "react-animations";

const styles = {
    start: {
        animation: 'x 0.5s',
        animationName: Radium.keyframes(fadeOut, 'fadeOut')
    }
};
/**
 * @param loading: When false, the animation is triggered
 */
export default class FadeOutGradient extends React.Component {
    render() {
        if ( !this.props.loading ) {
            return (
                <StyleRoot className="matchParent">
                    <div className="gradientDivWhite" style={styles.start}/>
                    <div className="gradientDiv" style={styles.start}/>
                    <div className="gradientDiv" style={styles.start}/>
                </StyleRoot>
            );
        }
        return "";
    }

}