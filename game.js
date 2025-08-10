function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

document.getElementById('btn-solo').addEventListener('click', () => {
  showScreen('solo-screen');
  console.log('Lancer mode solo');
});

document.getElementById('btn-versus').addEventListener('click', () => {
  showScreen('versus-screen');
  console.log('Aller au mode versus');
});

document.getElementById('btn-settings').addEventListener('click', () => {
  showScreen('settings-screen');
  console.log('Ouvrir paramètres');
});
