import {authConstants} from "../../authentification/auth.const.localstorage";
import {dashboardConst} from "./const/dashboard.enum";

class dashboardState {

    static getTab() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.tabselected)) === null ) {
            return 0;
        }
        return JSON.parse(localStorage.getItem(dashboardConst.tabselected));
    }

    static getCatPriv() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv)) === null ) {
            return 0;
        }
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv));
    }

    static getCatGroup() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.catselectedGroup)) === null ) {
            return 0;
        }
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedGroup));
    }

    static getSidebarClosed() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.sidebarClosed)) === null )
        {
            return false;
        }
        return JSON.parse(localStorage.getItem(dashboardConst.sidebarClosed));
    }

    static getSelectedLanguage() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.languageSelected)) === null )
        {
            return false;
        }
        return JSON.parse(localStorage.getItem(dashboardConst.languageSelected));
    }

}


export default dashboardState;