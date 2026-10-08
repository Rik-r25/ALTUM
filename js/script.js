/* ==========================================================================
   ALTUM — сайт-визитка
   1. Телефон: на ПК копируем номер, на телефоне открываем набор номера
   2. Эффект нажатия для мыши и сенсорных экранов
   3. Уведомление «Номер скопирован»
   ========================================================================== */

(function () {
  'use strict';

  var toastEl = document.getElementById('toast');
  var toastTimer = null;


  /* ---------- Уведомление ---------- */

  function showToast(message) {
    if (!toastEl) return;

    toastEl.textContent = message;
    toastEl.classList.add('is-visible');

    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }


  /* ---------- Определяем: это телефон, с которого можно позвонить? ---------- */

  function isPhone() {
    var uaData = navigator.userAgentData;
    if (uaData && typeof uaData.mobile === 'boolean') {
      return uaData.mobile;
    }
    return /Android.+Mobile|iPhone|iPod|Windows Phone|IEMobile|BlackBerry|Opera Mini/i
      .test(navigator.userAgent);
  }


  /* ---------- Копирование в буфер обмена ---------- */

  function copyText(text) {
    // Современный способ (работает на https и localhost)
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    // Запасной способ (например, при открытии файла с диска или по http)
    return new Promise(function (resolve, reject) {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();

      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);

      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }


  /* ---------- 1. Телефонная ссылка ---------- */

  var phoneLink = document.querySelector('[data-action="phone"]');

  if (phoneLink && !isPhone()) {
    // ПК и планшеты: вместо звонка копируем номер
    var number = phoneLink.getAttribute('data-copy') ||
      phoneLink.getAttribute('href').replace(/^tel:/, '');

    phoneLink.setAttribute('title', 'Нажмите, чтобы скопировать номер');

    phoneLink.addEventListener('click', function (event) {
      event.preventDefault();

      copyText(number).then(
        function () { showToast('Номер скопирован'); },
        function () { showToast('Не удалось скопировать. Номер: ' + number); }
      );
    });
  }
  // На телефоне обработчик не нужен: ссылка tel: сама открывает набор номера.


  /* ---------- 2. Эффект нажатия ----------
     :active на iOS и части сенсорных экранов срабатывает ненадёжно,
     поэтому дублируем его классом .is-pressed. */

  var buttons = document.querySelectorAll('.btn');

  function press(el) { el.classList.add('is-pressed'); }
  function release(el) { el.classList.remove('is-pressed'); }

  Array.prototype.forEach.call(buttons, function (btn) {
    btn.addEventListener('pointerdown', function () { press(btn); });
    btn.addEventListener('pointerup', function () { release(btn); });
    btn.addEventListener('pointercancel', function () { release(btn); });
    btn.addEventListener('pointerleave', function () { release(btn); });
    btn.addEventListener('blur', function () { release(btn); });
  });
})();
