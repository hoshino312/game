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

let gameState = null; // Game only initializes when a button is clicked
let storyData = { chapters: {} };

// Story Display Elements
const textContainer = document.getElementById("story-text");
const choicesContainer = document.getElementById("choices");

// Sidebar Elements
const contactBookBtn = document.getElementById("contact-book-btn");
const caseBtn = document.getElementById("case-btn");
const contactBookDiv = document.getElementById("contact-book");
const caseFilesDiv = document.getElementById("case-files");
const contactList = document.getElementById("contact-list");
const caseList = document.getElementById("case-list");

// Save Game State to Local Storage
function saveGame() {
    if (gameState) {
        localStorage.setItem("detectiveGameState", JSON.stringify(gameState));
        alert("Game progress saved!");
    } else {
        alert("Start a new game before saving.");
    }
}

// Load Game State from Local Storage
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
    gameState = { ...defaultGameState }; // Reset to default
    updateUI();
});

// Save Game Button
document.getElementById("save-game").addEventListener("click", saveGame);

// Load Saved Game Button
document.getElementById("load-game").addEventListener("click", loadGame);

// Load Story Data & UI Update
const imageElement = document.getElementById("story-image");
const audioElement = document.getElementById("story-audio");

function updateUI() {
    if (!gameState) {
        textContainer.innerHTML = "Start a new game or load a saved game.";
        choicesContainer.innerHTML = "";
        imageElement.classList.add("hidden");
        audioElement.classList.add("hidden");
        return;
    }

    const chapterData = storyData.chapters[gameState.currentChapter];
    if (!chapterData || !chapterData.paragraphs) {
        alert("Chapter data not found!");
        return;
    }

    const paragraphObj = chapterData.paragraphs[gameState.currentParagraphIndex];
    if (!paragraphObj) return;

    let html = '';

    // Tạo 1 story block
    html += `<div class="story-block fade-in">`;

    if (paragraphObj.image) {
        html += `<img src="${paragraphObj.image}" alt="Scene" class="chapter-img">`;
    }

    html += `<p class="story-text">${paragraphObj.text}</p>`;

    if (paragraphObj.audio) {
        html += `<audio src="${paragraphObj.audio}" class="story-audio" autoplay onended="startBackgroundMusic()" style="display:none;"></audio>`;
    }

    html += `</div>`;

    textContainer.innerHTML = html;

    choicesContainer.innerHTML = "";

    if (gameState.currentParagraphIndex >= chapterData.paragraphs.length - 1) {
        displayChoices();
    }

    updateSidebar();
}

function startBackgroundMusic() {
    const bgm = document.getElementById("background-music");
    if (bgm) {
        bgm.muted = false;
        bgm.play();
    }
}



textContainer.addEventListener("click", () => {
    if (!gameState) return;

    const chapterData = storyData.chapters[gameState.currentChapter];
    if (gameState.currentParagraphIndex < chapterData.paragraphs.length - 1) {
        gameState.currentParagraphIndex++;
        updateUI();
    } else {
        displayChoices();
    }
});



// Display Choices
function displayChoices() {
    choicesContainer.innerHTML = ""; // Clear old choices
    const chapterData = storyData.chapters[gameState.currentChapter];

    if (chapterData.choices) {
        chapterData.choices.forEach(choice => {
            let button = document.createElement("button");
            button.innerText = choice.text;
            button.addEventListener("click", () => {
                gameState.currentChapter = choice.nextChapter;
                gameState.currentParagraphIndex = 0;
                
                if (choice.addContact) {
                    addContact(choice.addContact);
                }
                if (choice.addCase) {
                    addCase(choice.addCase);
                }

                updateUI();
            });
            choicesContainer.appendChild(button);
        });
    }
}

// Sidebar Toggle
contactBookBtn.addEventListener("click", () => {
    contactBookDiv.classList.toggle("hidden");
});

caseBtn.addEventListener("click", () => {
    caseFilesDiv.classList.toggle("hidden");
});

// Update Sidebar
function updateSidebar() {
    contactList.innerHTML = "";
    caseList.innerHTML = "";

    gameState.contactBook.forEach(contact => {
        let li = document.createElement("li");
        li.innerHTML = `<strong>${contact.name}:</strong><br>
                        - Age: ${contact.age} years old<br>
                        - Gender: ${contact.gender}<br>
                        - Appearance: ${contact.appearance}<br>
                        - Info: ${contact.info.join("<br>")}`;
        contactList.appendChild(li);
    });

    gameState.caseFiles.forEach(caseItem => {
        let li = document.createElement("li");
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

function loadStoryFile(path) {
    fetch(path)
        .then(response => {
            if (!response.ok) throw new Error("Story file not found");
            return response.json();
        })
        .then(data => {
            storyData = data;
            if (gameState) updateUI(); // If game already running
        })
        .catch(err => {
            console.error("Error loading story file:", err);
            textContainer.innerText = "Failed to load story. Check the console.";
        });
}


// Load first story file
loadStoryFile("story/prologue.json");