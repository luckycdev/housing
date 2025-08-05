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
  fetch('/api/active')
    .then(response => {
      if (response.status === 403) throw new Error('Hypixel API key is invalid or missing');
      if (response.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
      if (response.status === 430) throw new Error("Rate limit reached, please try again later");
      if (!response.ok) throw new Error(`Unexpected error: ${response.status}`);
      return response.json();
    })
    .then(({lastUpdated, data}) => {

      var lastUpdatedTime = getDate(lastUpdated);
      var lastUpdatedTimeDiv = document.createElement('p');
      lastUpdatedTimeDiv.innerText=`Viewing data from: ${lastUpdatedTime}`;
      document.getElementsByClassName('infotext')[0].appendChild(lastUpdatedTimeDiv);

      const output = document.getElementById('activeOutput');

      data.forEach(house => {
        const div = document.createElement('div');
        div.className = 'housecontainer';

        fetch(`https://playerdb.co/api/player/minecraft/${house.owner}`, {
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
          <a href="house/?${house.uuid}"><p class="coloredname"></p></a>
          <p class="nocursor">${house.players} players</p>
          <p class="nocursor">${house.cookies.current} cookies</p>
        `;
        div.querySelector(".coloredname").appendChild(getCleanName(house.name));
        document.getElementsByClassName("preoutput")[0].hidden = true;
        output.appendChild(div);
      })});
  })
    .catch(err => {
      console.error('Failed to fetch:', err.message);
    });
}

function getHouseData(houseId) {
  const output = document.getElementById('houseOutput');
  const container = document.createElement('div');

  fetch(`/api/house/${houseId}`)
    .then(res => {
      if (res.status === 403) throw new Error("Hypixel API key is invalid or missing");
      if (res.status === 404) return res.json().then(data => {
        if (data.cause === "No result was found") {
          throw new Error("No result was found for this house");
        }
        throw new Error("House not found.");
      });
      if (res.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
      if (res.status === 430) throw new Error("Rate limit reached, please try again later");
      if (!res.ok) throw new Error(`Unexpected error: ${res.status}`);
      return res.json();
    })
    .then(house => {
      fetch(`https://playerdb.co/api/player/minecraft/${house.owner}`, {
        headers: {
          'User-Agent': YOUR_DOMAIN
        }
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to fetch player data");
          return response.json();
        })
        .then(playerData => {
          const username = playerData.data.player.username;
          const headimg = 'https://mc-heads.net/head/' + house.owner;

          container.innerHTML = `
            <div class="houseinfo">
              <h2 class="coloredname"></h2>
              <p><strong>Owner:</strong> ${username}</p>
              <img src="${headimg}">
              <p><strong>Players:</strong> ${house.players}</p>
              <p><strong>Cookies:</strong> ${house.cookies.current}</p>
              <p><strong>Created At:</strong> ${getDate(house.createdAt)}</p>
            </div>
          `;
          container.querySelector(".coloredname").appendChild(getCleanName(house.name));
          document.getElementsByClassName("preoutput")[0].hidden = true;
          output.appendChild(container);
        })
        .catch(err => {
          container.innerHTML = `Error loading player data: ${err.message}`;
        });
    })
    .catch(err => {
      container.innerHTML = `Error loading house data: ${err.message}`;
    });
}

function getPlayerData(playerId) {//TODO foreach house not working?
  const output = document.getElementById('playerOutput');
  const container = document.createElement('div');

  fetch(`/api/houses/${playerId}`)
    .then(res => {
      if (res.status === 403) throw new Error("Hypixel API key is invalid or missing");
      if (res.status === 429) throw new Error("Hypixel rate limit reached, please try again later");
      if (res.status === 430) throw new Error("Rate limit reached, please try again later");
      if (!res.ok) throw new Error(`Unexpected error: ${res.status}`);
      return res.json();
    })
    .then(houses => {
      if (!houses.length) {
        output.innerHTML = 'No houses found for this player';
        return;
      }

      fetch(`https://playerdb.co/api/player/minecraft/${playerId}`, {
        headers: { 'User-Agent': YOUR_DOMAIN }
      })
        .then(response => {
          if (!response.ok) throw new Error("Failed to fetch player data");
          return response.json();
        })
        .then(playerData => {
          const username = playerData.data.player.username;
          const headimg = 'https://mc-heads.net/head/' + playerId;

          const playerInfo = document.createElement('div');
          playerInfo.className = 'playerinfo';
          playerInfo.innerHTML = `
            <h2>${username}</h2>
            <img src="${headimg}" alt="Player head">
          `;
          output.appendChild(playerInfo);

          houses.forEach(house => {
            container.className = 'houseinfo';
            container.innerHTML = `
              <h3 class="coloredname"></h3>
              <p><strong>Players:</strong> ${house.players}</p>
              <p><strong>Cookies:</strong> ${house.cookies.current}</p>
              <p><strong>Created At:</strong> ${getDate(house.createdAt)}</p>
            `;
            container.querySelector(".coloredname").appendChild(getCleanName(house.name));
            output.appendChild(container);
          });

          document.getElementsByClassName("preoutput")[0].hidden = true;
        })
        .catch(err => {
          output.innerHTML = `Error loading player data: ${err.message}`;
        });
    })
    .catch(err => {
      output.innerHTML = `Error loading houses data: ${err.message}`;
    });
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