// データ構造
let shoppingLists = {
    default: {
        name: 'メインリスト',
        items: []
    }
};

let currentListId = 'default';
let stores = new Set(['']);
let purchaseHistory = [];

// ローカルストレージからデータを読み込む
function loadFromLocalStorage() {
    const savedLists = localStorage.getItem('shoppingLists');
    const savedStores = localStorage.getItem('stores');
    const savedHistory = localStorage.getItem('purchaseHistory');

    if (savedLists) {
        shoppingLists = JSON.parse(savedLists);
    }

    if (savedStores) {
        stores = new Set(JSON.parse(savedStores));
    }

    if (savedHistory) {
        purchaseHistory = JSON.parse(savedHistory);
    }
}

// ローカルストレージにデータを保存
function saveToLocalStorage() {
    localStorage.setItem('shoppingLists', JSON.stringify(shoppingLists));
    localStorage.setItem('stores', JSON.stringify([...stores]));
    localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory));
}

document.addEventListener('DOMContentLoaded', function () {
    // LIFF SDKの初期化
    liff.init({ liffId: '2007056252-3kdw45bE' }) // YOUR_LIFF_IDを実際のLIFF IDに置き換えます
        .then(() => {
            console.log("LIFF SDK initialized");
            if (!liff.isLoggedIn()) {
                document.getElementById('loginButton').style.display = 'block';
            } else {
                // すでにログインしている場合の処理
                initializeApp();
            }
        })
        .catch(err => {
            console.error("LIFF initialization failed", err);
            alert('LIFF SDKの初期化に失敗しました。ページを再読み込みしてください。');
        });

    // ログインボタンのクリックイベント
    document.getElementById('loginButton').addEventListener('click', function () {
        liff.login();
    });

    // タブ切り替え
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function () {
            const tabId = this.getAttribute('data-tab');

            // タブボタンのアクティブ状態を切り替え
            document.querySelectorAll('.tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');

            // タブコンテンツの表示を切り替え
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });

    // リスト選択の変更イベント
    document.getElementById('listSelector').addEventListener('change', function () {
        currentListId = this.value;
        renderShoppingList();
    });

    // 新しいリストボタンのクリックイベント
    document.getElementById('newListButton').addEventListener('click', function () {
        document.getElementById('newListModal').style.display = 'flex';
    });

    // リスト作成ボタンのクリックイベント
    document.getElementById('createListButton').addEventListener('click', function () {
        const listName = document.getElementById('newListName').value.trim();
        if (listName) {
            const listId = 'list_' + Date.now();
            shoppingLists[listId] = {
                name: listName,
                items: []
            };

            // リストセレクタを更新
            updateListSelector();

            // 新しいリストを選択
            document.getElementById('listSelector').value = listId;
            currentListId = listId;

            // リストを表示
            renderShoppingList();

            // モーダルを閉じる
            document.getElementById('newListModal').style.display = 'none';
            document.getElementById('newListName').value = '';

            // ローカルストレージに保存
            saveToLocalStorage();
        }
    });

    // モーダルの閉じるボタン
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    // モーダル外クリックで閉じる
    window.addEventListener('click', function (event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });

    // アイテム追加ボタンのクリックイベント
    document.getElementById('addItemButton').addEventListener('click', addItem);

    // カテゴリーフィルターの変更イベント
    document.getElementById('categoryFilter').addEventListener('change', renderShoppingList);

    // 店舗フィルターの変更イベント
    document.getElementById('storeFilter').addEventListener('change', renderShoppingList);

    // ステータスフィルターの変更イベント
    document.getElementById('statusFilter').addEventListener('change', renderShoppingList);

    // 共有ボタンのクリックイベント
    document.getElementById('shareButton').addEventListener('click', function () {
        document.getElementById('shareModal').style.display = 'flex';
    });

    // 友だちに共有ボタンのクリックイベント
    document.getElementById('shareFriendsButton').addEventListener('click', function () {
        shareWithFriends();
    });

    // グループに共有ボタンのクリックイベント
    document.getElementById('shareGroupButton').addEventListener('click', function () {
        shareWithGroup();
    });

    // リンク発行ボタンのクリックイベント
    document.getElementById('shareLinkButton').addEventListener('click', function () {
        generateShareLink();
    });

    // リンクコピーボタンのクリックイベント
    document.getElementById('copyLinkButton').addEventListener('click', function () {
        const linkInput = document.getElementById('shareLinkInput');
        linkInput.select();
        document.execCommand('copy');
        alert('リンクがコピーされました！');
    });

    // 購入済みアイテムを削除ボタンのクリックイベント
    document.getElementById('clearCompletedButton').addEventListener('click', function () {
        clearCompletedItems();
    });

    // 履歴フィルターボタンのクリックイベント
    document.getElementById('filterHistoryButton').addEventListener('click', function () {
        renderPurchaseHistory();
    });

    // ログアウトボタンのクリックイベント
    document.getElementById('logoutButton').addEventListener('click', function () {
        if (confirm('ログアウトしますか？')) {
            liff.logout();
            window.location.reload();
        }
    });
});

