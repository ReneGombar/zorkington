// Picking up things and moving them works with alternative item names
// three rooms are linked and contain movable objects

//To-Do
/*  
    * build inspect() function to be able to read allowed inspects in each room
    * build open () and use() functions
    * finish the other rooms and story
*/

const { clear } = require('console');
const { mainModule, rawListeners } = require('process');
const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

//these are room declaration that can acces each other in global
let playerSpawn = null
let halfWay = null
let cargoBay = null
let mainCorridor = null
let airlock = null
let hints = 0


//player health in global
//o2Jet [`name`,active,`OFF decription`,`ON decription`]
let o2Jet = [`Oxygen tank to thrusters override command: override oxygen`,false,`My suit has no propellant to generate thrust. I can't move without holding onto something`,`Now I am using my Oxygen as a propellant in my suits thrusters. I can move in any direction. I need to watch the oxygen levels to make sure I have enough to breath.`]
//o2 lovels inside the suit but global
let o2Level = 83



class Room{
    constructor(name,description,look,possibleMoves,possibleLooks,possibleInspect){
        this.name = name
        this.description = description
        this.look = look
        this.possibleMoves = possibleMoves
        this.possibleLooks = possibleLooks
        this.possibleInspect = possibleInspect
    }
}

class Item{
    constructor(name, description, locked, opens, moves){
        this.name = name
        this.description = description
        this.locked = locked
        this.opens = opens
        this.moves = moves
    }
}

function ask(questionText) {
    return new Promise((resolve, reject) => {
      rl.question(questionText, resolve);
    });
  }

//clears the screen
function clearScreen() {
    process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");
    console.clear();
}

// this function prints the text slowly , ms determines the delay
// maximum nuber of characters on  a line is 80 
function printSlow(text,ms) { 
    return new Promise((resolve, reject) => {
        text =text.split('')
        let count = 0
        let myTimer = setInterval(function() {
            process.stdout.write(`${text[count]}`)
            count++;
            const width = [79,79*2,79*3,79*4,79*5,79*6,79*7,79*8,79*9,79*10]
            if (width.includes(count)) {process.stdout.write(`-\n`)}
            if (count == text.length) {
                clearInterval(myTimer);
                process.stdout.write(`\n`)
                resolve(true);
            }
        }, ms)
    }); 
}

/*function gameTimer(start) { 
    return new Promise((resolve, reject) => {
        let count = 0
        let myTimer = setInterval(function() {
            count++;
                clearInterval(myTimer);
                return myTimer;
            },resolve)
        }, 1000)
    }
*/


//red =  \x1b[31m  ; green   \x1b[32m  ;  yellow \x1b[33m    reset =   \x1b[0m  ;
async function intro(){
    await printSlow(`Loading  \x1b[32m BLAST v0.0001 .................................`,40);
    clearScreen()
    await printSlow(`\x1b[32m       **************************************`,ms);
    await printSlow(`\x1b[32m       *                                    *`,ms);
    await printSlow(`\x1b[32m       *    International Space Station     *`,msI);
    await printSlow(`\x1b[32m       *            19h:21m:36s             *`,msI);
    await printSlow(`\x1b[32m       *                                    *`,ms);
    await printSlow(`\x1b[32m       * - - - - - - - - - - - - - - - - - -*`,ms);
    await printSlow(`\x1b[32m       *  Loc: 34.134.156  Alt: 420.456km   *`,msI);
    await printSlow(`\x1b[32m       * - - - - - - - - - - - - - - - - - -*`,ms);
    await printSlow(`\x1b[32m       *                                    *`,ms);
    await printSlow(`\x1b[32m       *         S.e.l.f. test status       *`,msI);
    await printSlow(`\x1b[32m       *                                    *`,ms);
    await printSlow(`\x1b[32m       *  Connection: \x1b[31munavalaible\x1b[32m           *`,msI+30);
    await printSlow(`\x1b[32m       *  Main System Status: \x1b[31munavalaible\x1b[32m   *`,msI+30);
    await printSlow(`\x1b[32m       *  L.I.F.E.S Status: \x1b[31munavalaible\x1b[32m     *`,msI+30);
    await printSlow(`\x1b[32m       *                                    *`,ms);
    await printSlow(`\x1b[32m       **************************************\x1b[0m`,ms);
    await printSlow(` `,5000);
    clearScreen()
    await printSlow(`. . . . . . a . i . r . . . . . . . . h . i . s . s . i . n . g . .`,msI+msI);
    await printSlow(` `,2350);
    await printSlow(`   darkness      cold      pain        noise         noise`,msI+msI);
    await printSlow(` `,2550);
    await printSlow(`\x1b[31m   WARNING! LEAK DETECTED \x1b[0m`,msI);
    await printSlow(`\x1b[31m   WARNING! SUIT INTEGRITY COMPROMISED \x1b[0m`,msI);
    await printSlow(` `,3200);
    await printSlow(`Aaaahhh!!!`,msI);
    await printSlow(`I scream as the pain shoots through my left arm`,ms);
    await printSlow(` `,2000)
    clearScreen()
}

