// Entrypoint: registers all apps, boot sequence

window.Apps = window.Apps || {};
// Register apps here (examples, you should flesh out each file as you build)
Apps.texteditor = {title:'Text Editor', icon:'📝', open(){WindowManager.create(this);}, content(){return '<textarea style="width:100%;height:220px;"></textarea>';}};
// Repeat for other apps...

// Example launcher for games
Apps.games = { title: 'Games', icon:'🎮', open(){ WindowManager.create(this); }, content(){ return window.GAME_LIST.map(game=>`<button onclick="fetchAndOpenBlob('${game.url}')">${game.name}</button>`).join(''); } };

// Boot sequence
document.addEventListener('DOMContentLoaded', ()=>{
  // Register more apps or boot logic here
  // Example: Apps.fetcher.open();
});
