// ==UserScript==
// @name         2spi Core
// @version      1.0.0
// @description  Credits to d0t for some part of code
// @author       2spi
// @match        https://s0urce.io/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=s0urce.io
// @downloadURL  https://github.com/No0ne-15/2spiCore/raw/refs/heads/main/2spiCore.user.js
// @updateURL    https://github.com/No0ne-15/2spiCore/raw/refs/heads/main/2spiCore.user.js
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const raritiesVariables = {
        "var(--color-SSS)": "ethereal",
        "var(--color-SS)": "mythic",
        "var(--color-S)": "legendary",
        "var(--color-A)": "epic",
        "var(--color-B)": "rare",
        "var(--color-C)": "uncommon",
        "var(--color-D)": "common"
    }

    let hackedNpcCount = Number(localStorage.getItem("hackedNpcCount")) || 0;

    const drops = {
        common: Number(localStorage.getItem("commonDrops")) || 0,
        uncommon: Number(localStorage.getItem("uncommonDrops")) || 0,
        rare: Number(localStorage.getItem("rareDrops")) || 0,
        epic: Number(localStorage.getItem("epicDrops")) || 0,
        legendary: Number(localStorage.getItem("legendaryDrops")) || 0,
        mythic: Number(localStorage.getItem("mythicDrops")) || 0,
    };

    const rarityList = [
        "common", 
        "uncommon", 
        "rare", 
        "epic", 
        "legendary", 
        "mythic"
    ];

    const npcStatsDisplayConfig = {
        common: {
            name: "Common",
            color: "#9DA6B3" 
        },
        uncommon: {
            name: "Uncommon",
            color: "#98BE2E" 
        },
        rare: {
            name: "Rare",
            color: "#0092ED" 
        },
        epic: {
            name: "Epic",
            color: "#C92F7A"
        },
        legendary: {
            name: "Legendary",
            color: "#F49824"
        },
        mythic: {
            name: "Mythic",
            color: "#4ED0FF"
        },
    };

    const rates = {};
    rarityList.forEach(r => {
        rates[r] = hackedNpcCount ? ((drops[r] / hackedNpcCount) * 100).toFixed(2) : "0.00";
    });

    const sleep = (ms) => {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    // =====================================================================================================================================================
    
    // Compares the current date with the stored date and returns the Daily Balance stored in localStorage. Supports the use of alt accounts.
    function loadDailyBalance() {
        const accountName = document.querySelector('body > div > main > div:nth-child(1) > div:nth-child(3) > button:nth-child(1)').textContent;
        const currentBtcContainer = document.querySelector('body > div > main > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)');
        const currentBtc = parseFloat(currentBtcContainer.textContent.split(' BTC')[0]);
    
        const today = new Date().toLocaleDateString();
        const storedDate = localStorage.getItem(`DailyStartBalanceDate-${accountName}`);
    
        if (storedDate !== today) {
            localStorage.setItem(`DailyStartBalanceDate-${accountName}`, today);
            localStorage.setItem(`DailyStartBalance-${accountName}`, currentBtc);
        }
    
        return parseFloat(localStorage.getItem(`DailyStartBalance-${accountName}`));
    }
    
    // Create the display div for the balance change.
    function createDailyChangeDiv() {
        const targetLocation = document.querySelector('body > div:nth-child(1) > main > div:nth-child(1) > div:nth-child(2)');
    
        const newDiv = document.createElement('div');
        newDiv.classList.add('topbar-value', 'svelte-1azjldn');
        newDiv.style.cssText = 'display: flex; flex-direction: column; justify-content: center; align-items: center';
    
        const titleDiv = document.createElement('div');
        titleDiv.style.cssText = 'display: flex; flex-direction: row-reverse; justify-content: center; align-items: center; gap: 0.125rem';
        titleDiv.textContent = 'Daily Earnings';
    
        const btcIcon = document.createElement('img');
        btcIcon.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgoJPHBhdGggZD0iTTAgMGgxNnYxNkgweiIgZmlsbD0ibm9uZSIgLz4KCTxnIGZpbGw9IiNmNzkzMWEiPgoJCTxwYXRoIGQ9Ik0xLjUgMWEuNS41IDAgMCAxIC41LjVWMTRoMTIuNWEuNS41IDAgMCAxIDAgMWgtMTNhLjUuNSAwIDAgMS0uNS0uNXYtMTNhLjUuNSAwIDAgMSAuNS0uNSIgLz4KCQk8cGF0aCBkPSJNMTMuMDgxIDEuNjA2YTEgMSAwIDEgMSAxLjgzOC43ODhsLTMgN2ExIDEgMCAwIDEtMS40MzQuNDYzTDYuNTU0IDcuNDk4bC0xLjYwNiA0LjgxOGExIDEgMCAxIDEtMS44OTYtLjYzMmwyLTZsLjA0LS4xMDVhMSAxIDAgMCAxIDEuNDIzLS40MzZsNC4wMTcgMi40MXoiIC8+Cgk8L2c+Cjwvc3ZnPgo=';
        btcIcon.classList.add('icon', 'icon-in-text');
    
        const diffCounter = document.createElement('p');
        diffCounter.id = 'daily-btc-diff';
        diffCounter.style.fontSize = '0.875rem';
        diffCounter.textContent = `0.00000000 BTC`;
    
        titleDiv.appendChild(btcIcon);
        newDiv.appendChild(titleDiv);
        newDiv.appendChild(diffCounter);
        targetLocation.insertBefore(newDiv, targetLocation.firstChild.nextSibling);
    }
    
    // Calculate the live daily difference by subtracting the day's initial balance from the current balance, then update the display div.
    function updateDailyBalance() {
        const observerTarget = document.querySelector('body > div > main > div:nth-child(1) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)');
        const diffCounter = document.getElementById('daily-btc-diff');
    
        const observer = new MutationObserver(() => {
            let startBtcCount = loadDailyBalance();
            let liveBtcCount = parseFloat(observerTarget.textContent.split(' BTC')[0]);
            let  btcDiff = (liveBtcCount - startBtcCount).toFixed(8);
                
            if (btcDiff > 0) {
                diffCounter.style.color = '#70cf18';
                diffCounter.textContent = `+${btcDiff} BTC`;
            } else {
                diffCounter.style.color = '#eb8282';
                diffCounter.textContent = `${btcDiff} BTC`;
            }
        });
        
        observer.observe(observerTarget, { characterData: true, subtree: true, childList: true });
    }

    // Create HTML display for each NPC rarity drops.
    function insertNpcRateRows() {
        return rarityList.map(r => {
            const rarity = npcStatsDisplayConfig[r];
            return `
                <div style="width: 0.750rem; height: 0.750rem; border-radius: 50%; background: ${rarity.color}; flex-shrink: 0;"></div>
                <span style="font-size: 1.25rem; font-weight: 600; color: white; text-align: left">${rarity.name}</span>
                <div style="position: relative; height: 0.5rem; width: 8rem; background: #2e2e2e; border-radius: 3px; overflow: hidden;">
                    <div id="${r}Bar" style="position: absolute; left: 0; top: 0; height: 100%; width: ${rates[r]}%; background: ${rarity.color};"></div>
                </div>
                <span style="font-size: 1.25rem; font-weight: 600; text-align: right;"><span id="${r}Rate">${rates[r]}</span>%</span>
                <span style="font-size: 1.25rem; color: ${npcStatsDisplayConfig.common.color}; text-align: right;">(<span id="${r}Drops">${drops[r]}</span>)</span>
            `;
        }).join("");
    }

    // Create the button and the statistics container. Add event listeners to enable window dragging and include a functional close button.
    function createStatisticsWindow() {
        const desktopContainer = document.getElementById('desktop-container');
        const statsLogo = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxZW0iIGhlaWdodD0iMWVtIiB2aWV3Qm94PSIwIDAgMTYgMTYiPgoJPHBhdGggZD0iTTAgMGgxNnYxNkgweiIgZmlsbD0ibm9uZSIgLz4KCTxwYXRoIGZpbGw9IiNmZmYiIGQ9Ik0xLjc1IDEzLjI1VjEuNUguNXYxMmExLjI0IDEuMjQgMCAwIDAgMS4yMiAxSDE1LjV2LTEuMjV6IiAvPgoJPHBhdGggZmlsbD0iI2ZmZiIgZD0iTTMuMTUgOEg0LjR2My45SDMuMTV6bTMuMjYtNGgxLjI2djcuOUg2LjQxem0zLjI3IDJoMS4yNXY1LjlIOS42OHptMy4yNy0zLjVoMS4yNXY5LjRoLTEuMjV6IiAvPgo8L3N2Zz4K';

        const statsDesktopIcon = document.createElement('div');
        statsDesktopIcon.id = 'stats-button';
        statsDesktopIcon.ondragover = 'return true';
        statsDesktopIcon.draggable = true;
        statsDesktopIcon.style.cssText = 'position: relative; width: 153px; height: 85px; font-size: 16px; float: left;';
        statsDesktopIcon.innerHTML = `
                                    <div class="wrapper svelte-1ye0fc6">
                                        <div style="width: 100%; height: calc(100% - 20px); padding-bottom: 5px;">
                                            <img draggable="false" src="${statsLogo}" alt="Statistic Desktop Icon" class="svelte-1ye0fc6" style="height: 100%;">
                                        </div> 
                                        <div class="svelte-1ye0fc6" style="height: 20px; font-size: 16px;">Statistics</div>
                                    </div>`;

        desktopContainer.appendChild(statsDesktopIcon);

        let statsWindow = document.createElement('div');
        statsWindow.classList.add('window', 'svelte-1hjm43z');
        statsWindow.style.cssText = 'display: none; z-index: 99; left: 714.5px; top: 356px;';
        statsWindow.innerHTML = `
                                <div class="window-title svelte-1hjm43z" style="user-select: none;">
                                    <img draggable="false" class="icon icon-in-text" src="${statsLogo}" alt="Statistics"> Statistics 
                                    <button class="window-close svelte-1hjm43z" id="closeStats">
                                        <img draggable="false" class="icon" src="https://s0urce.io/icons/close.svg" alt="Close Icon">
                                    </button>
                                </div>
                                <div class="window-content svelte-1hjm43z" style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;">
                                    <div style="display: flex; flex-direction: column; align-items: center; gap: 1.25rem; padding: 1rem 1.25rem; border-radius: 0.5rem; background-color: #1a1a1a; border: 1px solid #2e2e2e;">
                                        <div style="text-align: center;">
                                            <h2 style="font-size: 2rem; font-weight: 700; margin: 0;">NPC Drop Rate</h2>
                                            <p style="font-size: 1.25rem; color: ${npcStatsDisplayConfig.common.color}; margin: 0.250rem 0 0;">Statistics for <span id="hackedNpcCount">${hackedNpcCount}</span> NPCs</p>
                                        </div>
                                        <div style="display: grid; grid-template-columns: auto auto 1fr auto auto; align-items: center; column-gap: 0.75rem; row-gap: 0.5rem;">
                                            ${insertNpcRateRows()}
                                        </div>
                                    </div>
                                    <h3 style="font-size: 1.25rem; font-weight: 700; text-align: center; margin: 0; color: ${npcStatsDisplayConfig.common.color};">more soon ...</h3>
                                </div>`;

        document.querySelector('main').appendChild(statsWindow);

        const statsTitleBar = statsWindow.querySelector('.window-title');
        let isDraggingStats = false;
        let dragOffsetX = 0;
        let dragOffsetY = 0;

        statsTitleBar.addEventListener('mousedown', (e) => {
            if (e.target.closest('#closeStats')) return;
            isDraggingStats = true;
            const rect = statsWindow.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDraggingStats) return;
            statsWindow.style.left = `${e.clientX - dragOffsetX}px`;
            statsWindow.style.top = `${e.clientY - dragOffsetY}px`;
        });

        document.addEventListener('mouseup', () => {
            isDraggingStats = false;
        });

        statsDesktopIcon.addEventListener('click', () => {
            statsWindow.style.display = 'block';
        });

        document.getElementById('closeStats').addEventListener('click', () => {
            statsWindow.style.display = 'none';
        });
    }

    // Detect new loot, add to the total count, and update the statistics window with the new drop rates.
    function updateStatisticsWindow() {
        const item = document.querySelector(".window-loot > div > div > div > div > div > .item")
        if (!item) return;
        
        let background = item.style.background
        let rarity = raritiesVariables[background];
        if (!rarity) rarity = raritiesVariables[background + ")"];

        if (drops[rarity] !== undefined) {
            hackedNpcCount++;
            drops[rarity]++;
            localStorage.setItem("hackedNpcCount", hackedNpcCount);
            localStorage.setItem(`${rarity}Drops`, drops[rarity]);
        }

        document.getElementById("hackedNpcCount").textContent = hackedNpcCount;

        rarityList.forEach(r => {
            rates[r] = hackedNpcCount ? ((drops[r] / hackedNpcCount) * 100).toFixed(2) : "0.00";
            document.getElementById(`${r}Rate`).textContent = rates[r];
            document.getElementById(`${r}Drops`).textContent = drops[r];
        });
    }

    function initStatisticsWindow() {
        createStatisticsWindow()
        const windowOpenObserver = new MutationObserver(async function (mutations) {
            const newWindow = mutations.find(e => {
                return e.target == document.querySelector("main") &&
                    e.addedNodes.length == 1 &&
                    e.addedNodes[0]?.classList?.contains("window") && e.addedNodes[0]?.classList?.contains("svelte-1hjm43z")
            })
    
            if (!newWindow)
                return;
    
            const isItem = newWindow.addedNodes[0].querySelector(".window-title > img[src='icons/loot.svg']")
    
            if (isItem) updateStatisticsWindow();
        });

        windowOpenObserver.observe(document, { attributes: false, childList: true, characterData: false, subtree: true });
    }

    // =====================================================================================================================================================

    (async () => {
        while (document.querySelector("#login-top") || window.location.href !== "https://s0urce.io/")
            await sleep(500);

        createDailyChangeDiv();
        initStatisticsWindow();
        await sleep(500);
        updateDailyBalance()
    })();
    
})();