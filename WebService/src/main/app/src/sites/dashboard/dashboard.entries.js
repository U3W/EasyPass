import React from "react";

/**
 * Extends functionality of the `Dashboard` component.
 * This class is used specifically to modify the `entries` state.
 *
 * In order to use them, then need to be bound in the `Dashboard component`
 * like `this.[someFunc] = [importAlias].[someFunc].bind(this);`.
 */

/**
 * Overrides existing entries with new data.
 */
export function loadEntries(data) {

    console.log("ENTRIES");
    console.log(data);

    const type = data[0];
    const entries = data[1];

    const check = this.state.entries[type];

    if (!(type in this.state.entries) || entries !== check) {
        let passwords = new Map();
        let categories = new Map();

        entries.forEach(entry => {
            if (entry.type==='passwd') {
                passwords.set(entry._id, entry);
            } else {
                categories.set(entry._id, entry);
            }
        });

        this.setState({
            entries: this.state.entries.set(type, {passwords: passwords, categories: categories})
        });
    }



    /**
    let passwords = [];
    let categories = [];
    entries.forEach(entry => {
        if (entry.type==='passwd') {
            passwords.push(entry);
        } else {
            categories.push(entry);
        }
    });
    if (!comparePasswords(this.state.entries.passwords, passwords) ||
        !compareCategories(this.state.entries.categories, categories)) {
        this.setState(prevState => ({
            entries: {
                ...prevState.entries,
                passwords: passwords,
                categories: categories
            }
        }));
    }*/
}

/**
 * Returns the categories from a selected tab in an array.
 */
export function getCatsFromTab(tabSelected) {
    if (this.state.entries.has('private') && this.state.entries.get('private').categories.size > 0) {
        //return this.state.entries.categories.filter(cat => cat.tabID === tabSelected);
        return [...this.state.entries.get('private').categories.values()].filter(cat => cat.tabID === tabSelected);
    } else return [];


}

export function getCatsFromGroup(groupSelected) {
    // ToDo @Kacper
    switch (groupSelected) {
        case "1":
            return  [{_id: "2", _rev: "2", groupId: "1", desc: "Name", name: "Test", tabID: 1, type: "cat", }];
        case "2":
            return  [{_id: "3", _rev: "3", groupId: "2", desc: "Name", name: "Why", tabID: 1, type: "cat", }];
    }
    return [];
}

/**
 * Returns the password entries from a category and selected tab in an array.
 */
export function getCatData(catID, tabID, groupID) {
    if (this.state.entries.has('private')) {
        const el = this.state.entries.get('private');
        console.log(el.passwords.size);
    }


    if (this.state.entries.has('private') && this.state.entries.get('private').passwords.size > 0) {
        //return this.state.entries.passwords.filter(ent => ent.catID === catID && ent.tabID === tabID);
        const array = [...this.state.entries.get('private').passwords.values()];
        return array.filter(ent => ent.catID === catID && ent.tabID === tabID);
    } else return [];

}


/**
 * Compares two arrays of password entries.
 */
function comparePasswords(that, other) {
    if (that.length !== other.length) {
        return false;
    }
    for (let i = 0; i < that.length; i++) {
        if (!comparePassword(that[i], other[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Compares two password entries.
 */
function comparePassword(that, other) {
    if (that.tags.length !== other.tags.length) {
        return false;
    } else {
        for (let i = 0; i < that.tags.length; i++) {
            const keys = Object.keys(that.tags[i]);
            keys.forEach(key => {
                if (that.tags[i][key] !== other.tags[i][key]) {
                    return false;
                }
            });
        }
    }
    return !!(that.type === other.type && that.user === other.user &&
        that.url === other.url && that.title === other.title &&
        that.tabID === that.tabID && that.catID === other.catID &&
        that._id === other._id && that._rev === other._rev);
}

/**
 * Compares two arrays of category entries.
 */
function compareCategories(that, other) {
    if (that.length !== other.length) {
        return false;
    }
    for (let i = 0; i < that.length; i++) {
        if (!compareCategory(that[i], other[i])) {
            return false;
        }
    }
    return true;
}

/**
 * Compares two category entries.
 */
function compareCategory(that, other) {
    return that.type === other.type && that.name === other.name &&
        that.desc === other.desc && that.tabID === other.tabID &&
        that._id === other._id && that._rev === other._rev;
}

