// Default Game State
const defaultGameState = {
    currentChapter: "Prologue",
    currentParagraphIndex: 0,
    contactBook: [
        { name: "Abrahamson, Jonathan", age: 24, gender: "Male", appearance: "???", info: ["???", "???", "???", "???"] },
        { name: "Cacciola, Antonio", age: 28, gender: "Male", appearance: "???", info: ["???", "???", "???", "???"] },
        { name: "Hart, Remi", age: 25, gender: "Female", appearance: "???", info: ["???", "???", "???", "???"] },
        { name: "Studersson, Leslie", age: 26, gender: "Female", appearance: "???", info: ["???", "???", "???", "???"] }
    ],
    caseFiles: ["Current Case: ???", "Past Cases: ???"]
};

let gameState = null;
let storyData = { chapters: {} };

// DOM Elements
const textContainer = document.getElementById("story-text");
const choicesContainer = document.getElementById("choices");
const contactBookBtn = document.getElementById("contact-book-btn");
const caseBtn = document.getElementById("case-btn");
const contactBookDiv = document.getElementById("contact-book");
const caseFilesDiv = document.getElementById("case-files");
const contactList = document.getElementById("contact-list");
const caseList = document.getElementById("case-list");

// Load Story from JSON
async function loadStoryFile(filePath) {
    try {
        const response = await fetch(filePath);
        const data = await response.json();
        storyData.chapters = data;
        updateUI();
    } catch (error) {
        alert("Failed to load story file.");
        console.error(error);
    }
}

// Save Game
function saveGame() {
    if (gameState) {
        localStorage.setItem("detectiveGameState", JSON.stringify(gameState));
        alert("Game progress saved!");
    } else {
        alert("Start a new game before saving.");
    }
}

// Load Game
function loadGame() {
    const savedState = localStorage.getItem("detectiveGameState");
    if (savedState) {
        gameState = JSON.parse(savedState);
        alert("Game loaded successfully!");
        updateUI();
    } else {
        alert("No saved game found.");
    }
}

// Start New Game
document.getElementById("new-game").addEventListener("click", () => {
    gameState = { ...defaultGameState };
    updateUI();
});

// Save/Load Buttons
document.getElementById("save-game").addEventListener("click", saveGame);
document.getElementById("load-game").addEventListener("click", loadGame);

// Main Game Renderer
function updateUI() {
    if (!gameState) {
        textContainer.innerText = "Start a new game or load a saved game.";
        choicesContainer.innerHTML = "";
        return;
    }

    const chapterData = storyData.chapters[gameState.currentChapter];
    if (!chapterData) {
        alert("Chapter data not found!");
        return;
    }

    const paragraphs = chapterData.text.split("\n\n");
    textContainer.innerText = paragraphs[gameState.currentParagraphIndex];
    choicesContainer.innerHTML = "";

    if (gameState.currentParagraphIndex >= paragraphs.length - 1) {
        displayChoices();
    }

    updateSidebar();
}

// Next Paragraph
textContainer.addEventListener("click", () => {
    if (!gameState) return;

    const paragraphs = storyData.chapters[gameState.currentChapter].text.split("\n\n");
    if (gameState.currentParagraphIndex < paragraphs.length - 1) {
        gameState.currentParagraphIndex++;
        textContainer.innerText = paragraphs[gameState.currentParagraphIndex];
    } else {
        displayChoices();
    }
});

// Choices Renderer
function displayChoices() {
    choicesContainer.innerHTML = "";
    const chapterData = storyData.chapters[gameState.currentChapter];

    if (chapterData.choices) {
        chapterData.choices.forEach(choice => {
            let button = document.createElement("button");
            button.innerText = choice.text;
            button.addEventListener("click", () => {
                gameState.currentChapter = choice.nextChapter;
                gameState.currentParagraphIndex = 0;

                if (choice.addContact) addContact(choice.addContact);
                if (choice.addCase) addCase(choice.addCase);

                updateUI();
            });
            choicesContainer.appendChild(button);
        });
    }
}

// Sidebar Toggles
contactBookBtn.addEventListener("click", () => contactBookDiv.classList.toggle("hidden"));
caseBtn.addEventListener("click", () => caseFilesDiv.classList.toggle("hidden"));

// Sidebar Renderer
function updateSidebar() {
    contactList.innerHTML = "";
    caseList.innerHTML = "";

    gameState.contactBook.forEach(contact => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${contact.name}:</strong><br>
                        - Age: ${contact.age}<br>
                        - Gender: ${contact.gender}<br>
                        - Appearance: ${contact.appearance}<br>
                        - Info: ${contact.info.join("<br>")}`;
        contactList.appendChild(li);
    });

    gameState.caseFiles.forEach(caseItem => {
        const li = document.createElement("li");
        li.innerText = caseItem;
        caseList.appendChild(li);
    });
}

// Helpers
function addContact(name) {
    if (!gameState.contactBook.find(c => c.name === name)) {
        gameState.contactBook.push({ name, age: "???", gender: "???", appearance: "???", info: ["???", "???", "???", "???"] });
    }
}
function addCase(name) {
    if (!gameState.caseFiles.includes(name)) {
        gameState.caseFiles.push(name);
    }
}

// Load first story file
loadStoryFile("story/prologue.json");