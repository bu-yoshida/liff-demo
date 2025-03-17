document.addEventListener('DOMContentLoaded', function () {
    // LIFF SDKの初期化
    liff.init({ liffId: '2007056252-3kdw45bE' }) // YOUR_LIFF_IDを実際のLIFF IDに置き換えます
        .then(() => {
            console.log("LIFF SDK:", typeof liff);
            if (!liff.isLoggedIn()) {
                document.getElementById('loginButton').style.display = 'block';
            } else {
                // すでにログインしている場合の処理
                getProfile();
            }
        })
        .catch(err => console.error(err));

    // ログインボタンのクリックイベント
    document.getElementById('loginButton').addEventListener('click', function () {
        liff.login();
    });

    // ユーザープロフィールを取得する関数
    function getProfile() {
        liff.getProfile()
            .then(profile => {
                console.log(profile);
                // プロフィール情報を表示する処理を追加
                document.getElementById('profileName').textContent = profile.displayName;
                document.getElementById('profileImage').src = profile.pictureUrl;
            })
            .catch(err => console.error(err));
    }
});

function shareList(message) {
    if (!liff.isLoggedIn()) {
        alert('ログインしてください。');
        return;
    }

    const userId = liff.getContext().userId;
    if (!userId) {
        alert('ユーザーIDを取得できませんでした。');
        return;
    }

    liff.getAccessToken()
        .then(accessToken => {
            const url = 'https://api.line.me/v2/bot/message/push';
            const payload = {
                to: userId,
                messages: [{
                    type: 'text',
                    text: message
                }]
            };

            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(payload)
            });
        })
        .then(response => {
            if (response.ok) {
                alert('リストが共有されました！');
            } else {
                alert('共有に失敗しました。');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('共有中にエラーが発生しました。');
        });
}

// 例: リスト共有ボタンのクリックイベント
document.getElementById('shareButton').addEventListener('click', function () {
    // リストの内容を取得する
    const shoppingList = document.getElementById('shoppingList');
    let listMessage = '';
    for (let i = 0; i < shoppingList.children.length; i++) {
        listMessage += shoppingList.children[i].textContent + '\n';
    }
    shareList(listMessage);
});
