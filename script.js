let englishDictionary
let irishDictionary

let targetWords
let targetWordNumber
let targetWord

fetchCSV()

let lastPage
let gameState = {
    letters: [],
    attempts: 0,
    progress: "in-progress"
}

const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const languageBadge = document.querySelector("[data-language-badge]")
const keyboard = document.querySelector("[data-keyboard]")
const guessGrid = document.querySelector("[data-guess-grid]")

const alertContainer = document.querySelector("[data-alert-container]")
const statsAlertContainer = document.querySelector("[data-stats-alert-container]")

async function fetchCSV() {
    try {
        const responseCSV = await fetch('Focail_Dictionary.csv');
        const csvText = await responseCSV.text();
        targetWords = parseCSV(csvText);

        const response2 = await fetch('englishDictionary.json');
        englishDictionary = await response2.json();

        const response3 = await fetch('irishDictionary.json');
        irishDictionary = await response3.json();

        const offsetFromData = new Date(2022, 0, 1)
        const msOffset = Date.now() - offsetFromData
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        const targetIndex = Math.floor(dayOffset + 0) % targetWords.length
        const targetEntry = targetWords[targetIndex];
        targetWordNumber = targetEntry.Number
        targetWord = targetEntry.Word.toLowerCase()

        showBadge(targetEntry.Status)
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
}

function parseCSV(csv) {
    const lines = csv.split('\n');
    const headers = lines[0].split(',');

    const result = lines.slice(1).map(line => {
        const values = line.split(',');
        const obj = {};
        headers.forEach((header, index) => {
            obj[header.trim()] = values[index].trim();
        });
        return obj;
    });

    return result;
}

function startInteraction() {
    document, addEventListener("click", handleMouseClick)
    document, addEventListener("keydown", handleKeyPress)

    selectNextTile()
}

function stopInteraction(){
    document, removeEventListener("click", handleMouseClick)
    document, removeEventListener("keydown", handleKeyPress)

    deselectAllTiles()
}

function selectNextTile() {
    deselectAllTiles()

    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH) return
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    if (nextTile === null) return;
    
    nextTile.dataset.state = "next"
}

function deselectAllTiles(){
    const selectedTiles = guessGrid.querySelectorAll('[data-state="next"]')
    selectedTiles.forEach(tile => {
        delete tile.dataset.state
    })
}

function handleMouseClick(e) {
    if (e.target.matches("[data-key]")) {
        pressKey(e.target.dataset.key)
        return
    }

    if (e.target.matches("[data-enter]")) {
        submitGuess()
        return
    }

    if (e.target.matches("[data-delete]")) {
        deleteKey()
        return
    }
}

function handleKeyPress(e) {
    if (e.key === "Enter") {
        submitGuess()
        return
    }

    if (e.key === "Backspace" || e.key === "Delete") {
        deleteKey()
        return
    }

    if (e.key.match(/^[a-z]$/)) {
        pressKey(e.key)
        return
    }
}

function pressKey(key) {
    const activeTiles = getActiveTiles()
    if (activeTiles.length >= WORD_LENGTH) return
    const nextTile = guessGrid.querySelector(":not([data-letter])")
    nextTile.dataset.letter = key.toLowerCase()
    nextTile.textContent = key
    nextTile.dataset.state = "active"

    selectNextTile()
}

function deleteKey() {
    const activeTiles = getActiveTiles()
    const lastTile = activeTiles[activeTiles.length - 1]
    if (lastTile == null) return
    lastTile.textContent = ""
    delete lastTile.dataset.state
    delete lastTile.dataset.letter

    selectNextTile()
}

function submitGuess() {
    const activeTiles = [...getActiveTiles()]
    if (activeTiles.length != WORD_LENGTH) {
        showAlert("Not enough letters")
        shakeTiles(activeTiles)
        return
    }

    const guess = activeTiles.reduce((word, tile) => {
        return word + tile.dataset.letter
    }, "")

    // Could alternatively sort to only allow the use of irish words to guess the irish wordle, and english words to guess the english wordle
    const targetWordsDictionary = targetWords.map(entry => entry.Word.toLowerCase()) 
    const validWord = englishDictionary.includes(guess) || irishDictionary.includes(guess) || targetWordsDictionary.includes(guess)

    if (!validWord) {
        showAlert("Not in word list")
        shakeTiles(activeTiles)
        return
    }

    gameState.attempts += 1
    stopInteraction()
    activeTiles.forEach((...params) => flipTile(...params, guess))
}

