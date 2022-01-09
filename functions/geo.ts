export async function onRequest(ctx) {
  const cf = ctx.request.cf;
  // pull out the geo data we're interested in
  const { city, latitude, longitude } = cf;
  const geodata = {
    city,
    latitude,
    longitude,
  };

  // log the whole cf object for debugging
  console.log(JSON.stringify(cf, null, 2));

  return new Response(JSON.stringify(geodata, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}
