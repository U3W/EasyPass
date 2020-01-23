import tabs from "./tabs/tab.enum";
import React from "react";

class Entries extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            entries: []
        };

        this.updateEntry = this.updateEntry.bind(this);
        this.addEntry = this.addEntry.bind(this);
    }


    getCatData( cat, tabId ) {
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
        return out;
    }

    loadentries() {

    }

    addEntry(passwd) {
        this.setState({
            entries: this.state.entries.push(passwd)
        });
    }

    updateEntry(id, title, user, url, pass ) {
        // kommt noch
    }

    getCats(tabselected) {
        let out = [];
        switch (tabselected) {
            case tabs.PRIVPASS:
                out = [{id:1, name:"Social Media", desc:"All Sozial Media accounts are saved here"}, {id:2, name:"Email", desc:"All Email-Accounts are saved here"} ];
                break;
            case tabs.GROUPPASS:
                out = [{id:1, name:"EasyPass", desc:"Huiiii"} ];
                break;
        }
        return out;
    }

    getentry(id) {
        const pass = this.state.pass;
        for ( let i = 0; i < pass.length; i++ ) {
            if ( pass[i].id === id) {
                return pass[i].pass;
            }
        }
        return null;
    }

    deleteEntry(id) {
        let arr = this.state.sozialMedia;
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].id === id) {
                arr.splice(i,1);
            }
        }
    }


}

export default Entries;