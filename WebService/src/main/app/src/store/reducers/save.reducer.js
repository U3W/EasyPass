import {
    SAVE_CAT, SAVE_GROUP, SAVE_LANGUAGE, SAVE_SIDEBAR,
    SAVE_TAB
} from "../../action/dashboard.action";
import {dashboardConst} from "../../sites/dashboard/const/dashboard.enum";
import tabs from "../../sites/dashboard/tabs/tab.enum";
import {SAVE_MAUTH_STATE, SAVE_SESSIONUSER} from "../../action/auth.action";
import {SAVE_USER, SAVE_USERNAME} from "../../action/auth.action";
import {loginConst} from "../../sites/login/login.enum";
import {authConstants} from "../../authentification/auth.const.sessionstorage";


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
            localStorage.setItem(loginConst.radioSelected, action.twoFactorOpt);
            return {};
        case SAVE_USER:
            localStorage.setItem(loginConst.saveUsernameState, action.user);
            return {};
        case SAVE_USERNAME:
            localStorage.setItem(loginConst.saveUsername, action.username);
            return {};
        case SAVE_SESSIONUSER:
            sessionStorage.setItem(authConstants.username, action.username);
            return {};
        case SAVE_GROUP:
            localStorage.setItem(dashboardConst.groupSelected, JSON.stringify(action.groupselected));
            return {};
        default:
            return {};
    }
};

export default saveReducer;