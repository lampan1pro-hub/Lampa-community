document.addEventListener('DOMContentLoaded', () => {
    // --- Элементы DOM ---
    const usernameDisplay   = document.getElementById('username-display');
    const editProfileBtn    = document.getElementById('edit-profile-btn');
    const logoutBtn         = document.getElementById('logout-btn');
    const postTextarea      = document.getElementById('post-text');
    const postImageInput    = document.getElementById('post-image');
    const postBtn           = document.getElementById('post-btn');
    const postsContainer    = document.getElementById('posts-container');
    const loginBtn          = document.getElementById('login-btn'); // Кнопка входа
    const registerBtn       = document.getElementById('register-btn'); // Кнопка регистрации

    // --- Модальные окна ---
    const loginModal        = document.getElementById('login-modal');
    const registerModal     = document.getElementById('register-modal');
    const editProfileModal  = document.getElementById('edit-profile-modal');

    const closeModalBtns    = document.querySelectorAll('.close-button');
    const modalUsernameInput= document.getElementById('modal-username');
    const modalBioTextarea  = document.getElementById('modal-bio');
    const saveProfileBtn    = document.getElementById('save-profile-btn');

    // --- Login/Registration элементы ---
    const loginUsername     = document.getElementById('login-username');
    const loginPassword     = document.getElementById('login-password');
    const registerUsername  = document.getElementById('register-username');
    const registerPassword  = document.getElementById('register-password');
    const loginSubmitBtn    = document.getElementById('login-submit');
    const registerSubmitBtn = document.getElementById('register-submit');

    // --- Загрузка данных из localStorage ---
    let posts = JSON.parse(localStorage.getItem('posts')) || [];
    let users = JSON.parse(localStorage.getItem('users')) || []; // Хранилище пользователей
    let currentUser = JSON.parse(localStorage.getItem('currentUser')) || null; // Текущий пользователь

    // --- Утилита для сохранения в localStorage ---
    function saveData() {
        localStorage.setItem('posts', JSON.stringify(posts));
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }

    // --- Проверка авторизации ---
    function isAuthenticated() {
        return currentUser !== null && currentUser.username !== 'Гость';
    }

    // --- Отображение профиля ---
    function displayProfile() {
        if (isAuthenticated()) {
            usernameDisplay.textContent = currentUser.username;
            usernameDisplay.style.color = '#4361ee';
            editProfileBtn.style.display = 'inline-flex';
            logoutBtn.style.display = 'inline-flex';
            postBtn.style.display = 'inline-flex';
            postTextarea.disabled = false;
            postImageInput.disabled = false;
            loginBtn.style.display = 'none';
            registerBtn.style.display = 'none';
        } else {
            usernameDisplay.textContent = 'Гость';
            usernameDisplay.style.color = '#666';
            editProfileBtn.style.display = 'none';
            logoutBtn.style.display = 'none';
            postBtn.style.display = 'none';
            postTextarea.disabled = true;
            postImageInput.disabled = true;
            loginBtn.style.display = 'inline-flex';
            registerBtn.style.display = 'inline-flex';
        }
    }

    // --- Регистрация нового пользователя ---
    function registerUser() {
        const username = registerUsername.value.trim();
        const password = registerPassword.value;

        if (!username || !password) {
            alert('Заполните все поля!');
            return;
        }

        if (password.length < 6) {
            alert('Пароль должен содержать минимум 6 символов!');
            return;
        }

        // Проверка на существующего пользователя
        if (users.find(u => u.username === username)) {
            alert('Пользователь с таким именем уже существует!');
            return;
        }

        // Создаем нового пользователя
        const newUser = {
            username: username,
            password: password, // В реальном приложении хешировать!
            bio: '',
            likedPosts: [],
            joinDate: Date.now()
        };

        users.push(newUser);
        saveData();
        alert('Регистрация успешна! Теперь войдите в аккаунт.');
        closeModal('register-modal');
        openModal('login-modal');
    }

    // --- Вход пользователя ---
    function loginUser() {
        const username = loginUsername.value.trim();
        const password = loginPassword.value;

        if (!username || !password) {
            alert('Заполните все поля!');
            return;
        }

        const user = users.find(u => u.username === username && u.password === password);

        if (user) {
            currentUser = user;
            saveData();
            displayProfile();
            renderPosts();
            alert(`Добро пожаловать, ${username}!`);
            closeModal('login-modal');
        } else {
            alert('Неверное имя пользователя или пароль!');
        }
    }

    // --- Открытие/закрытие модальных окон ---
    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'flex';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    // --- Создание нового поста ---
    function createPost() {
        if (!isAuthenticated()) {
            alert('Войдите в аккаунт для публикации постов!');
            openModal('login-modal');
            return;
        }

        const text = postTextarea.value.trim();
        const imageFile = postImageInput.files[0];

        if (!text && !imageFile) {
            alert('Введите текст или выберите изображение.');
            return;
        }

        const post = {
            id: Date.now(),
            author: currentUser.username,
            text: text,
            imageUrl: null,
            likes: 0,
            likedBy: [],
            comments: []
        };

        function finalize() {
            posts.unshift(post);
            saveData();
            renderPosts();
            postTextarea.value = '';
            postImageInput.value = '';
        }

        if (imageFile) {
            const reader = new FileReader();
            reader.onload = e => {
                post.imageUrl = e.target.result;
                finalize();
            };
            reader.readAsDataURL(imageFile);
        } else {
            finalize();
        }
    }

    // --- Остальные функции без изменений ---
    function renderPosts() {
        postsContainer.innerHTML = '';
        if (posts.length === 0) {
            postsContainer.innerHTML = `
                <div class="empty-feed">
                    <p>Лента пуста. Будьте первым!</p>
                </div>`;
            return;
        }

        posts.forEach(post => {
            const isLiked = currentUser && currentUser.likedPosts.includes(post.id);
            const likeIcon = isLiked ? '❤️' : '🤍';

            const postEl = document.createElement('div');
            postEl.classList.add('post');
            postEl.innerHTML = `
                <div class="post-header">
                    <span class="post-author">${post.author}</span>
                    <span class="post-time">${formatTime(post.id)}</span>
                </div>
                ${post.imageUrl ? `<img src="${post.imageUrl}" class="post-image">` : ''}
                <div class="post-content">
                    <p>${post.text || ''}</p>
                </div>
                <div class="post-actions">
                    <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                        ${likeIcon} <span class="like-count">${post.likes}</span>
                    </button>
                    <button class="comment-btn" data-post-id="${post.id}">
                        💬 Комм. (${post.comments.length})
                    </button>
                </div>
                <div class="comments-section" id="comments-${post.id}" style="display:none;">
                    <h4>Комментарии:</h4>
                    <div class="add-comment">
                        <input type="text" placeholder="Комментарий…" data-post-id="${post.id}">
                        <button class="send-comment-btn" data-post-id="${post.id}">Отправить</button>
                    </div>
                    <div class="comments-list" id="comments-list-${post.id}">
                        ${renderComments(post.comments)}
                    </div>
                </div>`;
            postsContainer.appendChild(postEl);
        });
    }

    function formatTime(ts) {
        const d = Date.now() - ts;
        if (d < 60000) return 'только что';
        if (d < 3600000) return `${Math.floor(d/60000)} мин назад`;
        if (d < 86400000) return `${Math.floor(d/3600000)} ч назад`;
        return `${Math.floor(d/86400000)} дн назад`;
    }

    function renderComments(comments) {
        if (comments.length === 0) {
            return '<p class="no-comments">Нет комментариев</p>';
        }
        return comments
            .map(c => `<div class="comment"><strong>${c.author}:</strong> ${c.text}</div>`)
            .join('');
    }

    function likePost(postId) {
        if (!isAuthenticated()) {
            alert('Войдите для лайка постов!');
            openModal('login-modal');
            return;
        }

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const idxUserLiked = currentUser.likedPosts.indexOf(postId);
        const idxPostLiked  = post.likedBy.indexOf(currentUser.username);

        if (idxUserLiked > -1) {
            post.likes--;
            currentUser.likedPosts.splice(idxUserLiked, 1);
            post.likedBy.splice(idxPostLiked, 1);
        } else {
            post.likes++;
            currentUser.likedPosts.push(postId);
            post.likedBy.push(currentUser.username);
        }

        saveData();
        renderPosts();
    }

    function addComment(postId, text) {
        if (!isAuthenticated()) {
            alert('Войдите для комментариев!');
            openModal('login-modal');
            return;
        }

        const post = posts.find(p => p.id === postId);
        if (!post || !text.trim()) return;

        post.comments.push({
            author: currentUser.username,
            text: text.trim()
        });

        saveData();
        const list = document.getElementById(`comments-list-${postId}`);
        const btn  = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
        if (list) list.innerHTML = renderComments(post.comments);
        if (btn)  btn.textContent = `💬 Комм. (${post.comments.length})`;
    }

    function toggleComments(postId) {
        const sec = document.getElementById(`comments-${postId}`);
        if (!sec) return;
        const visible = sec.style.display === 'block';
        sec.style.display = visible ? 'none' : 'block';
        if (!visible) {
            const post = posts.find(p => p.id === postId);
            const list = document.getElementById(`comments-list-${postId}`);
            if (post && list) list.innerHTML = renderComments(post.comments);
        }
    }

    function saveProfile() {
        const newName = modalUsernameInput.value.trim() || 'Гость';
        const newBio  = modalBioTextarea.value.trim();

        posts.forEach(p => {
            if (p.author === currentUser.username) p.author = newName;
            p.comments.forEach(c => {
                if (c.author === currentUser.username) c.author = newName;
            });
        });

        currentUser.username = newName;
        currentUser.bio      = newBio;

        saveData();
        displayProfile();
        renderPosts();
        closeModal('edit-profile-modal');
    }

    // --- Обработчики событий ---
    postBtn.addEventListener('click', createPost);
    loginSubmitBtn.addEventListener('click', loginUser);
    registerSubmitBtn.addEventListener('click', registerUser);
    editProfileBtn.addEventListener('click', () => openModal('edit-profile-modal'));

    // Кнопки входа/регистрации
    loginBtn.addEventListener('click', () => openModal('login-modal'));
    registerBtn.addEventListener('click', () => openModal('register-modal'));

    // Закрытие модальных окон
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => {
        closeModal('login-modal');
        closeModal('register-modal');
        closeModal('edit-profile-modal');
    }));

    // Делегирование событий для постов
    postsContainer.addEventListener('click', e => {
        const pid = parseInt(e.target.dataset.postId);
        if (e.target.classList.contains('like-btn')) {
            likePost(pid);
        } else if (e.target.classList.contains('comment-btn')) {
            toggleComments(pid);
        } else if (e.target.classList.contains('send-comment-btn')) {
            const inp = document.querySelector(`input[data-post-id="${pid}"]`);
            if (inp) {
                addComment(pid, inp.value);
                inp.value = '';
            }
        }
    });

    postsContainer.addEventListener('keypress', e => {
        if (e.target.type === 'text' && e.key === 'Enter') {
            const pid = parseInt(e.target.dataset.postId);
            addComment(pid, e.target.value);
            e.target.value = '';
        }
    });

    window.addEventListener('click', e => {
        if (e.target.classList.contains('modal')) {
            closeModal('login-modal');
            closeModal('register-modal');
            closeModal('edit-profile-modal');
        }
    });

    // --- Инициализация ---
    displayProfile();
    renderPosts();
});