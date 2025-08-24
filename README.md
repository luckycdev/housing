<img src="website/housing.png" width="150" height="150">

# Info
This is a website that displays Hypixel Housing information using the Hypixel API.

* Official instance: https://housing.luckyc.dev

# Installation

1. Get a Hypixel API key from https://developer.hypixel.net/dashboard
2. Install [NodeJS](https://nodejs.org/en/download) (tested on v20.12.2 & npm v10.9.2 but should work on latest)
3. Clone this repo (`git clone https://github.com/luckycdev/housing.git`)
4. Inside of the cloned repos directory (`cd housing`), enter the server directory (`cd server`)
5. Inside of the server directory, run `npm init -y`, and then `npm install`
6. If you are using nginx on linux, create a file in your sites-enabled directory with whatever your domain is, and use [this](https://pastebin.com/raw/0kdcVTg7) __as a reference__ -- you will need to change the lines with comments -- for certs you can use `sudo cerbot --nginx` (tested on nginx ubuntu v1.18.0 & certbot v4.0.0 but should work on latest)
7. Rename the file called `.env.example` in the server directory to `.env`
8. Open the file called `.env` in the server directory. Inside of this file, put your API key found in step 1. (Example contents: `API_KEY=df9sd6f798sd-sdfyse87f6sd-sd89f6sd9f-sd87f678sdf`)
9. To start the backend server, you will simply run `node server.js` inside of the server directory. I recommend you use something like screen to keep the server alive when you close out of your SSH.
<details>
<summary>linux screen tutorial</summary>

Install Screen `sudo apt install screen`
  
Create the screen `screen -S housing`

And then if you want to return to your screen, run `screen -r housing`

If you want to kill your screen, run `screen -X -S housing kill`
</details>
&nbsp;&nbsp;&nbsp;&nbsp;9. The site should be running at the domain and your server should be working!

* Note: if using nginx on linux you may have to run `sudo chmod -R 755 housing` (change the "housing" to the path of your housing directory) for nginx to make the website work (and then maybe `sudo systemctl reload nginx` and/or `sudo systemctl restart nginx`)

### Help can be found at https://discord.gg/AQ4sDF6Mkz

## Roadmap / to-do list
- sorting by player count, cookie count, and recent
- make searching houses too
- make search enter key actually search - maybe an input instead of a textarea idk
- set up a cookie history chart and player history chart etc. for house info pages
- §k support
- make whole site css look a bit nicer
- make house containers insides nicer (like (cookie count) (cookie emoji) and like (player count) (person emoji) and font size and colors etc.)
- save all houses from a user to a cache so when you go to the player it shows all of their houses - check if it still exists before it shows it and if not remove from cache - might need to raise safe rate limit
- make §0 have no text shadow
- check all error msgs showing on pages
- random house button
- investigate house container sometimes showing error for being unable to read username undefined - only seen once
- 32 character house name with no spaces goes outside container - find fix (make smaller if long or something)
- when multiple notifications it teleports up when other goes away but it should slide up smoothly
- loading text after search with no houses - also should show player info still if no houses
- check everything on mobile

### Heavily inspired by the now shut down [housing.menu](https://web.archive.org/web/20240417020435/https://www.housing.menu/)
### Uses [Hypixel API](https://api.hypixel.net), [PlayerDB.co](https://playerdb.co), and [mc-heads.net](https://mc-heads.net)