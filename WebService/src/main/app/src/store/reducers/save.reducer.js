import {
    GET_CAT_GROUP,
    GET_CAT_PRIV,
    GET_TAB,
    SAVE_CAT, SAVE_LANGUAGE, SAVE_SIDEBAR,
    SAVE_TAB
} from "../../action/dashboard.action";
import {dashboardConst} from "../../sites/dashboard/const/dashboard.enum";
import tabs from "../../sites/dashboard/tabs/tab.enum";
import {SAVE_MAUTH_STATE} from "../../action/mauth.action";
import {masterpasswordConst} from "../../sites/verify/masterpassword.enum";


const saveReducer = ( state, action) => {
    let out;
    let tab = action.tabselected;
    let cat = action.catselected;
    switch (action.type) {
        case SAVE_TAB:
            localStorage.setItem(dashboardConst.tabselected, JSON.stringify(tab));
            return {};
        case SAVE_CAT:
            if ( action.tabselected === tabs.PRIVPASS ) {
                localStorage.setItem(dashboardConst.catselectedPriv, JSON.stringify(cat));
            }
            else {
                localStorage.setItem(dashboardConst.catselectedGroup, JSON.stringify(cat));
            }
            return {};
        case SAVE_SIDEBAR:
            localStorage.setItem(dashboardConst.sidebarClosed, JSON.stringify(action.sidebarClosed));
            return {};
        case SAVE_LANGUAGE:
            localStorage.setItem(dashboardConst.languageSelected, JSON.stringify(action.language));
            return {};
        case SAVE_MAUTH_STATE:
            localStorage.setItem(masterpasswordConst.radioSelected, action.twoFactorOpt);
            return {};
        default:
            return {};
    }
};

export default saveReducer;