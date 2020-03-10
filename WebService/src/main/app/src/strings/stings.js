import {strings as stringsDe} from "./de_strings";
import {strings as stringsEn} from "./en_strings"
import {dashboardLanguage} from "../sites/dashboard/const/dashboard.enum";
export default class StringSelector {

    static getString( language ) {
        if ( language === dashboardLanguage.german )
        {
            return stringsDe
        }
        else {
            return stringsEn
        }
    }
}