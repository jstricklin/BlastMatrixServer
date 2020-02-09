module.exports = class NameGenerator {
    constructor() {
        this.adjectiveList = [
            "Blue",
            "Dark",
            "Last",
            "Epic",
            "Dope",
            "Hella",
            "Rad",
            "Lugubrious",
            "Lost",
            "Commanding",
            "TenFoot",
            "Tiny",
            "Tragic",
            "Strong",
            "Punk",
            "Metal"
        ];
        this.femNounList = [
            "Queen",
            "Mistress",
            "Princess",
            "Jammer",
            "Valkyrie",
            "Riot",
            "Bat",
            "Cat",
            "Girl",
            "Lady"
        ];
        this.mascNounList = [
            "Horse",
            "Cobra",
            "Scorpion",
            "Enforcer",
            "Void",
            "Cloud",
            "Giraffe",
            "Moon",
            "Hole",
            "Termite",
            "Gnat",
            "Cat",
            "Tiger",
            "Tragedy",
            "Boss",
            "King",
            "Pharaoh",
            "Dope",
            "Bat",
            "Man"
        ];
        this.mascNameList = [
            "Bob",
            "Terry",
            "Steve",
            "Joe",
            "Chris",
            "Ted"
        ];
        this.femNameList = [
            "Sally",
            "Susan",
            "Jen",
            "Bertha",
            "Sammie",
            "Sunni",
            "Jane"
        ];
    }
    GenerateName() {
        let name = "";
        let useName = Math.floor((Math.random() * 10) + 1) > 8;
        let femName = Math.floor((Math.random() * 10) + 1) > 5;
        // Generate base name
        if (femName) {
            if (useName) {
                if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.femNameList[Math.floor(Math.random() * this.femNameList.length)]}${this.Preposition()}${this.femNounList[Math.floor(Math.random() * this.femNounList.length)]}`;
                } else if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.femNounList[Math.floor(Math.random() * this.femNounList.length)]}${this.femNameList[Math.floor(Math.random() * this.femNameList.length)]}`;
                } else {
                    name = `${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.femNameList[Math.floor(Math.random() * this.femNameList.length)]}`;
                }
            } else {
                if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.femNounList[Math.floor(Math.random() * this.femNounList.length)]}`;
                } else if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.femNounList[Math.floor(Math.random() * this.femNounList.length)]}${this.Preposition()}${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}`;
                } else {
                    name = `${this.Preposition()}${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.femNounList[Math.floor(Math.random() * this.femNounList.length)]}`;
                }
            }
        } else {
            if (useName) {
                if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.mascNameList[Math.floor(Math.random() * this.mascNameList.length)]}${this.Preposition()}${this.mascNounList[Math.floor(Math.random() * this.mascNounList.length)]}`;
                } else if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.mascNounList[Math.floor(Math.random() * this.mascNounList.length)]}${this.mascNameList[Math.floor(Math.random() * this.mascNameList.length)]}`;
                } else {
                    name = `${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.mascNameList[Math.floor(Math.random() * this.mascNameList.length)]}`;
                }
            } else {
                if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.mascNounList[Math.floor(Math.random() * this.mascNounList.length)]}`;
                } else if (Math.floor((Math.random() * 10) + 1) > 5) {
                    name = `${this.mascNounList[Math.floor(Math.random() * this.mascNounList.length)]}${this.Preposition()}${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}`;
                } else {
                    name = `${this.Preposition()}${this.adjectiveList[Math.floor(Math.random() * this.adjectiveList.length)]}${this.mascNounList[Math.floor(Math.random() * this.mascNounList.length)]}`;
                }
            }
        }
        // Leetify
        if (Math.floor((Math.random() * 10) + 1) > 7) {
            name = this.Leetify(name);
        }
        // Decorate
        if (Math.floor((Math.random() * 10) + 1) > 7) {
            name = this.Decorate(name);
        }
        return name;
    }
    Preposition() {
        return Math.floor(Math.random() * 10) > 5 ?
            "The" :
            "Da";
    }
    Leetify(toLeet) {
        let leetName = ""
        toLeet.split("").forEach(letter => {
            switch(letter) {
                case ["a", "A"] : leetName += "4";
                    break;
                case ["o", "O"] : leetName += "0";
                    break;
                case ["e", "E"] : leetName += "3";
                    break;
                case ["g", "G"] : leetName += "6";
                    break;
                case ["l", "i", "I"] : leetName += "1";
                    break;
                case ["L", "T"] : leetName += "7";
                    break;
                case ["p", "P"] : leetName += "9";
                    break;
                case ["s", "S"] : leetName += "5";
                    break;
                default : leetName += letter;
            }
        })
        return leetName;
    }
    Decorate(toDecorate) {
        let decoratedName = ""
        let decorType = Math.ceil(Math.random() * 5);
        let num;
        switch (decorType) {
            case 1 : decoratedName = `xX${toDecorate}Xx`;
                break;
            case 2 : decoratedName = `Xx${toDecorate}xX`;
                break;
            case 3 : 
                num = Math.floor(Math.random() * 1000);
                if (num < 10) num *= 10;
                decoratedName = `${toDecorate}${num}`;
                break;
            case 4 : 
                num = Math.floor(Math.random() * 100);
                let num2 = Math.floor(Math.random() * 100);
                if (num < 10) num *= 10;
                decoratedName = `${num}${toDecorate}${num2}`;
                break;
            case 5 : 
                decoratedName = `xXx${toDecorate}xXx`;
                break;
            case 5 : 
                decoratedName = `xxX${toDecorate}Xxx`;
                break;
        }
        return decoratedName;
    }
}