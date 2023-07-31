class Room{
    constructor(id,name,firstTime,lookAround,possibleMoves,possibleLooks,possibleInspect){
        this.id = id
        this.name = name
        this.firstTime = firstTime
        this.lookAround = lookAround
        this.possibleMoves = possibleMoves
        this.possibleLooks = possibleLooks
        this.possibleInspect = possibleInspect
    }
}

class Item{
    constructor(name,altNames, description, isLocked, canOpen, canMove){
        
        this.name = name
        this.altNames = altNames
        this.description = description
        this.isLocked = isLocked
        this.canOpen = canOpen
        this.canMove = canMove
    }
}

//room(id,name,firstTime,lookAround,possibleMoves,possibleLooks,possibleInspect)
let playerSpawn = new Room(
    //id for lookup tables
    "playerSpawn",
    //name for status bar
    `point of origin`,
    //when visiting first time text
    `I am waking up in a dark cold space. I am floating in space.`,
    //when look around command
    `Space station debris is all around me`,
    //possible moves
    { "up" : "halfWay",
    "down" : "I should not go there.",
    "left" : "Just a burnt solar panel.",
    "right": "More debris."},
    //possible looks
    { "up" : "This might be the only possible way to go. ",
    "down" : "There is a sharp outer hull piece.",
    "left" : "Large piece of the solar array",
    "right" : "Blinding sun light"},
    //possible Inspects
    {"hull": "This is a piece from the main corridor of the ISS. Its sharp and made of Aluminum",
    "solar panel" :"broken solar panel, it used to be part of the large solar array LSA.",
    "thrusters": "My suits thruster tank is empty. Maybe I could use my oxygen reserves?",
    "oxygen":"I can re-route my o2 tank into my thrusters with a command:'override oxygen'", 
    "sun" : "That really f** hurts"
    }
)

let halfWay = new Room(
    //id for lookupTables
    "halfWay",
    //name for status bar
    "between origin and a severed cargo bay",
    //when visiting first time text
    "I take a break. I am surrounded by large glisenig metal debris. I should look around this are for clues or useful items.",
    //when look around command
    "About 150m above me is a large separated part of the station, slowly tumbling through a cloud of debris leaving behind a spiral of frozen liquid.",
    //possible moves
    { "up" : "cargoBay",
    "down" : "playerSpawn",
    "left" : "I am next to a jumbled mess of space station heat exchangers",
    "right": "There is a sharp truss I should not go there."},
    //possible looks
    { "up" : "I can see a path towards the tumbling severed compartment.",
    "down" : "Its the path back to where I started",
    "left" : "A large chunk of heat exchangers.",
    "right" : "Looks dangerous there."},
    //possible Inspects
    {"heat exchanger": "The sations uses heat exchangers to expell heat into space in a form of infrared radiation. This thing is junked",
    "truss" :"Part of the main corridor truss. Its sharp and could easilly puncture my suit.",
    "sun" : "That really f** hurts"
    }
)

let cargoBay = new Room(
    //id for lookupTables
    "cargoBay",
    //name for status bar
    "severed cargo bay",
    //when visiting first time text
    "I finally made it to the Cargo bay. I manage to match my rotation with its slow spin and I enter inside through a large blast hole. Most of the room is completely empty. Everything got sucked out when the hole opened. The only things intact are the floor mounted robotic loading arm and a wall mounted toolbox. Suddenly I feel a strong vibration trough the grab handle. I quickly turn around, just in time to witness a metal truss hiting jamming into the blast hole. My only way out is throught the cargo bay access door.",
    //when look around command
    "Mostly empty cargo bay, cutoff from the ISS's main corridor. There is power operated access door. In the middle of the room is a robotic arm used to manipulate cargo from delivery rockets. Around the room are various cabinets, wall mounted toolbox, and discarded shipping containers. When I peer through the door window, I see that the ISS is about 200m from here",
    //possible moves
    { "up" : "mainCorridor",
    "down" : "airlock",
    "left" : "I am holding onto the the metal truss thats lodged into the hole through which I entered.",
    "right": "sciencePod"},
    //possible looks
    { "up" : "This might be the only possible way to go. ",
    "down" : "There is a sharp outer hull piece.",
    "left" : "Large piece of the solar array",
    "right" : "Blinding sun light"},
    //possible Inspects
    {"hull": "This is a piece from the main corridor of the ISS. Its sharp and made of Aluminum",
    "solar panel" :"broken solar panel, it used to be part of the large solar array LSA.",
    "thrusters": "My suits thruster tank is empty. Maybe I could use my oxygen reserves?",
    "oxygen":"I can re-route my o2 tank into my thrusters with a command:'override oxygen'", 
    "sun" : "That really f** hurts"
    }
)

//item (name, ,altNames, description, possibleActions)
let arm = new Item(
    // name for invetory purposes
    "arm",
    //alternative names inputed by user
    ["forearm","forearm","severed arm","severed forearm"],
    //description
    "severed forearm arm",
    //possible actions
    {"inspect":"Severed human arm with a smartwatch",
     "take" : "take",
     "drop" : "drop",
     "inspect smartwatch" : "The display reads 'BT pairing mode",
     "eat" : "I broke a tooth because the arm is frozen solid",
     "use" : "I use it as back scratcher "
    }
)

let photograph =new Item(
    // name for invetory purposes
    "photograph",
    //alternative names inputed by user
    ["photo","picture"],
    //description
    "photograph of Wahiba",
    //possible actions
    {"inspect":`Photograph of Wahiba with her newborn baby. The back side of it has a note "- 1995, Khartoum`,
     "take" : "take",
     "drop" : "drop",
     "eat" : "This photograph is printed with non-organic ink. I should not eat it",
     "use" : "I roll it up and snort a line of space coke with it."
    }
)

player = {
    name: "Rene",
    location: "halfWay"
}

inventoryTable = {
    "player": [],

    "playerSpawn": [],
    "halfWay" : ["arm","photograph"],
    "cargoBay" : []
}

locationTable ={
    "playerSpawn":playerSpawn,
    "halfWay":halfWay,
    "cargoBay":cargoBay
}

//name,altNames, description, isLocked, canOpen, canMove
itemTable ={
    "arm": arm,
    "photograph": photograph
}

function lookAround(){
    //get players location and display rooms look around properties
    console.log(locationTable[player.location].lookAround)
    
    //check if anything on the ground. If yes show all of the items and their 
    if (inventoryTable[player.location].length != 0){
        console.log(`Around me I also notice a \r`)
        inventoryTable[player.location].map(item => {console.log(itemTable[item].description)})
        }
    }

function look(direction){
    //first check if it is a look option in location object. 
    
}

function inspect(){
    //
}



lookAround()

look()
