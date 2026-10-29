// Demo hosting (Netlify Forms) posts to "/". Set PUBLIC_FORM_ENDPOINT at build time to use another backend.
const ENDPOINT = import.meta.env.PUBLIC_FORM_ENDPOINT || '/';
const MAX_PHOTOS = 3;
const MAX_SIDE = 1600;

const form = document.getElementById('contact-form');
const input = document.getElementById('photos');
const title = document.getElementById('drop-title');
const hint = document.getElementById('drop-hint');
const send = document.getElementById('send');
const status = document.getElementById('status');

const defaults = { title: title.textContent, hint: hint.textContent, note: status.textContent };
let photos = [];

// Phone photos are often 5 MB+; Netlify accepts ~8 MB per submission, so shrink them first.
function shrink(file) {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => resolve(blob || file), 'image/jpeg', 0.85);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };
    img.src = url;
  });
}

input.addEventListener('change', () => {
  photos = Array.from(input.files).slice(0, MAX_PHOTOS);
  if (photos.length === 0) {
    title.textContent = defaults.title;
    hint.textContent = defaults.hint;
    return;
  }
  title.textContent = photos.length === 1 ? '1 foto añadida' : `${photos.length} fotos añadidas`;
  hint.textContent = photos.map((f) => f.name).join(' · ');
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  send.disabled = true;
  status.textContent = 'Enviando…';

  const data = new FormData(form);
  data.delete('photos');
  for (let i = 0; i < photos.length; i++) {
    const blob = await shrink(photos[i]);
    data.append(`foto${i + 1}`, blob, `foto${i + 1}.jpg`);
  }

  try {
    const res = await fetch(ENDPOINT, { method: 'POST', body: data });
    if (!res.ok) throw new Error(String(res.status));
    form.innerHTML =
      '<h3>Mensaje enviado</h3>' +
      '<p class="sub" style="margin-top:14px;font-size:16px;color:var(--soft)">Gracias. Karla recibió tu idea y te responderá personalmente por el medio que dejaste. Si no ves respuesta, revisa tu carpeta de spam.</p>';
  } catch {
    send.disabled = false;
    status.textContent = 'No se pudo enviar. Revisa tu conexión e inténtalo otra vez, o escríbenos por WhatsApp.';
  }
});
