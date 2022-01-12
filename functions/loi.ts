// const validCities = ['Auckland', 'Bay of Islands', 'Bulls', 'Carterton', 'Christchurch', 'Feilding', 'Hamilton', 'Lower Hutt', 'Manawatu-Wanganui', 'Masterton', 'Mount Maunganui', 'New Plymouth', 'Opotiki', 'Orewa', 'Otaki', 'Otorohanga', 'Palmerston North', 'Papamoa', 'Queenstown', 'Rotorua', 'Takanini', 'Taupō', 'Tauranga', 'Waihi', 'Waihi Beach', 'Waimauku', 'Warkworth', 'Wellington']

async function getLocationData(city?: string) {
  const location = city || 'Christchurch'
  const url = `https://locations.covid19.health.nz/api/loi?search=&sort=updated&order=DESC&city=${location}&suburb=All`
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json'
    }
  })

  return response.json()
}

export async function onRequest(ctx) {
  const event = ctx.event
  const request = ctx.request
  const cacheUrl = new URL(request.url)
  const city = cacheUrl.searchParams.get('city') || ''
  console.log(city)

  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default

  // Check whether the value is already available in the cache
  // if not, you will need to fetch it from origin, and store it in the cache
  // for future access
  let response = await cache.match(cacheKey)

  if (!response) {
    // If not in cache, get it from origin
    const updated = new Date().toLocaleString('en-NZ', { hour12: false, timeZone: 'Pacific/Auckland' })
    const timestamp = new Date().toISOString()
    const { locations } = await getLocationData(city)
    const dateOptions = { hour12: false, timeZone: 'Pacific/Auckland' }
    const markup  = `
      <ol class="locations">
        ${locations.map(location => {
          const warning = /close/i.test(location.exposureType)
          const startTime = new Date(location.startTime).toLocaleString('en-NZ', {...dateOptions, dateStyle: 'full', timeStyle: 'short'})
          const endTime = new Date(location.endTime).toLocaleTimeString('en-NZ', {...dateOptions, timeStyle: 'short'})

          return `
            <li>
                <p>
                  <b>${location.name}</b><br>
                  ${startTime} – ${endTime}<br>
                  ${location.address}
                </p>
                <p style="${warning ? `color: red;` : ''}">
                  ${warning ? `⚠️ ${location.todo}` : `${location.todo}`}
                </p>
            </li>
          `}).join('')}
      </ol>
    `

    console.log(locations)
    // Must use Response constructor to inherit all of response's fields
    response = new Response(markup, response)

    // Cache API respects Cache-Control headers. Setting s-max-age to 900
    // will limit the response to be in cache for 900 seconds max

    // Any changes made to the response here will be reflected in the cached value
    response.headers.append("Cache-Control", "s-maxage=900")
    response.headers.set("Content-Type", "text/html; charset=UTF-8")

    // Store the fetched response as cacheKey
    // Use waitUntil so you can return the response without blocking on
    // writing to cache
    ctx.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}

