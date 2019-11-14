import {authConstants as dashboardConst} from "../authentification/auth.const.localstorage";

export const SAVE_TAB = "SAVE_TAB";
export const SAVE_CAT = "SAVE_CAT";

export const saveTab = (tabselected, catselected) => ({
    type: SAVE_TAB,
    tabselected,
    catselected
});

export const saveCat = (tabselected, catselected) => ({
    type: SAVE_CAT,
    tabselected,
    catselected
});