//rooms : name,description,look, possMoves ,possLooks, possInspect)
playerSpawn = new Room(
    `original location`,
    `I am floating in a cloud of debris and schrapnell. I feel cold, disoriented and my left arm might be broken .I do not know what is happening! Water vapor is condensing on my helmet visor and after I wipe it off I recognize the shape of the ISS in the distance. Metal debris is floating all around me. The suit informs me that my thrusters are damaged and they lost all the propelant. Luckily my oxygen level is at ${o2Level}%, which gives me confidence. I need to get back to the station to figure out what happened, but my thruster's tanks are empty!`,
    `In front of me I can see the distant shape of the ISS but I am completely surrounded by torn, twisted, metal pieces of the outer hull. The space above me seems more open and I can make out a smaller shape floating in that direction.`,
    //possible moves
    { "up" : 2,
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
    "oxygen":"I can reroute my o2 tank into my thrusters with a command:'override oxygen'", 
    "sun" : "That really f** hurts"
    }
)

halfWay = new Room(
    "halfway between origin and piece of the station",
    `Large, glisenig debris is all around me. As I am searching through the debris I am startled by a severed arm bumping into my visor. The hand is clutching a photograph. About 150m above me is a large separated part of the station, slowly tumbling through the cloud of debris leaving behind a spiral of frozen liquid.`,
    `I am halfway between my original location and a tumbling chunk of the station, which is about 150m above me.`,
    //possible moves
    { "up" : 3 ,
      "down" : 1,
      "left" : "I get tangled in space junk!",
      "right" : "That was close!"},
    //possible looks
    { "up" : "Open path through which I can make out the shape of spining large object. ",
      "down" : "Open path in the debris that leads to my original location",
      "left": "Tangled mess of ducting and hull",
      "right": "Blinding sun light."},
    //possible Inspects
    {"ducting": "Nothing useful in here",
     "sun" : "I must be loosing my mind. That really hurts my eyes"
    })

cargoBay = new Room(
    "cutoff, tumbling cargo bay",
    `  `,  
    `Mostly empty cargo bay, cutoff from the ISS's main corridor. There is power operated shut access door. In the middle of the room is a robotic arm. Around the room are various cabinets, wall mounted toolbox, and discarded shipping containers. When I peer through the door window, I see that the ISS is about 200m from here`,
    //possible moves
    { "up" : 4,
      "down" : 5,
      "left" : "I am holding onto the the metal truss thats lodged into the hole through which I entered.",
      "right" : 6},
    //possible looks
    { "up" : "Through the window I see the chopped end of the main corridor of the ISS where this cargo bay used to be attached.",
      "down" : "Through the door window I can see the Q.J Airlock of the ISS.",
      "left": "The blast hole through which I have entered the cargo bay. Now its completely blocked.",
      "right": "Through a side window I can see the Science Pod of the ISS"},
    //possible Inspects
    {"containers": " Discarded shipping containers used by the SpaceX suply ships. Not very interesting"
    }
    
    )


    //this is not work in progress *******************************************************
