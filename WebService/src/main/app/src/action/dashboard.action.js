import {authConstants as dashboardConst} from "../authentification/auth.const.sessionstorage";

export const SAVE_TAB = "SAVE_TAB";
export const SAVE_CAT = "SAVE_CAT";
export const SAVE_SIDEBAR = "SAVE_SIDEBAR";
export const SAVE_LANGUAGE = "SAVE_LANGUAGE";
export const SAVE_GROUP = "SAVE_GROUP";


export const saveTab = (tabselected) => ({
    type: SAVE_TAB,
    tabselected
});

export const saveCat = (tabselected, catselected) => ({
    type: SAVE_CAT,
    tabselected,
    catselected
});

export const saveSidebarClosed = (sidebarClosed) => ({
    type: SAVE_SIDEBAR,
    sidebarClosed,
});

export const changeLanguage = (language) => ({
    type: SAVE_LANGUAGE,
    language,
});

export const saveGroup = (groupselected, groupRevSelected) => ({
    type: SAVE_GROUP,
    groupselected,
    groupRevSelected,
});

