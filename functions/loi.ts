interface LocationData {
  locations: Location[]
  extraInfo: ExtraInfo
}

type Location = {
  name: string
  address: string
  startTime: string
  endTime: string
  todo: string
  publishedAt: string
  updatedAt: string
  latitude: string
  longitude: string
  city: string
  suburb: string
  showHealthlineLinks: boolean
  eventId: string
  exposureType: string
}

type ExtraInfo = {
  total: number
  filtered: number
  cityList: string[]
  suburbList: string[]
}

async function getLocationData(city?: string):Promise<LocationData> {
  const location = city || 'Christchurch'
  const url = `https://locations.covid19.health.nz/api/loi?search=&sort=expose%20time&order=DESC&city=${location}&suburb=All`
  const response = await fetch(url, {
    headers: {
      'content-type': 'application/json'
    }
  })

  return response.json()
}

export async function onRequest(ctx) {
  const request = ctx.request
  const cacheUrl = new URL(request.url)
  const DEBUG = cacheUrl.searchParams.get('debug') === 'true' ? true : false
  console.log(`DEBUG: ${DEBUG}`)
  const city = cacheUrl.searchParams.get('city') || 'Christchurch'
  const { timezone } = request.cf

  console.log(`City: ${city}, Timezone: ${timezone}`)

  // Construct the cache key from the cache URL
  const cacheKey = new Request(cacheUrl.toString(), request)
  const cache = caches.default

  // Check whether the value is already available in the cache
  // if not, you will need to fetch it from origin, and store it in the cache
  // for future access
  let response = await cache.match(cacheKey)

  if (!response || DEBUG) {
    // If not in cache, get it from origin
    const updated = new Date().toLocaleString('en-NZ', { hour12: false, timeZone: `${timezone}` })
    const { locations, extraInfo } = await getLocationData(city)
    const cityList = extraInfo.cityList
    // console.log(cityList)
    const hasLocations = locations.length
    const dateOptions = { hour12: false, timeZone: 'Pacific/Auckland' }
    const markup  = `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>NZ Locations of Interest | ${city}</title>
        <style>
          body { color: #333; font-family: sans-serif; }
          main { display: grid; height: 100vh; text-align: center; }
          h2 { margin-bottom: 0.5em; }
          h3, h4 { margin: 0.5em 0; }
          p { margin: 1em 0;}
        </style>
      </head>
      <body>
      <p>Last updated: ${updated}</p>
        <select id="cities" onchange="javascript:location.href=this.value;">
          <option value="">Change City</option>
          ${cityList.map(c => {
            return `<option value="?city=${c}" ${(c === city) ? `selected` : '' }>${c}</option>`
            }).join('')
          }
        </select>
      ${(hasLocations) ? `
        <ol class="locations">
          ${locations.map(location => {
            const warning = /close/i.test(location.exposureType) || /omicron/i.test(location.todo)
            const omicron = /omicron/i.test(location.todo)
            const startDate = new Date(location.startTime).toLocaleString('en-NZ', {...dateOptions, dateStyle: 'full'})
            const startTime = new Date(location.startTime).toLocaleString('en-NZ', {...dateOptions, timeStyle: 'short'})
            const endTime = new Date(location.endTime).toLocaleTimeString('en-NZ', {...dateOptions, timeStyle: 'short'})

            return `
              <li>
                  <h2>${location.name}</h2>
                  <h3>📆 ${startDate}</h3>
                  <h3>⌚ ${startTime} – ${endTime}</h3>
                  <p>📍 ${location.address}</p>
                  <p style="${warning ? `color: red; text-transform: uppercase;` : ''}">
                    ${omicron ? '☣️  Omicron ☣️' : ''}
                  </p>
                  <p style="${warning ? `color: red;` : ''}">
                    ${warning ? `⚠️ ${location.todo}` : `${location.todo}`}
                  </p>
              </li>
            `}).join('')}
        </ol>`
        :
        `
        <main>
          <h1 style='font-size: 5rem; margin:auto;'>
            <span style='color: #00ad00;'>ALL CLEAR</span>
            <br>
            …
            <br>
            for now
            <br>
            <span style='font-size: 10rem;'>😷</span>
          </h1>
        `
      }
        </main>
        </body>
      </html>
    `

    // console.log(locations)
    // Must use Response constructor to inherit all of response's fields
    response = new Response(markup, response)

    // Cache API respects Cache-Control headers. Setting s-max-age to 900
    // will limit the response to be in cache for 900 seconds max

    if (!DEBUG) {
      // Any changes made to the response here will be reflected in the cached value
      response.headers.append("Cache-Control", "max-age=300, s-maxage=900")
    }
    response.headers.set("Content-Type", "text/html; charset=UTF-8")

    // Store the fetched response as cacheKey
    // Use waitUntil so you can return the response without blocking on
    // writing to cache
    ctx.waitUntil(cache.put(cacheKey, response.clone()))
  }
  return response
}