mainCorridor = new Room(
    `main corridor of the ISS`,
    `After a slow climb through maze of debris I am finally entering the main corridor of the ISS through a chasm that used to be the cargo bay. `,
    ` Long narrow corridor. At the far end is a locked door which leads to the ISS crew quarters. `,
    //possible moves
    { "up" : " I am holding onto the the metal truss thats blocking the way I came from" ,
      "down" : 5,
      "left" : 6,
      "right" : 5},
    //possible looks
    { "up" : "This might be the only possible way to go. ",
      "down" : "There is a sharp outer hull piece. I should stay away from it.",
      "left": " ",
      "right": " "},
    //possible Inspects
    {"hull": "This is a piece from the main corridor of the ISS. Its sharp and made of Aluminum"
    }
)

airlock = new Room(
    `Quest Joint Airlock of the ISS`,
    `Quest Joint Airlock ble blallalaalal`,
    `i see the pressure chamber on the other side of hte window`,
    //possible moves
    { "up" : 2 ,
      "down" : "I should not go there",
      "left" : 3},
    //possible looks
    { "up" : "This might be the only possible way to go. ",
      "down" : "There is a sharp outer hull piece. I should stay away from it."},
    //possible Inspects
    {"hull": "This is a piece from the main corridor of the ISS. Its sharp and made of Aluminum"
    }
)

// items (name, description, locked, opens, moves)
let photo1 = new Item(
    `photograph of Wahiba`,
    `Photograph of Wahiba with her newborn baby. The back side of it has a note "- 1995, Khartoum"`,
    null, null, true)

let arm = new Item(
    `severed forearm`,
    `Severed human forearm belonging to crew member Wahiba Buhassan. Wahiba was the reciving specialist and worke d in the cargo bay. The smart watch atteched to the arm displays: BT Pairing.`,
    null, null, true)

let robot = new Item(
    `robotic loading arm`,
    `Floor mounted robotic arm, model iARM2000, used for loading and unloading cargo during docking operations. It is not operational due to loss of power. The robot has a builtin tool storage for automatic tool change. `,
    null, null, null)

let toolStorageRobot = new Item(
    `robotic arm tool storage`,
    `This tool storage is used by the iARM2000 robot to store robot compatible tools`,
    false, true, false,)

let screwdriver = new Item (
    `magnetic Phillips screwdriver`,
    `One of many tools used by the Mechanic personal on ISS`,
    null,null,true)


let toolboxCargoBay = new Item(
    `toolbox in the cargo bay`,
    `Wall mounted toolbox with pin code access panel.`,
    true,true,false)    

let doorCargoBay = new Item(
    `Cargo Bay Entrance door C-I`,
    `This door used to connect the cargo bay to the ships main corridor. It requires power to operate. The access panel has no power. Under the panel is the door control board.`,
    false,true,false)

let fireE = new Item(
    `fire extinguisher`,
    `MicroG Fire Extinguisher. This is a carbon dioxide fire extinguisher developed by NASA to be used in micro gravity enviroments. CAUTION: When used in micro gravity enviroment, it is recommended for the user to be attached to a statonary structure or lean against one. The stream from the nozzle can produce dangerous burst of thrust. Emergency Use Only!`,
    null, null, true)

let keyCard = new Item(
    `Pavlova's Keycard`,
    `This keycard used to belong to a crew member Irina Pavlova. She is a member the Rusian science team onboard of the ISS`,
    null, null, true)

let myPlayer= {
    name: "rene",
    location: "playerSpawn",
    }

// cost of travel if using oxygen tanks 
let o2Cost = {
    "1-2": 23,
    "2-1": 23,
    "2-3": 27,
    "3-4": 32,
    "4-3": 32,
}

// translates numbering to location names
let numberToLocation = {
    1 : "playerSpawn",
    2 : "halfWay",
    3: "cargoBay",
    4: "mainCorridor",
    5: "airlock",
}

//translates location names to coresponding number
let LocationToNumber = {
    "playerSpawn" : 1 ,
    "halfWay" : 2,
    "cargoBay": 3,
    "mainCorridor" : 4,
    "airlock": 5,
}

