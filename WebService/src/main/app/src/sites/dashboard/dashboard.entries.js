import React from "react";

/**
 * Extends functionality of the `Dashboard` component.
 * This class is used specifically to modify the `entries` state.
 *
 * In order to use them, then need to be bound in the `Dashboard component`
 * like `this.[someFunc] = [importAlias].[someFunc].bind(this);`.
 */

export function loadEntries(entries) {
    const passwords = [];
    const categories = [];
    entries.forEach(entry => {
        if (entry.type==='passwd') {
            passwords.push(entry);
        } else {
            categories.push(entry);
        }
    });
    this.setState(prevState => ({
        entries: {
            ...prevState.entries,
            passwords: passwords,
            categories: categories
        }
    }));
}

export function getCatsFromTab(tabSelected) {
    return this.state.entries.categories.filter(cat => cat.tabID === tabSelected);
}

export function getCatData(catID, tabID) {
    return this.state.entries.passwords.filter(ent => ent.catID === catID && ent.tabID === tabID);
}

