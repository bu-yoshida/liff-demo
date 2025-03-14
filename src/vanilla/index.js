        // Implement the LINE API call to share the message
        const accessToken = 'YOUR_ACCESS_TOKEN'; // Replace with your access token
        const url = 'https://api.line.me/v2/bot/message/push';
        const payload = {
            to: 'USER_ID_OR_GROUP_ID', // Replace with the user ID or group ID
            messages: [{
                type: 'text',
                text: message
            }]
        };

        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (response.ok) {
                alert('リストが共有されました！');
            } else {
                alert('共有に失敗しました。');
            }
        })
        .catch(error => console.error('Error:', error));
        document.addEventListener('DOMContentLoaded', function() {
            // LINE SDKの初期化
            liff.init({ liffId: 'YOUR_LIFF_ID' }) // YOUR_LIFF_IDを実際のLIFF IDに置き換えます
                .then(() => {
                    if (!liff.isLoggedIn()) {
                        document.getElementById('loginButton').style.display = 'block';
                    } else {
                        // すでにログインしている場合の処理
                        getProfile();
                    }
                })
                .catch(err => console.error(err));
        
            // ログインボタンのクリックイベント
            document.getElementById('loginButton').addEventListener('click', function() {
                liff.login();
            });
        
            // ユーザープロフィールを取得する関数
            function getProfile() {
                liff.getProfile()
                    .then(profile => {
                        console.log(profile);
                        // プロフィール情報を表示する処理を追加
                    })
                    .catch(err => console.error(err));
            }
        });
        function getAccessToken(authCode) {
            const url = 'https://api.line.me/oauth2/v2.1/token';
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('code', authCode);
            params.append('redirect_uri', 'https://line-app-demo-ry.netlify.app/'); // コールバックURLを指定
            params.append('client_id', '2007056252'); // チャネルIDを指定
            params.append('client_secret', '52c8d3ec77d63cfb9790a8e876812224'); // チャネルシークレットを指定
        
            return fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: params.toString(),
            })
            .then(response => response.json())
            .then(data => {
                console.log('アクセストークン:', data.access_token);
                return data.access_token;
            })
            .catch(err => console.error('アクセストークン取得エラー:', err));
        }
        function getProfile() {
            liff.getProfile()
                .then(profile => {
                    console.log(profile);
                    // プロフィール情報を表示する処理を追加
                    // 例: document.getElementById('profileName').textContent = profile.displayName;
                })
                .catch(err => console.error(err));
        }