//location table for accesing location objects key values
let dest = {
    "playerSpawn": playerSpawn,
    "halfWay" : halfWay,
    "cargoBay" : cargoBay,
    "mainCorridor" : mainCorridor,
    "airlock" : airlock
}

//item table for accesing item object key values
let itemTable = {
    "arm" : arm,
    "photo1": photo1,
    "fireE" : fireE,
    "screwdriver" : screwdriver,
    "keyCard": keyCard,
    "robot" : toolStorageRobot,
    "toolboxCargoBay" : toolboxCargoBay,
    "doorCargoBay" : doorCargoBay
}

//alternative item names
let itemNamesTable = {
    "fireE" : ["fire extinguisher","extinguisher","fire"],
    "arm" : ["arm","forearm","severed arm","severed forearm"],
    "screwdriver" : ["screwdriver"],
    "keyCard" : ["keyCard","key card","keycard"],
    "photo1" : ["photo","picture","photograph",]
}

//alternative item names reverse lookup Table
let itemNamesTableReverse = {
    "fire":"fireE",
    "extinguisher":"fireE",
    "fire extinguisher":"fireE",
    "fireE" : "fireE",
    "arm":"arm",
    "forearm":"arm",
    "severed arm":"arm",
    "severed forearm":"arm",
    "screwdriver" : "screwdriver",
    "keyCard" : "keyCard",
    "key card" : "keyCard",
    "keycard"   : "keyCard",
    "photo1":"photo1",
    "photo":"photo1",
    "picture":"photo1",
    "photograph":"photo1",
    "photograph of Wahiba":"photo1",    
}


//this table holds the arrays for the player and room inventories
let inventoryTable = {
    "playerInventory": [],
    "playerSpawn" : [],
    "halfWay": ["arm", "photo1"],
    "cargoBay": ["toolboxCargoBay", "robot", "fireE" , "doorCargoBay" ] ,
    "mainCorridor": ["keycard"],
    "airlock": ["screwdriver"],
        
}

async function help(){
    clearScreen()
    await printSlow(`There si nobody here to help me. I am alone HELP! HELP!`,ms)
    await printSlow(` `,4000)
    await printSlow(`After some time I remember somethings:`,ms)
    await printSlow(`I can 'look aroud' or look in four directions (left, right, up, down) `,ms)
    await printSlow(`I have a inventory for two items `,ms)
    await printSlow(`I can try to move (left, right, up, down)`,ms)
    await printSlow(`       - I might have to 'override oxygen' to be able to move`,ms)
    await printSlow(`I should periodically check on my 'oxygen' levels  `,ms)
    await printSlow(`I can 'inspect' things `,ms)
    await printSlow(`       - e.g 'inspect suit' which gives a comprehensive status of my suit `,ms)
    await printSlow(`I might be able to 'open' something `,ms)
    await printSlow(`I can try to 'take' thing `,ms)
    await printSlow(`If I have something in my inventory I can use it when required or 'drop' it`,ms)
    await printSlow(`If I need a 'hint' i will get one, but I will be penalized.`,ms)
}

//shows a hint of what objects can be interacted with in current location and increases the hint counter
async function hint(){
    hints = hints++
    if (o2Jet[1] == false){ await printSlow(`Try 'how to move' or 'inspect thrusters'.`,ms)}
    else{
        if (inventoryTable[myPlayer.location].length !== 0){
            await printSlow(`I can interact with the following: `,ms)
            for (i in inventoryTable[myPlayer.location]){
                await printSlow(`                               ${itemTable[inventoryTable[myPlayer.location][i]].name} `,ms)
            }
        }
        else {await printSlow(`This place is boring. I can not interact with anything here. Try another place.`)
        }
    }
}

//switches on the oxygen fro thrusters, uses oxy suply
async function override(){
    clearScreen()
    await printSlow(o2Jet[0],ms)
    if (o2Jet[1] == true){
        o2Jet[1]=false
        await printSlow(`Current Status:    ${o2Jet[2]}.`,ms)
}
        else {o2Jet[1]=true    
        await printSlow(`Current Status:    ${o2Jet[3]}.`,ms)
    }
}

