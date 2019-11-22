import {authConstants} from "../../authentification/auth.const.localstorage";
import {dashboardConst} from "./const/dashboard.enum";

class dashboardState {

    getTab() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.tabselected)) === null ) {
            return 0
        }
        return JSON.parse(localStorage.getItem(dashboardConst.tabselected));
    }

    getCatPriv() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv)) === null ) {
            return 0
        }
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv));
    }

    getCatGroup() {
        if ( JSON.parse(localStorage.getItem(dashboardConst.catselectedGroup)) === null ) {
            return 0
        }
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedGroup));
    }

}


export default new dashboardState;