const YOUR_DOMAIN = 'github.com/luckycdev/housing';

function getDate(date) {
  return new Date(date).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: false
  });
}

async function getRankedName(uuid) {
  try {
  const response = await fetch(`/api/playerinfo/${uuid}`)//TODO error codes - important bc rate limit will just say "failed to fetch player data" :(
  if (!response.ok) {
    throw new Error (`Error fetching player info: ${response.status} ${response.statusText}`);
  }
  const playerData = await response.json();

    const username = playerData.player.playername;
    const rank = playerData.player.newPackageRank;//todo monthlypackagerank
    const plusColorString = playerData.player.rankPlusColor;
    const plusColorMap = new Map([["BLACK", "\u00A70"], ["DARK_BLUE", "\u00A71"], ["DARK_GREEN", "\u00A72"], ["DARK_AQUA", "\u00A73"], ["DARK_RED", "\u00A74"], ["DARK_PURPLE", "\u00A75"], ["GOLD", "\u00A76"], ["GRAY", "\u00A77"], ["DARK_GRAY", "\u00A78"], ["BLUE", "\u00A79"], ["GREEN", "\u00A7a"], ["AQUA", "\u00A7b"], ["RED", "\u00A7c"], ["LIGHT_PURPLE", "\u00A7d"], ["YELLOW", "\u00A7e"], ["WHITE", "\u00A7f"]]);
    
    const plusDisplay = plusColorMap.get(plusColorString) || "\u00A7c";
    
    let rankedName = username;
//todo if no rank then rest else if //todo monthlypackagerank superstar - also monthly color
    switch (rank) {
      case "MVP_PLUS":
        rankedName = `\u00A7b[MVP${plusDisplay}+\u00A7b] ${username}`;
        break;
      case "MVP":
        rankedName = `\u00A7b[MVP] ${username}`;
        break;
      case "VIP_PLUS":
        rankedName = `\u00A7a[VIP\u00A76+\u00A7a] ${username}`;
        break;
      case "VIP":
        rankedName = `\u00A7a[VIP] ${username}`;
        break;
    }
    
    return rankedName.replaceColorCodes();
  } catch (error) {
    console.error("Failed to get ranked name:", error);
    return "Error";
  }
}

function getCleanName(name) {
  const smallCapsMap = {'\u1D00': 'A', '\u0299': 'B', '\u1D04': 'C', '\u1D05': 'D', '\u1D07': 'E', '\uA730': 'F', '\u0262': 'G', '\u029C': 'H', '\u026A': 'I', '\u1D0A': 'J', '\u1D0B': 'K', '\u029F': 'L', '\u1D0D': 'M', '\u0274': 'N', '\u1D0F': 'O', '\u1D18': 'P', '\u024A': 'Q', '\u0280': 'R', '\uA731': 'S', '\u1D1B': 'T', '\u1D1C': 'U', '\u1D20': 'V', '\u1D21': 'W', '\u028F': 'Y', '\u1D22': 'Z'};

  const cleanName = "\u00A7a" + name //add a §a to the start of the name to make it lime instead of black
      .replace(/[<>]/g, '') //removes all < and > (was showing up as invisible, TODO add proper fix where it still shows the characters)
      .replace(/\u00A7k/g, "") //removes all §k (TODO add §k support)
      .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)) //remove full width text
      .split('')
      .map(c => smallCapsMap[c] || c) //remove small caps text
      .join('');
  return cleanName.replaceColorCodes();
}

