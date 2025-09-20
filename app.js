const app = document.getElementById("app");

let manifest = [];
let current = {slug:null, chapter:0, page:0};
let favorites = JSON.parse(localStorage.getItem('favorites')||'{}');
let comments = JSON.parse(localStorage.getItem('comments')||'{}');

async function loadManifest() {
    try {
        const res = await fetch('manhwa/manifest.json');
        manifest = await res.json();
        showHome();
    } catch(err) {
        app.innerHTML = "<h2>Failed to load manifest.json</h2>";
        console.error(err);
    }
}

function showHome() {
    let html = `<header><h1>Manhwa Reader</h1></header><div class="grid">`;
    for(const m of manifest){
        html += `<div class="card" onclick="openReader('${m.slug}')">
                    <img src="manhwa/${m.slug}/cover.jpg" onerror="this.src='manhwa/placeholder.png'"/>
                    <div class="title">${m.title}</div>
                 </div>`;
    }
    html += `</div>`;
    app.innerHTML = html;
}

function openReader(slug){
    const m = manifest.find(x=>x.slug===slug);
    if(!m) return;
    current.slug = slug; current.chapter=0; current.page=0;

    renderReader();
}

function renderReader(){
    const m = manifest.find(x=>x.slug===current.slug);
    const chapterNum = current.chapter+1;
    const pageNum = current.page+1;
    const url = `manhwa/${current.slug}/chapter-${chapterNum}/${pageNum}.jpg`;

    let html = `<header><h2>${m.title}</h2></header>
                <div class="reader">
                <button class="button" onclick="prevChapter()">Prev Chapter</button>
                <button class="button" onclick="nextChapter()">Next Chapter</button>
                <br>
                <img src="${url}" onerror="this.src='manhwa/placeholder.png'"/>
                <div>
                    <button class="button" onclick="prevPage()">Prev Page</button>
                    <button class="button" onclick="nextPage()">Next Page</button>
                </div>
                <div>
                    <button class="button" onclick="toggleFavorite()">Favorite: ${favorites[current.slug]? '★':'☆'}</button>
                </div>
                <div>
                    <textarea id="commentText" placeholder="Add a comment"></textarea>
                    <button class="button" onclick="addComment()">Post</button>
                </div>
                <div id="commentList"></div>
                </div>
                <button class="button" onclick="showHome()">Back Home</button>`;
    app.innerHTML = html;
    renderComments();
}

function prevChapter(){if(current.chapter>0){current.chapter--;current.page=0;renderReader();}}
function nextChapter(){const m = manifest.find(x=>x.slug===current.slug); if(current.chapter<m.chapters.length-1){current.chapter++;current.page=0;renderReader();}}
function prevPage(){if(current.page>0){current.page--;renderReader();}}
function nextPage(){const m = manifest.find(x=>x.slug===current.slug); if(current.page<m.chapters[current.chapter].pages-1){current.page++;renderReader();}}
function toggleFavorite(){favorites[current.slug]=!favorites[current.slug];localStorage.setItem('favorites',JSON.stringify(favorites));renderReader();}
function addComment(){const t = document.getElementById('commentText').value.trim(); if(!t) return; const id='c'+Date.now(); comments[id]={text:t, slug:current.slug}; localStorage.setItem('comments',JSON.stringify(comments)); document.getElementById('commentText').value=''; renderComments();}
function renderComments(){const list = Object.values(comments).filter(c=>c.slug===current.slug); let html=''; for(const c of list){html+=`<div>${c.text}</div>`;} document.getElementById('commentList').innerHTML=html;}

loadManifest();
