// Lightweight resolver: if a relative import ends with .js but a sibling .ts exists, use that.
// Otherwise delegate to Node resolution so we don't rely on Jest internals.
module.exports = (request, options) => {
  const origPath = request;
  if ((origPath.startsWith('./') || origPath.startsWith('../')) && origPath.endsWith('.js')) {
    const tsCandidate = origPath.replace(/\.js$/, '.ts');
    try {
      return require.resolve(tsCandidate, { paths: [options.basedir] });
    } catch {
      // ignore and fall through
    }
  }
  return require.resolve(origPath, { paths: [options.basedir] });
};
