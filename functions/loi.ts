export async function onRequest(ctx) {
  const init = {
    headers: {
      "content-type": "application/json;charset=UTF-8",
    },
  }
  const response = await fetch('https://locations.covid19.health.nz/api/loi?search=&sort=updated&order=DESC&city=Christchurch&suburb=All', init)
  const data = await response.json()
  const { locations } = data
  console.log(locations)

  return new Response(JSON.stringify(locations, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
