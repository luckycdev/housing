fetch('/api/data')
  .then(response => response.json())
  .then(({lastUpdated, data}) => {

    var lastUpdatedTime = new Date(lastUpdated).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: false
    });
    var lastUpdatedTimeDiv = document.createElement('p');
    lastUpdatedTimeDiv.innerText=`Viewing data from: ${lastUpdatedTime}`;
    document.getElementsByClassName('infotext')[0].appendChild(lastUpdatedTimeDiv);

    const output = document.getElementById('output');

    data.forEach(house => {
      const div = document.createElement('div');
      div.className = 'housecontainer';
        
      fetch(`https://playerdb.co/api/player/minecraft/${house.owner}`, {
        headers: {
          'User-Agent': 'housing.luckyc.dev'
        }})
      .then(response => response.json())
      .then(data => {
        const username = data.data.player.username;
        const headimg = 'https://mc-heads.net/head/'+house.owner;
        
        const smallCapsMap = {'\u1D00': 'A', '\u0299': 'B', '\u1D04': 'C', '\u1D05': 'D', '\u1D07': 'E', '\uA730': 'F', '\u0262': 'G', '\u029C': 'H', '\u026A': 'I', '\u1D0A': 'J', '\u1D0B': 'K', '\u029F': 'L', '\u1D0D': 'M', '\u0274': 'N', '\u1D0F': 'O', '\u1D18': 'P', '\u024A': 'Q', '\u0280': 'R', '\uA731': 'S', '\u1D1B': 'T', '\u1D1C': 'U', '\u1D20': 'V', '\u1D21': 'W', '\u028F': 'Y', '\u1D22': 'Z'};

        const cleanName = house.name
            .replace(/\u00A7k/g, "")//removes all §k (TODO add §k support)
            .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))//remove full width text
            .split('')
            .map(c => smallCapsMap[c] || c)//remove small caps text
            .join('');
        const coloredName = cleanName.replaceColorCodes();
        const rawDate = new Date(house.createdAt).toLocaleString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: false
        });
        const createdDate = rawDate.replace(/,/g, '<br>');

      div.innerHTML = `
        <p class='small'>${createdDate}</p>
        <p class="clickable-copy" onclick="copyText(this)">/visit ${username} <i class="fa-regular fa-clipboard"></i></p>
        <img class='headimg' src="${headimg}">
        <p class="coloredname"></p>
        <p>${house.players} players</p>
        <p>${house.cookies.current} cookies</p>
      `;
      div.querySelector(".coloredname").appendChild(coloredName);
      document.getElementById("preoutput").hidden = 1;
      output.appendChild(div);
    })});
})
  .catch(err => {
    console.error('Failed to fetch:', err);
  });


function copyText(el) {
    const text = el.textContent.trim();
    navigator.clipboard.writeText(text)
        .catch(err => console.error('Copy failed', err));
}

function toggleInfo() {
    var infotext = document.getElementsByClassName("infotext")[0];
    infotext.hidden = !infotext.hidden;
}