// アプリの初期化
function initializeApp() {
    // ユーザープロフィールを取得
    getProfile();

    // ローカルストレージからデータを読み込む
    loadFromLocalStorage();

    // URLパラメータをチェック（共有リンクからの遷移）
    checkUrlParams();

    // リストセレクタを更新
    updateListSelector();

    // 店舗フィルターを更新
    updateStoreFilter();

    // 買い物リストを表示
    renderShoppingList();

    // 購入履歴を表示
    renderPurchaseHistory();
}

// ユーザープロフィールを取得する関数
function getProfile() {
    liff.getProfile()
        .then(profile => {
            console.log("User profile:", profile);

            // プロフィール情報を表示
            document.getElementById('profileName').textContent = profile.displayName;
            document.getElementById('profileImage').src = profile.pictureUrl;
            document.getElementById('userProfile').style.display = 'flex';
        })
        .catch(err => {
            console.error("Error getting profile", err);
        });
}

// URLパラメータをチェック（共有リンクからの遷移）
function checkUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const sharedListId = urlParams.get('list');

    if (sharedListId && shoppingLists[sharedListId]) {
        currentListId = sharedListId;
        document.getElementById('listSelector').value = sharedListId;
    }
}

// リストセレクタを更新
function updateListSelector() {
    const listSelector = document.getElementById('listSelector');
    listSelector.innerHTML = '';

    for (const listId in shoppingLists) {
        const option = document.createElement('option');
        option.value = listId;
        option.textContent = shoppingLists[listId].name;
        listSelector.appendChild(option);
    }

    listSelector.value = currentListId;
}

// 店舗フィルターを更新
function updateStoreFilter() {
    const storeFilter = document.getElementById('storeFilter');
    storeFilter.innerHTML = '<option value="all">全ての店舗</option>';

    stores.forEach(store => {
        if (store) {
            const option = document.createElement('option');
            option.value = store;
            option.textContent = store;
            storeFilter.appendChild(option);
        }
    });
}

