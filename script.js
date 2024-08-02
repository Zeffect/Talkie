document.addEventListener('DOMContentLoaded', () => {
    const webhookURL = "https://discord.com/api/webhooks/1268890054827315326/5Hmoyf1DwaKg-HzIRl_K9UoKJpXP2l8B0-gVVAikwY9DXXwh8m91lnAfUzdHJrqwIMG3";
    const options = document.querySelectorAll('.select .option');
    const userInfo = document.getElementById('user-info');
    const userName = document.getElementById('user-name');
    const userPseudo = document.getElementById('user-pseudo');
    const userCanalInput = document.getElementById('user-canal-input');
    const userStatutSelect = document.getElementById('user-statut-select');

    function sendToDiscord(name, canal, statut) {
        const data = {
            content: JSON.stringify({ name, canal, statut })
        };

        fetch(webhookURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
    }

    async function loadUserDataFromDiscord() {
        try {
            const response = await fetch(`${webhookURL}?limit=1`);
            const messages = await response.json();
            if (messages && messages.length > 0) {
                const { content } = messages[0];
                const data = JSON.parse(content);
                updateCard(data.name, data.canal, data.statut);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données depuis Discord:', error);
        }
    }

    function saveUserData(name, canal, statut) {
        const storedData = JSON.parse(localStorage.getItem('userData')) || {};
        storedData[name] = { canal, statut };
        localStorage.setItem('userData', JSON.stringify(storedData));
        updateCard(name, canal, statut);
        sendToDiscord(name, canal, statut);
    }

    function updateCard(name, canal, statut) {
        const pre = document.querySelector(`.pre[data-name="${name}"]`);
        if (pre) {
            pre.querySelector('.canal').textContent = canal || '...';
            pre.querySelector('.statut').textContent = statut;
            pre.querySelector('.statut').innerHTML = `<img src="${statut === 'Connecté' ? 'en-ligne.png' : 'deconnecte.png'}" alt="">${statut}`;
        }
    }

    function initializeData() {
        const storedData = JSON.parse(localStorage.getItem('userData')) || {};
        Object.keys(storedData).forEach(name => {
            const { canal, statut } = storedData[name];
            updateCard(name, canal, statut);
        });
        loadUserDataFromDiscord();
    }

    options.forEach(option => {
        option.addEventListener('click', () => {
            const name = option.getAttribute('data-txt');
            if (name === 'Aucun') {
                userInfo.style.display = 'none';
            } else {
                const pre = document.querySelector(`.pre[data-name="${name}"]`);
                if (pre) {
                    userName.textContent = pre.querySelector('.name').textContent;
                    userPseudo.textContent = pre.querySelector('.pseudo').textContent;
                    const storedData = JSON.parse(localStorage.getItem('userData')) || {};
                    const userData = storedData[name] || {};
                    userCanalInput.value = userData.canal || '';
                    userStatutSelect.value = userData.statut || 'Connecté';
                    userInfo.style.display = 'block';
                }
            }
        });
    });

    userCanalInput.addEventListener('input', () => {
        const name = userName.textContent;
        const canal = userCanalInput.value.trim();
        const statut = userStatutSelect.value;
        if (name) {
            saveUserData(name, canal, statut);
        }
    });

    userStatutSelect.addEventListener('change', () => {
        const name = userName.textContent;
        const statutText = userStatutSelect.value;
        const canal = userCanalInput.value;
        if (name) {
            saveUserData(name, canal, statutText);
        }
    });

    initializeData();
});