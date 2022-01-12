// const validCities = ['Auckland', 'Bay of Islands', 'Bulls', 'Carterton', 'Christchurch', 'Feilding', 'Hamilton', 'Lower Hutt', 'Manawatu-Wanganui', 'Masterton', 'Mount Maunganui', 'New Plymouth', 'Opotiki', 'Orewa', 'Otaki', 'Otorohanga', 'Palmerston North', 'Papamoa', 'Queenstown', 'Rotorua', 'Takanini', 'Taupō', 'Tauranga', 'Waihi', 'Waihi Beach', 'Waimauku', 'Warkworth', 'Wellington']

export async function onRequest(ctx) {
  const event = ctx.event
  const request = ctx.request
  const url = new URL(request.url)
  const city = url.searchParams.get('city') || ''
  const location = city || 'Christchurch'
  const api = `https://locations.covid19.health.nz/api/loi?search=&sort=updated&order=DESC&city=${location}&suburb=All`
  console.log(city)
  let data = await fetch(api, {
    cf: {
      cacheTtl: 10,
      cacheEverything: true
    }
  })
  // console.log(response.body)

  let response = new Response(data.body, {
    'headers': {
      'content-type': 'application/json'
    }
  })
  response.headers.set("Cache-Control", "maxage=20")

  return response
}

