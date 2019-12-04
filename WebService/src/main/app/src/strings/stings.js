import {strings as stringsDe} from "./de_strings";
import {strings as stringsEn} from "./en_strings"
export default class StringSelector {

    static getString( language ) {
        if ( language === 0 )
        {
            return stringsDe
        }
        else {
            return stringsEn
        }
    }
}