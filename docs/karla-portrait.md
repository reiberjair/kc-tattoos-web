# Karla portrait (story section)

The story section shows `public/img/karla/karla.webp` on the right, fixed while the text scrolls.
Until the file exists, a gold placeholder is shown.

For production use a real photo of Karla. A generated image of a made-up person must not be
presented as the real artist.

## Photo requirements
- Vertical, about 1200 x 1600 px, dark or black background (no cutout needed: the page fades the
  left and bottom edges into the background).
- Subject on the right half, face in the upper third, looking toward the camera or in profile
  facing left (toward the text).

## Prompt for a demo image (only for the client demo)
Editorial portrait photo of a female tattoo artist in her late twenties, three-quarter profile
facing left, looking at the camera, long straight black hair, warm light-brown skin, thin
gold-rimmed glasses, small gold nose ring, fine-line tattoos on her arms, black fitted top,
dark studio background, soft warm golden side light, shallow depth of field, 85 mm lens,
vertical 3:4, photorealistic, elegant and calm.

## Convert to WebP
Drop the PNG/JPG in `originales/` and ask Claude to export `public/img/karla/karla.webp`
(max 1200 px wide, quality ~80).
