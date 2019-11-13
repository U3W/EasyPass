import tabs from "./tabs/tab.enum";

class MockPasswords {
    getCatData( cat ) {
        let out;
        switch (cat) {
            case "Social Media":
                out= [{id: 0, image: "", title: "Instagram", user: "Hello", pass: "Geheim", url: "google.com"}, {id: 1, image: "https://www.instagram.com/", title: "Instagram", user: "Hello", pass: "Geheim", url: "instagram.com/"},{id: 2,image: "https://www.instagram.com/", title: "Instagram", user: "Hello", pass: "Geheim", url: "google.com"}];
                break;
            case "Email":
                out = [{id: 3, image: "", title: "Outlook", user: "Hello", pass: "Geheim", url: "https://login.live.com/login.srf?wa=wsignin1.0&rpsnv=13&ct=1573646035&rver=7.0.6737.0&wp=MBI_SSL&wreply=https%3a%2f%2foutlook.live.com%2fowa%2f%3fnlp%3d1%26RpsCsrfState%3da992ae5f-b164-bd0f-15d4-cca75d3498f8&id=292841&aadredir=1&CBCXT=out&lw=1&fl=dob%2cflname%2cwld&cobrandid=90015"}, {id: 4, image: "https://www.outlook.com/", title: "Outlook", user: "Hello", pass: "Geheim", url: "outlook.com"}, {id: 5, image: "https://www.gmx.at/", title: "GMX", user: "Hello", pass: "Geheim", url: "gmx.com"}];
                break;
            case "EasyPass":
                out = [{id: 6, image: "", title: "Hehehe", user: "Hello", pass: "Geheim", url: "pornhub.com"}];
                break;
            case "*":
                out= [{catName: "Social Media", entries: [{image: "", title: "Instagram", user: "Hello", pass: "Geheim", url: "google.com"}, {image: "https://www.instagram.com/", title: "Instagram", user: "Hello", pass: "Geheim", url: "instagram.com/"},{image: "https://www.instagram.com/", title: "Instagram", user: "Hello", pass: "Geheim", url: "google.com"}]},
                    {catName: "Email", entries: [{image: "", title: "Outlook", user: "Hello", pass: "Geheim", url: "outlook.com"}, {image: "https://www.outlook.com/", title: "Outlook", user: "Hello", pass: "Geheim", url: "outlook.com"}, {image: "https://www.gmx.at/", title: "GMX", user: "Hello", pass: "Geheim", url: "gmx.com"}]}];
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
}

export default new MockPasswords();