//prints oxygen levels
async function oxygen(){
    await printSlow(`My Suits O2 level is at ${o2Level}%.`,ms)
}

//checks if players inventory is empty print the name of the objects in it. before that make sure its not empty
async function inventory(){
    if (inventoryTable.playerInventory.length != 0 ) {
        await printSlow(`In my inventory I have: `,ms)
        for (i in inventoryTable.playerInventory){
            await printSlow(`                       ${itemTable[inventoryTable.playerInventory[i]].name}`,ms)
        }
    }
    else {await printSlow(`My backpack is empty. In my backpack I can fit two items.`,ms)}
}

//prints out suit info, including oxygen level and inventory
async function inspectSuit(){
    clearScreen()
    await printSlow(`My space suit has a small oxygen leak on the left arm sleeve. The puncture could be repaired with space tape.`,ms)
    
    if (o2Jet[1] === true){await printSlow(o2Jet[3],ms)}
        else { await printSlow(o2Jet[2],ms)}
    await printSlow(`My oxygen level is at ${o2Level}%`,ms)
    await printSlow(`- - - - - - - - - - - - -`,ms)
    await inventory()
}

//take function. is called when item is found in location inventory, check if its movable
async function take(item){
    if (itemTable[item].moves){
        //add item to player inventory
        inventoryTable.playerInventory.push(item)

        //remove the item from location inventory
        arr = inventoryTable[myPlayer.location].filter(i => i !== item)
        inventoryTable[myPlayer.location] = arr
    }
}

//drop item function  
async function dropItem(item){
    console.log(item )
    // I def have the item
    //this adds the item to the current location
    inventoryTable[myPlayer.location].push(item)
    console.log(inventoryTable)
    
    // take the item out of players inventory
    arr = inventoryTable.playerInventory.filter(i => i !== item)
    inventoryTable.playerInventory = arr
}

// needs to get done !!!!!!!!!!!!!!!!
async function open(item){

}

async function move(to){
        //first check if move is a number or string from the possible destinations
        //check for thrusters on suit or holding the extinguisher befor allowing the move
        if (inventoryTable.playerInventory.includes(fireE.id) || inventoryTable.playerHand.includes(fireE.id)) {

            //check if to is number or string
            if (typeof (to) === "number" ){
                clearScreen()
                await printSlow ('I am using the fire extinguisher to move around!. Not my O2 suplies YEEEPEEE!',ms)
                myPlayer.location = numberToLocation[to]
                await printSlow(`traveling to new location . . . `,msI)
                clearScreen()
                console.log(dest[myPlayer.location].description)
                await printSlow(myPlayer.location.description,ms)
                await oxygen()
            }
            else {await printSlow(dest[myPlayer.location].possibleMoves[to])
            }
            //if fire extuinguisher is not in players inventory than check if o2Jet is true 
        }
        else {
            if (o2Jet[1] === false){
                // no o2 nomoves allowed override
                await printSlow(o2Jet[2])
            }
            else {
                //if 02 override is ON check id destination is a number or string and proceed
                //if number this wiil cost the oxygen trip cost
                if (typeof(to) === "number" ){
                    clearScreen()
                    await printSlow(o2Jet[3],ms)
                    await printSlow(`traveling to new location . . . `,msI)
                    //get trip o2 cost and calculate the new o2 level
                    tripFromTo = `${LocationToNumber[myPlayer.location]}-${to}`
                    o2Level = o2Level - o2Cost[tripFromTo]
                    myPlayer.location = numberToLocation[to]
                    clearScreen()
                    await printSlow(dest[myPlayer.location].description,ms)
                    await oxygen()
                }
                else {await printSlow(dest[myPlayer.location].possibleMoves[to])
                    }
                }
        }
}

