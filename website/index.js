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
        
        const smallCapsMap = {'ᴀ': 'a', 'ʙ': 'b', 'ᴄ': 'c', 'ᴅ': 'd', 'ᴇ': 'e', 'ꜰ': 'f', 'ɢ': 'g', 'ʜ': 'h', 'ɪ': 'i', 'ᴊ': 'j', 'ᴋ': 'k', 'ʟ': 'l', 'ᴍ': 'm', 'ɴ': 'n', 'ᴏ': 'o', 'ᴘ': 'p', 'ǫ': 'q', 'ʀ': 'r', 'ꜱ': 's', 'ᴛ': 't', 'ᴜ': 'u', 'ᴠ': 'v', 'ᴡ': 'w', 'ʏ': 'y', 'ᴢ': 'z', 'ᴬ': 'A', 'ᴮ': 'B', 'ᴰ': 'D', 'ᴱ': 'E', 'ᴳ': 'G', 'ᴴ': 'H', 'ᴵ': 'I', 'ᴶ': 'J', 'ᴷ': 'K', 'ᴸ': 'L', 'ᴹ': 'M', 'ᴺ': 'N', 'ᴼ': 'O', 'ᴾ': 'P', 'ᴿ': 'R', 'ᵀ': 'T', 'ᵁ': 'U', 'ⱽ': 'V', 'ᵂ': 'W'};
        function smallCapsToNormal(str) {
          return str.split('').map(c => smallCapsMap[c] || c).join('');
        }

        const cleanName = house.name
            .replace(/§./g, '')//remove color codes //TODO add colors
            .replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))//remove full width text
            .split('')
            .map(c => smallCapsMap[c] || c)//remove small caps text
            .join('');
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
        <p>Name: ${cleanName}</p>
        <p>Players: ${house.players}</p>
        <p>Cookies: ${house.cookies.current}</p>
      `;
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
