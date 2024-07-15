Summary:
    This is a file that compiles a handful of notes to make testing the implementation easier, and provides some questions and needs that will help us wrap things up.

Notes on Implementation:
    This is currently a single HTML doc, with a handful of files. The structure can be adjusted based on what is needed, or what framework is being used.
    If there are any scaling issues when attempting implementation let us know and we can make changes as needed.
    If you need to update the target words list, this is read from the "Focail_Dictionary.csv" file, but requires the same format, and spellings of the headings provided.

Needs:
    We need several SVGs for specific icons found throughout: share-icon, stats-menu-button, info-menu-button: MHIE to supply
    We need dictionaries that include all valid irish, and english words (this can be provided an any format you would like, we will update the parsing accordingly) - Are the dictionaries supplied okay

Questions: 
    1) The stats menu can be navigated to from both the info page, and the game page, and there is an "X" to close it.  Should this menu send users back to the info page, or back to the last page they were on (this is how it is currently implemented)?: As is please
    2) The HTML doc currently tracks the state of the game, and uses it to implement the share button, but also could use it to import state from outside. Are you going to track the game state for users, to prevent reloading to get more guesses? Yes please, can you arrange this?
    3) When the user revisits the page after failing or completing a puzzle, are they allowed back onto the game screen, and if so do we need to sync the state with their last attempt? Yes they are. Can you mirror the NYT approach here. A message appears and says 'Failte, you've made x of 6 guesses! Keep going'
    4) When the user completes the level, where do we need to report the data so you can update your accounts? - Can you advise what should happen here so that the stats page updates for each device? Our developer thinks that we could probably use GA if required. Ethan would need to raise an event which can be listened by our scripts.  Based on the events fired, our scripts can record UserID, completed stats, etc.
    5) Where is the cumulative data for the stats menu fetched from, and what format will it be sent in? - As per previous question
