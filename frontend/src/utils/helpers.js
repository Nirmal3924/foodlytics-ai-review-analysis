export function uniqueById(restaurants = []) {
  return Array.from(
    new Map(restaurants.filter(r => r?.id != null).map(r => [r.id, r])).values()
  )
}