// alll user input goes through here: answer is chceked for multy word or single word
async function action(answer){
    let option = null
    let actionCmd = null
    reply = answer.toLowerCase().trim().split(" ").filter(word => word !="")
    if (reply.length == 1) {
        actionCmd = reply
        actionCmd == "help" ? await help() : 
        actionCmd == "hint" ?   await hint():
        actionCmd == "inventory" || reply == "i" || reply == "hand" ? await inventory() : 
        actionCmd == "oxygen" || reply == "o2" ? await oxygen():
        actionCmd == "open" ? console.log(`open what?`):
        actionCmd == "move" ? console.log(`move where?`): 
        actionCmd == "take" ? console.log(`take what?`): 
        actionCmd == "exit" ? console.log(`thanks for playing`):
        actionCmd == "inspect" ? console.log(`inspect what?`):
        actionCmd == "look" ? console.log(`where?`):
        actionCmd == "w" ? console.log(myPlayer.location):
        actionCmd == "drop" ? console.log(`drop what?`): console.log(`I dont know how to do that`)
    }
    //if two or three words than split them into [action, second third . . .] 
    else {
        actionCmd = reply[0]
        option = reply.slice(1).join(" ")
        //ans is a joined string to be looked up in allowed tables
        ans = actionCmd+" "+option
    
        if (ans == "override oxygen") { await override() }
        
        else if (ans == "inspect suit") { await inspectSuit() }

        else if (ans == "look around" || ans == "inspect space") { await printSlow(dest[myPlayer.location].look,ms)}
        
        else if (ans == "inspect thrusters" || answer == "how to move") {await printSlow(o2Jet[0],ms)}
        
        //check if action is a move and is allowed in current location
        //than check if the allowed destination is a number or string
        //if number send the number value if string send the option
        else if(actionCmd == "move"  && (option in dest[myPlayer.location].possibleMoves)) {
            if (typeof(dest[myPlayer.location].possibleMoves[option]) === "number"){
                await move(dest[myPlayer.location].possibleMoves[option])
            }
            else {await move(option)}
        }

        //check for matching looks
        else if (actionCmd == "look" && (option in dest[myPlayer.location].possibleLooks)){
            {await printSlow(dest[myPlayer.location].possibleLooks[option])}
        }
        
        //drop function checks if item inventory is not empty. if item is in inventory it gets dropped
        else if (actionCmd =="drop") {
            if (inventoryTable.playerInventory.length !== 0) {
                if (inventoryTable.playerInventory.length == 1){
                    if (itemNamesTable[inventoryTable.playerInventory[0]].includes(option)){dropItem(itemNamesTableReverse[option])}
                }
                else if  (inventoryTable.playerInventory.length == 2){
                    if (itemNamesTable[inventoryTable.playerInventory[0]].includes(option) ||
                    itemNamesTable[inventoryTable.playerInventory[1]].includes(option)){
                        dropItem(itemNamesTableReverse[option])
                    }
                }
            }
            else{ console.log(`I do not have that in my inventory`)
            }  
        }

        //take function. first check if I have inventory space
        // then checkif  item is in the room and if it is movable
        // to check for alternative speling for each item in location inventory need a loop
        else if (actionCmd == "take"){
            if (inventoryTable.playerInventory.length == 2){
                await printSlow(`My inventory is full!`,ms)
                await inventory()
            }
            //check if item in room and movable? Check if the room inventory is empty first
            else if (inventoryTable[myPlayer.location].length !== 0){
                //here goes the loop to check if item is in the location invantory with alternative spelling
                let found = false
                for (i in inventoryTable[myPlayer.location]){
                    if (itemNamesTable[inventoryTable[myPlayer.location][i]].includes(option)){found = true}
                }
                if (found){take(itemNamesTableReverse[option])}
            }
            else{console.log(`I cant take ${option}.`)}
            
        }
        else {console.log(`That is not an option`)}
    }
}

async function main(){
    clearScreen()
    //defalt textprint delay in ms , msI is delay for the intro for the intro
    ms = 5
    msI = 15
    await intro()
    let answer = null
    await printSlow(playerSpawn.description,ms)
    while (answer !== 'exit') {
       answer = await ask('\n>_ ')
    clearScreen()
    await action(answer)
    }

    rl.close()
  }
  main()




