import {authConstants} from "../../authentification/auth.const.localstorage";
import {dashboardConst} from "./const/dashboard.enum";

class dashboardState {

    getTab() {
        return JSON.parse(localStorage.getItem(dashboardConst.tabselected));
    }

    getCatPriv() {
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedPriv));
    }

    getCatGroup() {
        return JSON.parse(localStorage.getItem(dashboardConst.catselectedGroup));
    }

}


export default new dashboardState;