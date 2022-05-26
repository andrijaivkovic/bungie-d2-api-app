# Bungie's Destiny 2 API App

This project is a **WORK IN PROGRESS** web app that is used to look<br> up info about the  searched player in Bungie's video game: **Destiny 2.**<br>
<br>
All of the player data is retrieved from Bungie's API.
<br>
<br>
App is developed using vanilla Javascript, HTML and CSS.<br><br>
**MVC** _(Model-View-Controller)_ pattern is used for developing this application<br>
because I see it as the best fit for this kind of application.

This project makes use of it's sister project https://github.com/andrijaivkovic/bungie-d2-manifest-server <br>
that is an API used to get data about various in-game items from Bungie's Manifest file (an SQL database)<br>
This is also possible using Bungie's API but is much slower that the local solution mentioned above.<br>

To make this app fully indepentent change the "LOCAL_URL" variable in "src/js/config.js" file to the commented value.

# Features:
## Account Info
1) Active Triumph Score<br>
2) Total Time Played<br>
3) Season Pass Level<br>
4) Last Time Seen Online

## Character Info Cards
1) Character's Currenly Equipped Emblem
2) Character's Class, Gender and Race
3) Time Played On Each Character
4) Power Level For Each Character
5) Currenly Equipped Seal
6) Character's Current Equipment

### Character Equipment
Character's equipment is separated in three different categories:
1) Weapons (this is the default category)
2) Armor
3) Miscellaneous

Each item in each category has it's icon, seasonal border, rarity & item type, and level displayed.

## Item View (WIP)
This feature is still in progress and works only on select types of items (exotic & legendary armor)

By clicking on any of the items displayed on character cards you can open an overlay that displays<br>
details about the selected items. This includes the item's icon, name, stats, perks, mods and such.

# Limitations
1) App is not fully responsive yet 
2) Users can only (for now) search for players playing on Steam platform

# TODO
1) Clean-up CSS
2) Fully implement Item View overlay
3) Clean-up Javascript