// アイテムを追加
function addItem() {
    const itemName = document.getElementById('itemInput').value.trim();
    const itemQuantity = document.getElementById('itemQuantity').value;
    const itemCategory = document.getElementById('itemCategory').value;
    const itemStore = document.getElementById('itemStore').value.trim();

    if (itemName) {
        const newItem = {
            id: Date.now().toString(),
            name: itemName,
            quantity: itemQuantity || 1,
            category: itemCategory || 'その他',
            store: itemStore || '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        shoppingLists[currentListId].items.push(newItem);

        // 店舗を追加
        if (itemStore) {
            stores.add(itemStore);
            updateStoreFilter();
        }

        // フォームをクリア
        document.getElementById('itemInput').value = '';
        document.getElementById('itemQuantity').value = '1';
        document.getElementById('itemCategory').value = '';
        document.getElementById('itemStore').value = '';

        // リストを再表示
        renderShoppingList();

        // ローカルストレージに保存
        saveToLocalStorage();
    }
}

// 買い物リストを表示
function renderShoppingList() {
    const shoppingList = document.getElementById('shoppingList');
    const categoryFilter = document.getElementById('categoryFilter').value;
    const storeFilter = document.getElementById('storeFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;

    shoppingList.innerHTML = '';

    if (!shoppingLists[currentListId]) {
        return;
    }

    const items = shoppingLists[currentListId].items;

    items.forEach(item => {
        // フィルター適用
        if (
            (categoryFilter === 'all' || item.category === categoryFilter) &&
            (storeFilter === 'all' || item.store === storeFilter) &&
            (statusFilter === 'all' ||
                (statusFilter === 'pending' && !item.completed) ||
                (statusFilter === 'completed' && item.completed))
        ) {
            const li = document.createElement('li');
            if (item.completed) {
                li.classList.add('completed');
            }

            const itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';

            const itemName = document.createElement('div');
            itemName.className = 'item-name';
            itemName.textContent = item.name;

            const itemDetails = document.createElement('div');
            itemDetails.className = 'item-details-text';
            itemDetails.textContent = `${item.quantity}個 | ${item.category}${item.store ? ' | ' + item.store : ''}`;

            itemInfo.appendChild(itemName);
            itemInfo.appendChild(itemDetails);

            const itemActions = document.createElement('div');
            itemActions.className = 'item-actions';

            const checkButton = document.createElement('button');
            checkButton.className = 'check-button';
            checkButton.innerHTML = '<i class="fas fa-check"></i>';
            checkButton.addEventListener('click', () => toggleItemComplete(item.id));

            const deleteButton = document.createElement('button');
            deleteButton.className = 'delete-button';
            deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
            deleteButton.addEventListener('click', () => deleteItem(item.id));

            itemActions.appendChild(checkButton);
            itemActions.appendChild(deleteButton);

            li.appendChild(itemInfo);
            li.appendChild(itemActions);

            shoppingList.appendChild(li);
        }
    });
}

// アイテムの完了状態を切り替え
function toggleItemComplete(itemId) {
    const items = shoppingLists[currentListId].items;
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        const item = items[itemIndex];
        item.completed = !item.completed;

        // 購入履歴に追加
        if (item.completed) {
            const historyItem = {
                ...item,
                completedAt: new Date().toISOString(),
                listName: shoppingLists[currentListId].name
            };
            purchaseHistory.push(historyItem);
        }

        // リストを再表示
        renderShoppingList();

        // ローカルストレージに保存
        saveToLocalStorage();
    }
}

// アイテムを削除
function deleteItem(itemId) {
    const items = shoppingLists[currentListId].items;
    const itemIndex = items.findIndex(item => item.id === itemId);

    if (itemIndex !== -1) {
        items.splice(itemIndex, 1);

        // リストを再表示
        renderShoppingList();

        // ローカルストレージに保存
        saveToLocalStorage();
    }
}

// 購入済みアイテムを削除
function clearCompletedItems() {
    const items = shoppingLists[currentListId].items;
    shoppingLists[currentListId].items = items.filter(item => !item.completed);

    // リストを再表示
    renderShoppingList();

    // ローカルストレージに保存
    saveToLocalStorage();
}

// 購入履歴を表示
function renderPurchaseHistory() {
    const historyList = document.getElementById('historyList');
    const dateFrom = document.getElementById('historyDateFrom').value;
    const dateTo = document.getElementById('historyDateTo').value;

    historyList.innerHTML = '';

    let filteredHistory = [...purchaseHistory];

    // 日付フィルター
    if (dateFrom) {
        const fromDate = new Date(dateFrom);
        filteredHistory = filteredHistory.filter(item => {
            const itemDate = new Date(item.completedAt);
            return itemDate >= fromDate;
        });
    }

    if (dateTo) {
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // その日の終わり
        filteredHistory = filteredHistory.filter(item => {
            const itemDate = new Date(item.completedAt);
            return itemDate <= toDate;
        });
    }

    // 日付でソート（新しい順）
    filteredHistory.sort((a, b) => {
        return new Date(b.completedAt) - new Date(a.completedAt);
    });

    // 履歴を表示
    filteredHistory.forEach(item => {
        const li = document.createElement('li');

        const historyDate = document.createElement('div');
        historyDate.className = 'history-date';
        const date = new Date(item.completedAt);
        historyDate.textContent = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;

        const itemName = document.createElement('div');
        itemName.className = 'item-name';
        itemName.textContent = item.name;

        const itemDetails = document.createElement('div');
        itemDetails.className = 'item-details-text';
        itemDetails.textContent = `${item.quantity}個 | ${item.category}${item.store ? ' | ' + item.store : ''} | ${item.listName}`;

        li.appendChild(historyDate);
        li.appendChild(itemName);
        li.appendChild(itemDetails);

        historyList.appendChild(li);
    });
}

// 友だちに共有
function shareWithFriends() {
    if (!liff.isLoggedIn()) {
        alert('ログインしてください。');
        return;
    }

    const list = shoppingLists[currentListId];
    const message = formatListForSharing(list);

    if (liff.isApiAvailable('shareTargetPicker')) {
        liff.shareTargetPicker([
            {
                type: 'text',
                text: message
            }
        ])
            .then(result => {
                if (result) {
                    alert('リストが共有されました！');
                } else {
                    console.log('ShareTargetPicker was cancelled by user');
                }
                document.getElementById('shareModal').style.display = 'none';
            })
            .catch(error => {
                console.error('Error sharing with ShareTargetPicker', error);
                alert('共有中にエラーが発生しました。');
            });
    } else {
        alert('このブラウザでは友だちへの共有機能がサポートされていません。');
    }
}

// グループに共有
function shareWithGroup() {
    if (!liff.isLoggedIn()) {
        alert('ログインしてください。');
        return;
    }

    const list = shoppingLists[currentListId];
    const message = formatListForSharing(list);

    if (liff.isApiAvailable('shareTargetPicker')) {
        liff.shareTargetPicker([
            {
                type: 'text',
                text: message
            }
        ])
            .then(result => {
                if (result) {
                    alert('リストが共有されました！');
                } else {
                    console.log('ShareTargetPicker was cancelled by user');
                }
                document.getElementById('shareModal').style.display = 'none';
            })
            .catch(error => {
                console.error('Error sharing with ShareTargetPicker', error);
                alert('共有中にエラーが発生しました。');
            });
    } else {
        alert('このブラウザでは友だちへの共有機能がサポートされていません。');
    }
}

// 共有リンクを生成
function generateShareLink() {
    const currentUrl = window.location.href.split('?')[0]; // パラメータを除いたURL
    const shareUrl = `${currentUrl}?list=${currentListId}`;

    document.getElementById('shareLinkInput').value = shareUrl;
    document.getElementById('shareLink').style.display = 'flex';
}

// リストを共有用にフォーマット
function formatListForSharing(list) {
    let message = `【シェア買い】${list.name}\n\n`;

    // カテゴリーごとにアイテムをグループ化
    const categorizedItems = {};

    list.items.forEach(item => {
        if (!categorizedItems[item.category]) {
            categorizedItems[item.category] = [];
        }
        categorizedItems[item.category].push(item);
    });

    // カテゴリーごとにアイテムを表示
    for (const category in categorizedItems) {
        message += `■ ${category}\n`;

        categorizedItems[category].forEach(item => {
            const status = item.completed ? '✓ ' : '□ ';
            message += `${status}${item.name} (${item.quantity}個)${item.store ? ' @ ' + item.store : ''}\n`;
        });

        message += '\n';
    }

    message += '------\nシェア買いで作成したお買い物リストです。';

    return message;
}