function getActive() {
  const output = document.getElementById('activeOutput');
  const container = document.createElement('div');

  fetch('/api/active')
    .then(response => {
      if (response.status === 403) throw new Error("Hypixel API key is invalid or missing");
      if (response.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
      if (response.status === 430) throw new Error("Rate limit reached, please try again later");
      if (response.status === 404) throw new Error("Unable to fetch houses");
      if (!response.ok) throw new Error(`Unexpected error: ${response.status}`);
      return response.json();
    })
    .then(({lastUpdated, data}) => {

      var lastUpdatedTime = getDate(lastUpdated);
      var lastUpdatedTimeDiv = document.createElement('p');
      lastUpdatedTimeDiv.innerText=`Viewing data from: ${lastUpdatedTime}`;
      document.getElementsByClassName('infotext')[0].appendChild(lastUpdatedTimeDiv);

      data.forEach(house => {
        const div = document.createElement('div');
        div.className = 'housecontainer';

        fetch(`https://playerdb.co/api/player/minecraft/${house.owner}`, {//TODO switch off playerdb and use hypixel playerinfo playername - for active i didnt do it because it would be a ton of requests
          headers: {
            'User-Agent': YOUR_DOMAIN
          }})
        .then(response => response.json())
        .then(data => {
          const username = data.data.player.username;
          const headimg = 'https://mc-heads.net/head/'+house.owner;

        div.innerHTML = `
          <p class='small nocursor'>${getDate(house.createdAt).replace(/,/g, '<br>')}</p>
          <p class="clickable-copy" onclick="copyText(this)">/visit ${username} <i class="fa-regular fa-clipboard"></i></p>
          <a href="player/?${house.owner}"><img class='headimg' src="${headimg}"></a>
          <a class="nodecoration" href="house/?${house.uuid}"><p class="coloredname"></p></a>
          <p class="nocursor">${house.players} players</p>
          <p class="nocursor">${house.cookies.current} cookies</p>
        `;
        div.querySelector(".coloredname").appendChild(getCleanName(house.name));
        document.getElementsByClassName("preoutput")[0].hidden = true;
        output.appendChild(div);
      })
      .catch(err => {
        div.innerHTML = `Error loading player data: ${err.message}`;
        output.appendChild(div);
      });
    });
  })
    .catch(err => {
      container.innerHTML = `Error loading active houses: ${err.message}`;
      output.appendChild(container);
    });
}

async function getHouseData(houseId) {
  const output = document.getElementById('houseOutput');
  const container = document.createElement('div');

  try {
    const res = await fetch(`/api/house/${houseId}`);
    if (res.status === 403) throw new Error("Hypixel API key is invalid or missing");
    if (res.status === 404) {
      const data = await res.json();
      if (data.cause === "No result was found") {
        throw new Error("No result was found for this house");
      }
      throw new Error("House not found.");
    }
    if (res.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
    if (res.status === 430) throw new Error("Rate limit reached, please try again later");
    if (!res.ok) throw new Error(`Unexpected error: ${res.status}`);

    const house = await res.json();

    const playerRes = await fetch(`/api/playerinfo/${house.owner}`);
    if (!playerRes.ok) throw new Error("Failed to fetch player data");

    const rankedname = await getRankedName(house.owner);
    const headimg = 'https://mc-heads.net/head/' + house.owner;

    container.innerHTML = `
      <div class="individualhouseinfo">
        <p class='small nocursor'>${getDate(house.createdAt).replace(/,/g, '<br>')}</p>
        <p class="individualcoloredname"></p>
        <p><strong>Owner: </strong><a class="coloredname nodecoration" href="../player/?${house.owner}"><span class="rankedname"></span></a></p>
        <a href="../player/?${house.owner}"><img src="${headimg}" class="househeadimg"></a>
        <p><strong>Players:</strong> ${house.players}</p>
        <p><strong>Cookies:</strong> ${house.cookies.current}</p>
      </div>
    `;
    container.querySelector(".individualcoloredname").appendChild(getCleanName(house.name));
    container.querySelector(".rankedname").appendChild(rankedname);
    document.getElementsByClassName("preoutput")[0].hidden = true;
    output.appendChild(container);
  } catch (err) {
    container.innerHTML = `Error loading house data: ${err.message}`;
    output.appendChild(container);
  }
}
async function getPlayerData(playerId) {//TODO check if foreach works. i think it does
  const output = document.getElementById('playerOutput');

  try {
    const res = await fetch(`/api/houses/${playerId}`);
    if (res.status === 403) throw new Error("Hypixel API key is invalid or missing");
    if (res.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
    if (res.status === 430) throw new Error("Rate limit reached, please try again later");
    if (res.status === 404) throw new Error("Unable to fetch player info");
    if (!res.ok) throw new Error(`Unexpected error: ${res.status}`);

    const houses = await res.json();
    if (!houses.length) {
      output.innerHTML = 'No houses found for this player';
      return;
    }

    const playerDataRes = await fetch(`/api/playerinfo/${playerId}`);
    if (!playerDataRes.ok) throw new Error("Failed to fetch player data");

    const rankedname = await getRankedName(playerId);
    const headimg = 'https://mc-heads.net/head/' + playerId;

    const playerInfo = document.createElement('div');
    playerInfo.className = 'playerinfo';
    playerInfo.innerHTML = `
      <h2 class="rankedname"></h2>
      <img src="${headimg}" alt="Player head">
    `;
    output.appendChild(playerInfo);
    playerInfo.querySelector(".rankedname").appendChild(rankedname);

    houses.forEach(house => {
      const houseContainer = document.createElement('div');
      houseContainer.className = 'houseinfo';
      houseContainer.innerHTML = `
        <a class="nodecoration" href="../house/?${house.uuid}"><span class="coloredname"></span></a>
        <p><strong>Players:</strong> ${house.players}</p>
        <p><strong>Cookies:</strong> ${house.cookies.current}</p>
        <p><strong>Created At:</strong> ${getDate(house.createdAt)}</p>
      `;
      houseContainer.querySelector(".coloredname").appendChild(getCleanName(house.name));
      output.appendChild(houseContainer);
    });

    document.getElementsByClassName("preoutput")[0].hidden = true;
  } catch (err) {
    output.innerHTML = `Error loading player data: ${err.message}`;
  }
}

function copyText(el) {
    const text = el.textContent.trim();
    navigator.clipboard.writeText(text)
        .catch(err => console.error('Copy failed', err));
}

function toggleInfo() {
    var infotext = document.getElementsByClassName("infotext")[0];
    infotext.hidden = !infotext.hidden;
}