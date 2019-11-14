import {
    GET_CAT_GROUP,
    GET_CAT_PRIV,
    GET_TAB,
    SAVE_CAT,
    SAVE_TAB
} from "../../action/dashboard.action";
import dashboardConst from "../../sites/dashboard/const/dashboard.enum";
import tabs from "../../sites/dashboard/tabs/tab.enum";


const saveReducer = ( state, action) => {
    let out;
    switch (action.type) {
        case SAVE_TAB:
            localStorage.setItem(dashboardConst.tabselected, JSON.stringify(action.tabselected));
            console.log("Save Tab + Cat success");
            return {};
        case SAVE_CAT:
            if ( action.tabselected === tabs.PRIVPASS ) {
                localStorage.setItem(dashboardConst.catselectedPriv, JSON.stringify(action.catselected));
            }
            else {
                localStorage.setItem(dashboardConst.catselectedGroup, JSON.stringify(action.catselected));
            }
            console.log("Save Tab + Cat success");
            return {};
        default:
            return {};
    }
};

export default saveReducer;