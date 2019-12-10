import tabs from "./tabs/tab.enum";

class MockPasswords {

    constructor(props) {

        this.state = {
            sozialMedia: [{id: 0, tabID: 0, title: "Google", user: "Sebooo@gmail.com", url: "google.com", cat: 1, tag: []}, {id: 1, tabID: 0, title: "Instagram", user: "Sebo", pass: "Geheim", url: "instagram.com/", cat: 1, tag: [{"Kommentar": "Für die Werbebilder"}]},{id: 2, tabID: 0, title: "Youtube", user: "michael.meyer@gmail.com", pass: "Geheim", url: "youtube.com", cat: 1, tag: [{"Kommentar": "Werbevideos"}]}],
            email: [{id: 3, tabID: 0, title: "Outlook", user: "swahl@student.tgm.ac.at", cat: 2, url: "https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1573646035&rver=7.0.6737.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26RpsCsrfState%3da992ae5f-b164-bd0f-15d4-cca75d3498f8&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015", tag: [{"Kommentar": "Mail"}]}, {id: 4, tabID: 0, title: "Outlook", user: "swahl@student.tgm.ac.at", url: "outlook.com", cat: 2, tag: [{"Kommentar": "Outlook-Mail"}]}, {id: 5, tabID: 0, title: "GMX", user: "m.meyer@gmx.at", url: "gmx.com", cat: 2, tag: [{"Kommentar": "GMX-Mail"}]}],
            //easyPass: [{id: 6, title: "Hehehe", user: "Damn", url: "pornhub.com", tag: [{"Wozu": "Hehehe"}]}],
            easyPass: [{id: 9, tabID: 1, title: "Haus-Zugang", user: "Haus", url: "", cat: 1, tag: []}, {id: 6, tabID: 1, title: "Confluence", user: "swahl", url: "https://confluence.welsch.pro/", cat: 1, tag: [{"Wozu": "Hehehe"}]}],
            sonstige: [{id: 7, tabID: 0, title: "W3Schools", user: "w4235f", url: "https://www.w3schools.com/", cat: 0, tag: []}, {id: 8, tabID: 1, title: "Sup", user: "max.sup", url: "https://www.supremenewyork.com/", cat: 1, tag: []}],
            pass: [{id: 0, pass: "supergeheim" }, {id: 1, pass: "supergeheim" }, {id: 2, pass: "supergeheim" }, {id: 3, pass: "supergeheim" }, {id: 4, pass: "supergeheim" }, {id: 5, pass: "supergeheim" }, {id: 6, pass: "supergeheim" }, {id: 7, pass: "HelloooooooWorld"}, {id: 8, pass: "Wieso?"}, {id: 9, pass: "1234"}],
        };

        this.updatePass = this.updatePass.bind(this);
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

    getPassword(id) {
        const pass = this.state.pass;
        for ( let i = 0; i < pass.length; i++ ) {
            if ( pass[i].id === id) {
                return pass[i].pass;
            }
        }
        return null;
    }

    updatePass(id, title, user, url, pass ) {
        // kommt noch
    }


}

export default new MockPasswords();