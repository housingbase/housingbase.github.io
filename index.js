const YOUR_DOMAIN = 'bytebukkit.github.io/local';

function getDate(date) {
  if(date == 0) {
    return "Unknown";
  }
  else {
    return new Date(date).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  }
}

function searchPlayer(name) {//todo one search function for players and houses, maybe a search page dedicated to results
  fetch(`https://playerdb.co/api/player/minecraft/${name}`, {//playerdb already makes it not search when there is no uuid, but maybe add my own safeguard idk
    headers: {
      'User-Agent': YOUR_DOMAIN
    }})
  .then(response => response.json())
  .then(data => {
    const uuid = data.data.player.raw_id;
    location.assign("/player/?" + uuid);//TODO fix for if hosting not on root, example: domain.com/website/ will bring to domain.com/website/player/?uuid not domain.com/player/?uuid
  })
}

async function getRankedName(uuid) {
  try {
  const response = await fetch(`https://housing-server-8aec.onrender.com/api/playerinfo/${uuid}`)//TODO error codes - important bc rate limit will just say "failed to fetch player data" :(
  if (!response.ok) {
    throw new Error (`Error fetching player info: ${response.status} ${response.statusText}`);
  }
  const playerData = await response.json();

    const username = playerData.player.displayname;
    const rank = playerData.player.newPackageRank;
    const monthlyRank = playerData.player.monthlyPackageRank;
    const monthlyRankColor = playerData.player.monthlyRankColor;
    const plusColorString = playerData.player.rankPlusColor;
    const plusColorMap = new Map([["BLACK", "\u00A70"], ["DARK_BLUE", "\u00A71"], ["DARK_GREEN", "\u00A72"], ["DARK_AQUA", "\u00A73"], ["DARK_RED", "\u00A74"], ["DARK_PURPLE", "\u00A75"], ["GOLD", "\u00A76"], ["GRAY", "\u00A77"], ["DARK_GRAY", "\u00A78"], ["BLUE", "\u00A79"], ["GREEN", "\u00A7a"], ["AQUA", "\u00A7b"], ["RED", "\u00A7c"], ["LIGHT_PURPLE", "\u00A7d"], ["YELLOW", "\u00A7e"], ["WHITE", "\u00A7f"]]);
    
    const plusDisplay = plusColorMap.get(plusColorString) || "\u00A7c";
    
    let rankedName = username;

    if(monthlyRank == "SUPERSTAR")//mvp++
    {//TODO YT/STAFF RANKS
      if(monthlyRankColor == "GOLD") {//gold
        rankedName = `\u00A76[MVP${plusDisplay}++\u00A76] ${username}`;
      }
      else {//aqua
        rankedName = `\u00A7b[MVP${plusDisplay}++\u00A7b] ${username}`;
      }
    }
    else//if not a mvp++
    {
      switch (rank) {
        case undefined://non
          rankedName = `\u00A77${username}`
          break;
        case "MVP_PLUS"://mvp+
          rankedName = `\u00A7b[MVP${plusDisplay}+\u00A7b] ${username}`;
          break;
        case "MVP"://mvp
          rankedName = `\u00A7b[MVP] ${username}`;
          break;
        case "VIP_PLUS"://vip+
          rankedName = `\u00A7a[VIP\u00A76+\u00A7a] ${username}`;
          break;
        case "VIP"://vip
          rankedName = `\u00A7a[VIP] ${username}`;
          break;
      }
    }
    
    return [rankedName.replaceColorCodes(), username];//username for <title>
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
  return cleanName;
}

function getColoredName(name) {
  const cleanName = getCleanName(name);
  const coloredName = cleanName.replaceColorCodes();
  return coloredName;
}

function getUncoloredName(name) {
  const cleanName = getCleanName(name);
  const uncoloredName = cleanName.replace(/\u00A7./g, '');
  
  return uncoloredName;
}

async function getActive() {
  const sortType = document.getElementById('sortOptions').value; 
  const output = document.getElementById('activeOutput');
  output.innerHTML = ''; // Clear previous results

  try {
    const response = await fetch(`https://housing-server-8aec.onrender.com/api/active`);
    if (!response.ok) throw new Error(`Failed to fetch active houses: ${response.status}`);
    const { lastUpdated, data } = await response.json();

    // Display last updated time
    const lastUpdatedTime = getDate(lastUpdated);
    const timeDiv = document.querySelector('.timetext');
    timeDiv.style.display = 'block';
    timeDiv.innerHTML = `Viewing data from: ${lastUpdatedTime}`;

    // Create all house divs in parallel
    const housePromises = data.map(async house => {
      const div = document.createElement('div');
      div.className = 'housecontainer';
      div.style.cursor = 'pointer';

      try {
        const playerRes = await fetch(`https://playerdb.co/api/player/minecraft/${house.owner}`, {
          headers: { 'User-Agent': YOUR_DOMAIN }
        });
        const playerData = await playerRes.json();
        const username = playerData.data.player.username;
        const headimg = 'https://mc-heads.net/head/' + house.owner;

        div.innerHTML = `
          <p class="clickable-copy copytext" onclick="copyText(this)">/visit ${username}</p>
          <a href="player/?${house.owner}"><img class='headimg' src="${headimg}"></a>
          <p class="coloredname"></p>
          <p class="nocursor playertext">${house.players} players</p>
          <p class="nocursor cookietext">${house.cookies.current} cookies</p>
        `;

        // Add colored house name
        div.querySelector(".coloredname").appendChild(getColoredName(house.name));

        // Make container clickable
        div.addEventListener('click', e => {
          if (!e.target.closest('a') && !e.target.closest('.clickable-copy')) {
            window.location.href = `house/?${house.uuid}`;
          }
        });

        return div;
      } catch (err) {
        div.innerHTML = `Error loading player data: ${err.message}`;
        return div;
      }
    });

    // Wait for all house divs to be ready
    const houseDivs = await Promise.all(housePromises);

    // Append all houses to output
    houseDivs.forEach(div => output.appendChild(div));

    // Show preoutput
    document.querySelector(".preoutput").hidden = true;

    // Trigger default sorting and filtering
    updateHousesDisplay();

  } catch (err) {
    output.innerHTML = `Error loading active houses: ${err.message}`;
  }
}


const searchInput = document.getElementById('houseSearch');
const sortSelect = document.getElementById('sortOptions');

function updateHousesDisplay() {
  const keyword = searchInput.value.toLowerCase();
  const sortBy = sortSelect.value;

  // Correct selector: match the divs you actually create
  const houseElements = Array.from(document.querySelectorAll('#activeOutput .housecontainer'));

  houseElements.forEach(el => {
    // Grab the elements that actually contain text
    const houseName = el.querySelector('.coloredname')?.textContent.toLowerCase() || '';
    const ownerName = el.querySelector('.clickable-copy')?.textContent.toLowerCase() || '';

    // Show or hide element based on search
    if (houseName.includes(keyword) || ownerName.includes(keyword)) {
      el.style.display = '';
    } else {
      el.style.display = 'none';
    }
  });

  // Sort if needed
  if (sortBy === 'cookies' || sortBy === 'guests') {
    const sorted = houseElements
      .filter(el => el.style.display !== 'none')
      .sort((a, b) => {
        const aVal = parseInt(
          sortBy === 'cookies' ? a.querySelector('.cookietext')?.textContent || '0' : a.querySelector('.playertext')?.textContent || '0'
        );
        const bVal = parseInt(
          sortBy === 'cookies' ? b.querySelector('.cookietext')?.textContent || '0' : b.querySelector('.playertext')?.textContent || '0'
        );
        return bVal - aVal; // descending
      });

    const container = document.getElementById('activeOutput');
    sorted.forEach(el => container.appendChild(el));
  }
}


// Event listeners
searchInput.addEventListener('input', updateHousesDisplay);
sortSelect.addEventListener('change', updateHousesDisplay);


async function getHouseData(houseId) {
  const output = document.getElementById('houseOutput');
  const container = document.createElement('div');

  try {
    const res = await fetch(`https://housing-server-8aec.onrender.com/api/house/${houseId}`);
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

    const playerRes = await fetch(`https://housing-server-8aec.onrender.com/api/playerinfo/${house.owner}`);
    if (!playerRes.ok) throw new Error("Failed to fetch player data");

    const [rankedname] = await getRankedName(house.owner);
    const headimg = 'https://mc-heads.net/head/' + house.owner;

    document.title = `${getUncoloredName(house.name)}`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = headimg;

container.innerHTML = `
  <div class="individualhouseinfo">
    <!-- House Name -->
    <p class="individualcoloredname"></p>

    <!-- Avatar and Owner Info -->
    <div style="display: flex; align-items: center; gap: 10px; margin-top: 5px;">
      <a href="../player/?${house.owner}">
        <img src="${headimg}" class="househeadimg" style="width: 50px; height: 50px;">
      </a>
      <p style="margin: 0;">| <strong> by </strong>
        <a class="coloredname nodecoration" href="../player/?${house.owner}">
          <span class="rankedname"></span>
        </a>
      </p>
    </div>

    <!-- House Stats -->
    <p style="margin-top: 10px; color: gray;">
      <span class="playertext">${house.players} players</span> |
      <span class="cookietext">${house.cookies.current} cookies</span>
    </p>


    <!-- Charts -->
    <div class="chart-row" style="display: flex; gap: 20px; margin-top:20px; margin-right:20px;">
      <div class="chart-container" style="flex:1;">
        <canvas class="chart" id="PlayersChart" width="350" height="180"></canvas>
      </div>
      <div class="chart-container" style="flex:1;">
        <canvas class="chart" id="CookiesChart" width="350" height="180"></canvas>
      </div>
    </div>
  </div>
`;

    container.querySelector(".individualcoloredname").appendChild(getColoredName(house.name));
    container.querySelector(".rankedname").appendChild(rankedname);
    document.getElementsByClassName("preoutput")[0].hidden = true;
    output.appendChild(container);

    if (!window.Chart) {
      const script = document.createElement('script');
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      document.head.appendChild(script);
      await new Promise(resolve => { script.onload = resolve; });
    }

    const chartRes = await fetch(`https://housing-server-8aec.onrender.com/api/history/${houseId}`);
    const history = await chartRes.json();
    const labels = history.map(entry => {
      const d = new Date(entry.date);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${mm}-${dd}`;
    });
    const cookiesData = history.map(entry => entry.cookies);
    const playersData = history.map(entry => entry.players);

    // players chart
    const playersCtx = container.querySelector('#PlayersChart').getContext('2d');
    new Chart(playersCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Players',
            data: playersData,
            borderColor: 'lightblue',
            backgroundColor: 'lightblue',
            borderWidth: 2,
            fill: false,
            pointRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: 'white',
              generateLabels: function(chart) {
                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = original(chart);
                labels.forEach(label => {
                  label.fontColor = 'white';
                });
                return labels;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: 'white' },
            grid: { color: '#8f8f8fff' },
            title: {
              display: true,
              text: 'Date',
              font: { padding: 4, size: 15, weight: 'bold', family: 'Arial' },
              color: 'white'
            }
          },
          y: {
            ticks: { color: 'white' },
            grid: { color: '#8f8f8fff' },
            title: {
              display: true,
              text: 'Players',
              font: { size: 15, weight: 'bold', family: 'Arial' },
              color: 'white'
            }
          }
        }
      }
    });

    // cookies chart
    const cookiesCtx = container.querySelector('#CookiesChart').getContext('2d');
    new Chart(cookiesCtx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Cookies',
            data: cookiesData,
            borderColor: '#e68142',
            backgroundColor: '#e68142',
            borderWidth: 2,
            fill: false,
            pointRadius: 7
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            labels: {
              color: 'white',
              generateLabels: function(chart) {
                const original = Chart.defaults.plugins.legend.labels.generateLabels;
                const labels = original(chart);
                labels.forEach(label => {
                  label.fontColor = 'white';
                });
                return labels;
              }
            }
          }
        },
        scales: {
          x: {
            ticks: { color: 'white' },
            grid: { color: '#8f8f8fff' },
            title: {
              display: true,
              text: 'Date',
              font: { padding: 4, size: 15, weight: 'bold', family: 'Arial' },
              color: 'white'
            }
          },
          y: {
            ticks: { color: 'white' },
            grid: { color: '#8f8f8fff' },
            title: {
              display: true,
              text: 'Cookies',
              font: { size: 15, weight: 'bold', family: 'Arial' },
              color: 'white'
            }
          }
        }
      }
    });

  } catch (err) {
    container.innerHTML = `Error loading house data: ${err.message}`;
    output.appendChild(container);
  }
}
async function getPlayerData(playerId) {
  const output = document.getElementById('playerOutput');

  try {
    const res = await fetch(`https://housing-server-8aec.onrender.com/api/houses/${playerId}`);
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

    const playerDataRes = await fetch(`https://housing-server-8aec.onrender.com/api/playerinfo/${playerId}`);
    if (!playerDataRes.ok) throw new Error("Failed to fetch player data");

    const [rankedname, username] = await getRankedName(playerId);
    const headimg = 'https://mc-heads.net/head/' + playerId;

    document.title = `${username}'s houses`;
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      document.head.appendChild(link);
    }
    link.href = headimg;

    const playerInfo = document.createElement('div');
    playerInfo.className = 'playerinfo';
    playerInfo.innerHTML = `
      <h2 id="forced" class="rankedname"></h2>
      <img src="${headimg}" alt="Player head">
    `;
    output.appendChild(playerInfo);
    playerInfo.querySelector(".rankedname").appendChild(rankedname);
houses.forEach(house => {
  const houseContainer = document.createElement('div');
  houseContainer.className = 'houseinfo';
  houseContainer.innerHTML = `
    <a class="nodecoration" href="../house/?${house.uuid}"><span class="coloredname"></span></a>
    <p class="playertext">${house.players} players</p>
    <p class="cookietext">${house.cookies.current} cookies</p>
  `;
  houseContainer.querySelector(".coloredname").appendChild(getColoredName(house.name));

  // Make the entire container clickable
  houseContainer.style.cursor = 'pointer';
  houseContainer.addEventListener('click', () => {
    window.location.href = `../house/?${house.uuid}`;
  });

  output.appendChild(houseContainer);
});


    document.getElementsByClassName("preoutput")[0].hidden = true;
  } catch (err) {
    output.innerHTML = `Error loading player data: ${err.message}`;
  }
}

function showNotification(message) {
  const notificationArea = document.getElementById('notification-area');
  const notification = document.createElement('div');
  notification.classList.add('notification');
  notification.innerText = message;
  notificationArea.appendChild(notification);

  requestAnimationFrame(() => {
    notification.classList.add('fade-in');
  });

  setTimeout(() => {
    notification.classList.remove('fade-in');
    notification.classList.add('fade-out');
    notification.addEventListener('transitionend', () => {
      notification.remove();
    }, { once: true });
  }, 2000);
}

function copyText(el) {
  const text = el.textContent.trim();
  navigator.clipboard.writeText(text)
      .then(() => {
          showNotification(`Copied ${text}`);
      })
      .catch(err => {
          console.error(`Copy of ${text} failed`, err);
          alert(`Copy of ${text} failed`);
      });
}