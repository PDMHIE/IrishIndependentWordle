let englishDictionary
let irishDictionary

let targetWords
let targetWord
fetchJSON()

const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 500

const languageBadge = document.querySelector("[data-language-badge]")
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")

async function fetchJSON() {
    try {
        const response1 = await fetch('targetWords.json');
        targetWords = await response1.json();

        const response2 = await fetch('englishDictionary.json');
        englishDictionary = await response2.json();

        const response3 = await fetch('irishDictionary.json');
        irishDictionary = await response3.json();

        const offsetFromData = new Date(2022, 0, 1)
        const msOffset = Date.now() - offsetFromData
        const dayOffset = msOffset / 1000 / 60 / 60 / 24
        const targetEntry = targetWords[Math.floor(dayOffset + 0) % targetWords.length];
        targetWord = targetEntry.word

        startInteraction()
        showBadge(targetEntry.tag)
    } catch (error) {
        console.error('Error reading JSON file:', error);
    }
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
    const targetWordsDictionary = targetWords.map(entry => entry.word) 
    const validWord = englishDictionary.includes(guess) || irishDictionary.includes(guess) || targetWordsDictionary.includes(guess)

    if (!validWord) {
        showAlert("Not in word list")
        shakeTiles(activeTiles)
        return
    }

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
        } else if (targetWord.includes(letter)) {
            tile.dataset.state = "wrong-location"
            key.classList.add("wrong-location")
        } else {
            tile.dataset.state = "wrong"
            key.classList.add("wrong")
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

function showBadge(tag) {
    languageBadge.replaceChildren()

    const badge = document.createElement("img")
    badge.src = tag === "irish" ? "irish-badge.svg" : "english-badge.svg"
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
        return
    }

    const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])")
    if (remainingTiles.length === 0) {
        showAlert(targetWord.toUpperCase(), null)
        stopInteraction();
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
