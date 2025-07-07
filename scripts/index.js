let weapons = []; // 外部JSONから読み込まれる武器データ
let currentSeed = generateRandomSeed();
let currentRound = 1;
document.getElementById('seed').value = currentSeed;

// URLパラメータを取得して、シードとラウンドを設定
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const seed = urlParams.get('seed');
    const round = urlParams.get('round');
    if (seed) {
        currentSeed = seed;
        document.getElementById('seed').value = seed; // 追加
    }

    if (round) {
        currentRound = parseInt(round);
        document.getElementById('round').value = currentRound; // 追加
    }
}

// 初期化: JSONロード
fetch('buki.json')
    .then(response => response.json())
    .then(data => {
        weapons = data;
        getUrlParams(); // URLパラメータを取得して反映
        updateUrlParams(); // URLパラメータを更新
        generateMatch(); // 初回表示
    })
    .catch(error => {
        console.error("武器データの読み込みに失敗しました:", error);
        document.getElementById("result").innerText = "buki.json を読み込めませんでした。";
    });

function generateRandomSeed() {
    return Math.random().toString(36).substring(2, 12);
}

// URLパラメータを更新
function updateUrlParams() {
    const url = new URL(window.location);
    url.searchParams.set('seed', currentSeed);
    url.searchParams.set('round', currentRound);
    window.history.replaceState({}, '', url); // URLを更新（ページを再読み込みしない）
}

function generateMatch() {
    if (weapons.length === 0) return;

    let round = parseInt(document.getElementById('round').value);
    const seedInput = document.getElementById('seed').value;
    const seed = seedInput || currentSeed;
    const numPlayers = parseInt(document.getElementById('numPlayers').value);

    let attempt = 0;
    let teams;
    const maxAttempts = 100; // 無限ループ回避用

    while (attempt < maxAttempts) {
        const players = generatePlayerCodes(seed, numPlayers, round);
        teams = divideTeams(players, numPlayers);

        const teamAStrength = getTeamStrength(teams.teamA);
        const teamBStrength = getTeamStrength(teams.teamB);
        const diff = Math.abs(teamAStrength - teamBStrength);
        const threshold = numPlayers * 2;

        if (diff <= threshold) break;

        round++; // 試合数カウントを増やして再生成
        attempt++;
    }

    document.getElementById('round').value = round; // 更新されたラウンドを表示
    updateUrlParams(); // URLパラメータを更新
    displayTeams(teams, round, seed);
    document.getElementById('shareButton').disabled = false; // 共有ボタンを有効化
    document.getElementById('lineShareButton').disabled = false; // LINEシェアボタンを有効化
    document.getElementById('nextMatchButton').disabled = false; // 次の試合ボタンを有効化
}

// チームの強さ合計を計算
function getTeamStrength(team) {
    return team.reduce((sum, player) => {
        const str = parseInt(player.weapon.strength);
        return sum + (str === 0 ? 10 : str);
    }, 0);
}

// プレイヤーコードを生成
function generatePlayerCodes(seed, numPlayers, round) {
    const random = new Math.seedrandom(seed + round);
    const totalCodes = 48;
    const allCodes = [];

    for (let i = 0; i < totalCodes; i++) {
        const weapon = weapons[Math.floor(random() * weapons.length)];
        allCodes.push({
            playerId: i + 1,
            weapon: weapon
        });
    }

    return allCodes.slice(0, numPlayers);
}

// チーム分け
function divideTeams(players, numPlayers) {
    const teamA = [];
    const teamB = [];
    const mid = Math.ceil(numPlayers / 2);
    players.forEach((player, i) => {
        (i < mid ? teamA : teamB).push(player);
    });
    return { teamA, teamB };
}

// チームを表示
function displayTeams(teams, round, seed) {
    const result = document.getElementById('result');
    result.innerHTML = `<p class="hide">生成 ${round}（シード値: ${seed}）</p>`;
    const createList = (teamName, list) => `
        <h2>${teamName}</h2>
        <ul>
            ${list.map(p => `<li>${p.weapon.name} </li>`).join("")}
        </ul>`;
    result.innerHTML += createList("Team A", teams.teamA);
    result.innerHTML += createList("Team B", teams.teamB);
}

// クリップボードにURLをコピー
function copyToClipboard() {
    const url = window.location.href;
    const textArea = document.createElement("textarea");
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);

    alert("URLがコピーされました！"); // コピー後にアラート
}

// LINEでURLをシェア
function shareToLine() {
    const url = window.location.href;
    const lineUrl = `line://msg/text/${encodeURIComponent(url)}`;
    window.location.href = lineUrl; // LINEのシェア画面を開く
}

// 次の試合に進む
function nextMatch() {
    const roundInput = document.getElementById('round');
    roundInput.value = parseInt(roundInput.value) + 1;
    generateMatch(); // ラウンド値が変わったので、再生成
}

document.getElementById('increasePlayers').addEventListener('click', () => {
    const input = document.getElementById('numPlayers');
    let val = parseInt(input.value);
    if (val < 8) {
        input.value = val + 1;
        alert('注意！！\n\n人数確定後に生成するを選択してください。');
    }
});

document.getElementById('decreasePlayers').addEventListener('click', () => {
    const input = document.getElementById('numPlayers');
    let val = parseInt(input.value);
    if (val > 2) {
        input.value = val - 1;
        alert('注意！！\n\n人数確定後に生成するを選択してください。');
    }
});
