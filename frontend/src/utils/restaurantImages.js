const RESTAURANT_IMAGES = {
  ...import.meta.glob('../assets/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }),
  ...import.meta.glob('../assect/*.{jpg,jpeg,png,webp}', {
    eager: true,
    import: 'default',
  }),
}

const imageByRestaurantName = Object.entries(RESTAURANT_IMAGES).reduce((images, [path, src]) => {
  const fileName = path.split('/').pop() || ''
  const name = fileName.replace(/\.(jpe?g|png|webp)$/i, '')

  images[normalizeRestaurantName(name)] = src
  return images
}, {})

export function normalizeRestaurantName(name = '') {
  return name
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function getRestaurantImage(name) {
  return imageByRestaurantName[normalizeRestaurantName(name)]
}
