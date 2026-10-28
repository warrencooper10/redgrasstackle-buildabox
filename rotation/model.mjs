// Banner 2 only. Shared merchandise catalog is read-only.
export function validateLineup(config, catalog) {
  if (!config || config.schemaVersion !== 2 || !Array.isArray(config.products) || config.products.length !== 10)
    throw Error('The Rotation requires exactly ten approved products');
  if (!Array.isArray(catalog)) throw Error('Missing catalog');
  const ids = new Set(), pairs = new Set(), images = new Set(), links = new Set();
  return config.products.map(p => {
    if (!p || !Number.isSafeInteger(p.id) || p.id < 1 || ids.has(p.id)) throw Error('Invalid or duplicate ID');
    const matches = catalog.filter(x => x.optionId === p.id);
    if (matches.length !== 1) throw Error('Missing or ambiguous catalog ID');
    const c = matches[0];
    if (!p.profile || !p.color || p.profile !== c.profile || p.color !== c.color || p.originalImage !== c.image)
      throw Error('Incorrect catalog mapping for ' + p.id);
    const pair = p.profile + '|' + p.color;
    if (pairs.has(pair) || images.has(p.originalImage)) throw Error('Duplicate merchandise');
    if (!/^assets\/images\/[\w.-]+\.(jpg|jpeg|png)$/i.test(p.originalImage) || p.image !== 'rotation/assets/' + p.id + '.webp')
      throw Error('Malformed GitHub image');
    const url = new URL(p.url), catalogURL = new URL(c.bigCartelUrl);
    if (url.origin !== 'https://redgrasstackle.bigcartel.com' || url.search || url.hash || url.username || url.password || !/^\/product\/[a-z0-9-]+$/.test(url.pathname) || url.pathname !== catalogURL.pathname || links.has(p.url))
      throw Error('Incorrect shopping destination');
    const compact = s => s.toLowerCase().replace(/[^a-z0-9]/g,'');
    const colorSlug = compact(p.color === 'True Minnow' ? 'Minnow' : p.color);
    const type = /Chubby/.test(p.profile) ? 'chubby' : /Skinny/.test(p.profile) ? 'skinny' : /BA Split/.test(p.profile) ? 'basplit' : /Ribbed/.test(p.profile) ? 'ribbedpaddle' : /Flicker/.test(p.profile) ? 'flicker' : null;
    if (!type || !compact(url.pathname).includes(type) || !compact(url.pathname).endsWith(colorSlug))
      throw Error('Product URL does not match the profile and color');
    if (!p.verifiedTitle || !/^\d{4}-\d{2}-\d{2}T/.test(p.verifiedAt || '') || !Number.isFinite(Date.parse(p.verifiedAt)))
      throw Error('Unverified shopping destination');
    ids.add(p.id); pairs.add(pair); images.add(p.originalImage); links.add(p.url);
    return Object.freeze({...p});
  });
}
export async function resolveFeed(fetcher, {baseline, catalog, cached, preflight = async () => {}}) {
  let previous;
  try { previous = validateLineup(cached, catalog); } catch {}
  const fallback = previous || validateLineup(baseline, catalog);
  try {
    const response = await fetcher();
    if (!response.ok) throw Error('Lineup feed unavailable');
    const config = await response.json();
    const products = validateLineup(config, catalog);
    await preflight(products);
    return {products, config, source:'remote'};
  } catch (error) {
    return {products:fallback, config:previous ? cached : baseline, source:previous ? 'last-known-good' : 'bundled', warning:String(error.message)};
  }
}
