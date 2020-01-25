import tabs from "./tabs/tab.enum";
import React from "react";

class Entries{

    constructor(props) {
        //super(props);

        this.state = {
            entries: [],
            categories: []
        };

        this.updateEntry = this.updateEntry.bind(this);
        this.addEntry = this.addEntry.bind(this);
    }


    getCatData( catID, tabID ) {
        /**
        let out;
        switch (tabId) {
            case 0:
                switch (cat) {
                    // Keiner Kategorie zugewiesen
                    case 0:
                        out = this.state.sonstige;
                        break;
                    case 1:
                        out = this.state.sozialMedia;
                        break;
                    case 2:
                        out = this.state.email;
                        break;
                }
                break;
            case 1:
                switch (cat) {
                    // Keiner Kategorie zugewiesen
                    case 0:
                        out = this.state.sonstige;
                        break;
                    case 1:
                        out = this.state.easyPass;
                        break;
                }
                break;

        }
        return out;*/
        return this.state.entries.filter(ent => ent.catID === catID && ent.tabID === tabID);
    }

    /**
     * Loads data containing password entries and categories to internal state.
     */
    loadData(data) {
        // Reset all entries and categories
        this.state = {
            entries: [],
            categories: []
        };
        // Add element to corresponding type
        data.forEach(element => {
            if (element.type==='entry') {
                this.state.entries.push(element);
            } else {
                this.state.categories.push(element);
            }
        });
    }

    addEntry(entry) {
        this.state.entries.push(entry)
    }

    updateEntry(id, title, user, url, pass ) {
        // kommt noch
    }

    getCats(tabselected) {
        /**
        let out = [];
        switch (tabselected) {
            case tabs.PRIVPASS:
                out = [{id:1, name:"Social Media", desc:"All Sozial Media accounts are saved here"}, {id:2, name:"Email", desc:"All Email-Accounts are saved here"} ];
                break;
            case tabs.GROUPPASS:
                out = [{id:1, name:"EasyPass", desc:"Huiiii"} ];
                break;
         return out;
        }*/
        // TODO Test if getCats works
        return this.state.categories.filter(cat => cat.tabID === tabselected);

    }

    getEntry(id) {
        /**
        const pass = this.state.pass;
        for ( let i = 0; i < pass.length; i++ ) {
            if ( pass[i].id === id) {
                return pass[i].pass;
            }
        }
        return null;*/
        return this.state.entries.find(ent => ent._id === id);
    }

    /**
    deleteEntry(id) {
        let arr = this.state.sozialMedia;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                arr.splice(i,1);
            }
        }
    }*/


}

export default Entries;