function flipTile(tile, index, array, guess) {
    const letter = tile.dataset.letter
    const key = keyboard.querySelector(`[data-key="${letter}"i]`)
    setTimeout(() => {
        tile.classList.add("flip")
    }, index * FLIP_ANIMATION_DURATION / 2)

    tile.addEventListener("transitionend", () => {
        tile.classList.remove("flip")
        if (targetWord[index] === letter) {
            tile.dataset.state = "correct"
            key.classList.add("correct")
            gameState.letters.push({letter: letter, state: "correct"})
        } else if (targetWord.includes(letter)) {
            tile.dataset.state = "wrong-location"
            key.classList.add("wrong-location")
            gameState.letters.push({ letter: letter, state: "wrong-location" })
        } else {
            tile.dataset.state = "wrong"
            key.classList.add("wrong")
            gameState.letters.push({ letter: letter, state: "wrong" })
        }

        if (index === array.length - 1) {
            tile.addEventListener("transitionend", () => {
                startInteraction()
                checkWinLose(guess, array)
            }, {once: true})
        }
    }, {once: true})
}

function getActiveTiles() {
    return guessGrid.querySelectorAll('[data-state="active"]')
}

function showAlert(message, duration = 1000) {
    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")
    alertContainer.prepend(alert)
    if (duration == null) return

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showShareAlert(message, duration = 1000) {
    const alerts = document.querySelectorAll('.alert')

    alerts.forEach((alert) => {
        alert.remove()
    })

    const alert = document.createElement("div")
    alert.textContent = message
    alert.classList.add("alert")

    statsAlertContainer.append(alert)

    setTimeout(() => {
        alert.classList.add("hide")
        alert.addEventListener("transitionend", () => {
            alert.remove()
        })
    }, duration)
}

function showBadge(tag) {
    languageBadge.replaceChildren()

    const badge = document.createElement("img")
    badge.src = tag === "As gaeilge inniu" ? "irish-badge.svg" : "english-badge.svg"
    badge.classList.add("badge")

    languageBadge.appendChild(badge)
}

function shakeTiles(tiles) {
    tiles.forEach(tile => {
        tile.classList.add("shake")
        tile.addEventListener("animationend", () => {
            tile.classList.remove("shake")
        }, {once: true})
    });
}

function checkWinLose(guess, tiles) {
    if (guess === targetWord) {
        showAlert("You Win", 5000)
        danceTiles(tiles)
        stopInteraction()
        gameState.progress = "won"
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
        showAlert(targetWord.toUpperCase(), null)
        stopInteraction();
        gameState.progress = "lost"
    }
}

function danceTiles(tiles) {
    tiles.forEach((tile, index) => {
        setTimeout(() => {
            tile.classList.add("dance")
            tile.addEventListener("animationend", () => {
                tile.classList.remove("dance")
            }, { once: true })
        }, (index * DANCE_ANIMATION_DURATION) / 5)
    });
}

function showLast() {
    showPage(lastPage)
}

function showPage(pageId) {
    const oldPage = document.querySelector('.page.active').id

    const pages = document.querySelectorAll('.page')
    pages.forEach(page => {
        page.classList.remove('active')
    })
    stopInteraction()

    document.getElementById(pageId).classList.add('active')
    if (pageId === "game" && gameState.progress === "in-progress") startInteraction()
    else if (pageId === "stats") {
        populateStatistics()
        populateDistribution()
    }
    
    lastPage = oldPage
}

function populateStatistics() {
    const statistics = document.querySelectorAll('.statistic')

    statistics.forEach((stat, index) => {
        const data = stat.querySelector('.statistic-data')
        const label = stat.querySelector('.statistic-label')

        data.textContent = index
        label.textContent = "Dummy statistic label"
    })
}

function populateDistribution() {
    const statBars = document.querySelectorAll('.stat-bar')

    statBars.forEach((bar, index) => {
        bar.textContent = index

        bar.style.width = 1 + ((index / 5) * 16) + "em"

        if (index === 5) bar.classList.add('last')
        else bar.classList.remove('last')
    })
}

function pressShare() {
    if (gameState.progress === "in-progress") {
        showShareAlert("Complete the puzzle to share")
        return
    } 

    let textToCopy = "Focail " + targetWordNumber + " " + gameState.attempts + "/6\n\n"

    gameState.letters.forEach((tile, index) => {
        switch (tile.state) {
            case "wrong":
                textToCopy += "⬛"
                break;
            case "wrong-location":
                textToCopy += "🟨"
                break;
            case "correct":
                textToCopy += "🟩"
                break;
        }

        let letterNumber = index + 1
        if (letterNumber % 5 === 0  && letterNumber != gameState.letters.length) textToCopy += "\n"
    })

    navigator.clipboard.writeText(textToCopy)

    showShareAlert("Coppied to clipboard")
}
